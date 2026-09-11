/**
 * Loads the prototype's sample content into SQLite.
 *
 *   node server/src/seed.js [--reset]
 *
 * Reads the taxonomy and listings straight from the front end's original data
 * modules (Node 24 imports TypeScript natively) and copies the committed photos
 * into the uploads directory. Idempotent: seeding a populated database does
 * nothing unless --reset is passed.
 */
import { copyFile, mkdir, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { db, transaction, UPLOAD_DIR } from './db.js'
import { normaliseIdentifier } from './auth.js'

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..')
const PHOTO_SOURCE = path.join(PROJECT_ROOT, 'public', 'photos')
const RESET = process.argv.includes('--reset')

// pathToFileURL matters on Windows: a bare "C:\..." path is not a valid ESM
// specifier, only a file:// URL is.
const dataModule = (name) =>
  import(pathToFileURL(path.join(PROJECT_ROOT, 'src', 'data', name)).href)

const { categories } = await dataModule('categories.ts')
const { ads } = await dataModule('ads.ts')
const photoManifest = JSON.parse(
  await readFile(path.join(PROJECT_ROOT, 'src', 'data', 'photos.json'), 'utf8'),
)

async function reset() {
  // Order matters only for readability; every child table cascades anyway.
  for (const table of ['photos', 'ad_attributes', 'ads', 'subcategories', 'categories', 'sessions', 'otp_codes', 'users']) {
    db.exec(`DELETE FROM ${table}`)
  }
  await rm(UPLOAD_DIR, { recursive: true, force: true })
  await mkdir(UPLOAD_DIR, { recursive: true })
}

function seedCategories() {
  const insertCategory = db.prepare(
    `INSERT INTO categories (id, slug, name_fr, name_en, icon, hue, position)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
  const insertSub = db.prepare(
    `INSERT INTO subcategories (id, category_id, slug, name_fr, name_en, position)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )

  categories.forEach((category, index) => {
    insertCategory.run(
      category.id,
      category.slug,
      category.fr,
      category.en,
      category.icon,
      category.hue,
      index,
    )
    category.children.forEach((sub, subIndex) => {
      insertSub.run(sub.id, category.id, sub.slug, sub.fr, sub.en, subIndex)
    })
  })
}

/**
 * Each distinct seller in the sample data becomes a real account, so seller
 * details on an ad always come from the users table rather than being copied
 * onto every listing.
 */
function seedSellers() {
  const byName = new Map()
  const insert = db.prepare(
    `INSERT INTO users (id, full_name, email, phone, verified, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )

  for (const ad of ads) {
    if (byName.has(ad.seller.name)) continue
    const identifier = normaliseIdentifier(ad.seller.phone)
    const id = randomUUID()
    insert.run(
      id,
      ad.seller.name,
      null,
      identifier?.value ?? null,
      ad.seller.verified ? 1 : 0,
      new Date(`${ad.seller.memberSince}T09:00:00Z`).toISOString(),
    )
    byName.set(ad.seller.name, id)
  }
  return byName
}

function seedAds(sellerIds) {
  const insertAd = db.prepare(
    `INSERT INTO ads (
       id, slug, user_id, category_id, subcategory_id,
       title_fr, title_en, description_fr, description_en,
       price_gnf, negotiable, condition, location, status, featured, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
  )
  const insertAttribute = db.prepare(
    `INSERT INTO ad_attributes (ad_id, label_fr, label_en, value, position)
     VALUES (?, ?, ?, ?, ?)`,
  )
  const insertPhoto = db.prepare(
    `INSERT INTO photos (id, ad_id, filename, position,
       credit_title, credit_creator, credit_license, credit_source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )

  const copies = []

  for (const ad of ads) {
    insertAd.run(
      ad.id,
      ad.slug,
      sellerIds.get(ad.seller.name) ?? null,
      ad.categoryId,
      ad.subCategoryId,
      ad.fr.title,
      ad.en.title,
      ad.fr.description,
      ad.en.description,
      ad.priceGnf,
      ad.negotiable ? 1 : 0,
      ad.condition,
      ad.location,
      ad.featured ? 1 : 0,
      new Date(`${ad.postedAt}T12:00:00Z`).toISOString(),
    )

    ad.attributes.forEach((attr, index) => {
      insertAttribute.run(ad.id, attr.fr, attr.en, attr.value, index)
    })

    const photos = photoManifest[ad.slug] ?? []
    photos.forEach((photo, index) => {
      insertPhoto.run(
        randomUUID(),
        ad.id,
        photo.file,
        index,
        photo.title,
        photo.creator,
        photo.license,
        photo.source,
      )
      copies.push(photo.file)
    })
  }

  return copies
}

async function main() {
  const populated = db.prepare('SELECT COUNT(*) AS n FROM ads').get().n > 0

  if (populated && !RESET) {
    console.log('Database already seeded — pass --reset to rebuild it.')
    return
  }

  if (RESET) {
    console.log('Clearing existing data…')
    await reset()
  }

  const copies = transaction(() => {
    seedCategories()
    const sellerIds = seedSellers()
    return seedAds(sellerIds)
  })

  // Photos are copied after the rows commit: a missing source file should leave
  // a listing without imagery, not abort the whole seed.
  let copied = 0
  let missing = 0
  await mkdir(UPLOAD_DIR, { recursive: true })
  for (const file of copies) {
    const source = path.join(PHOTO_SOURCE, file)
    if (!existsSync(source)) {
      missing += 1
      continue
    }
    await copyFile(source, path.join(UPLOAD_DIR, file))
    copied += 1
  }

  const counts = {
    categories: db.prepare('SELECT COUNT(*) AS n FROM categories').get().n,
    subcategories: db.prepare('SELECT COUNT(*) AS n FROM subcategories').get().n,
    users: db.prepare('SELECT COUNT(*) AS n FROM users').get().n,
    ads: db.prepare('SELECT COUNT(*) AS n FROM ads').get().n,
    photos: db.prepare('SELECT COUNT(*) AS n FROM photos').get().n,
  }

  console.log('Seeded:', counts)
  console.log(`Photos copied: ${copied}${missing ? ` (${missing} source files missing)` : ''}`)
}

await main()
