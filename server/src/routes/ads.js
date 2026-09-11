import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { db, nowIso, transaction } from '../db.js'
import { requireUser } from '../auth.js'
import { MAX_PHOTOS, removeImage, storeImage, upload } from '../images.js'

export const adRoutes = Router()

const SORTS = {
  recent: 'a.created_at DESC',
  'price-asc': 'a.price_gnf ASC',
  'price-desc': 'a.price_gnf DESC',
}

const CONDITIONS = new Set(['new', 'like-new', 'used'])

const photoUrl = (filename) => `/uploads/${filename}`

function photosFor(adIds) {
  if (adIds.length === 0) return new Map()
  const placeholders = adIds.map(() => '?').join(',')
  const rows = db
    .prepare(
      `SELECT * FROM photos WHERE ad_id IN (${placeholders}) ORDER BY ad_id, position`,
    )
    .all(...adIds)

  const map = new Map()
  for (const row of rows) {
    if (!map.has(row.ad_id)) map.set(row.ad_id, [])
    map.get(row.ad_id).push({
      id: row.id,
      url: photoUrl(row.filename),
      credit: row.credit_license
        ? {
            title: row.credit_title,
            creator: row.credit_creator,
            license: row.credit_license,
            source: row.credit_source,
          }
        : null,
    })
  }
  return map
}

const shapeAd = (row, photos) => ({
  id: row.id,
  slug: row.slug,
  categoryId: row.category_id,
  subCategoryId: row.subcategory_id,
  fr: { title: row.title_fr, description: row.description_fr },
  en: { title: row.title_en, description: row.description_en },
  priceGnf: row.price_gnf,
  negotiable: row.negotiable === 1,
  condition: row.condition,
  location: row.location,
  featured: row.featured === 1,
  postedAt: row.created_at.slice(0, 10),
  photos: photos ?? [],
  seller: row.seller_name
    ? {
        name: row.seller_name,
        phone: row.seller_phone,
        memberSince: row.seller_since ? row.seller_since.slice(0, 10) : null,
        verified: row.seller_verified === 1,
      }
    : null,
})

const SELECT_AD = `
  SELECT a.*, u.full_name AS seller_name, u.phone AS seller_phone,
         u.verified AS seller_verified, u.created_at AS seller_since
  FROM ads a
  LEFT JOIN users u ON u.id = a.user_id
`

adRoutes.get('/', (req, res) => {
  const { category, sub, q, location, condition, maxPrice, sort } = req.query
  const limit = Math.min(Number(req.query.limit) || 60, 200)
  const offset = Math.max(Number(req.query.offset) || 0, 0)

  const where = ["a.status = 'active'"]
  const params = []

  if (category) {
    // Accept either the category id or its slug, so front-end routes that carry
    // a slug do not need a lookup before querying.
    where.push('(a.category_id = ? OR a.category_id = (SELECT id FROM categories WHERE slug = ?))')
    params.push(category, category)
  }
  if (sub) {
    where.push('a.subcategory_id = ?')
    params.push(sub)
  }
  if (location) {
    where.push('a.location = ?')
    params.push(location)
  }
  if (condition && CONDITIONS.has(String(condition))) {
    where.push('a.condition = ?')
    params.push(condition)
  }
  if (maxPrice) {
    where.push('a.price_gnf <= ?')
    params.push(Number(maxPrice))
  }
  if (q) {
    const like = `%${String(q).toLowerCase()}%`
    where.push(`(
      LOWER(a.title_fr) LIKE ? OR LOWER(a.title_en) LIKE ?
      OR LOWER(a.description_fr) LIKE ? OR LOWER(a.description_en) LIKE ?
      OR LOWER(a.location) LIKE ?
    )`)
    params.push(like, like, like, like, like)
  }

  const clause = `WHERE ${where.join(' AND ')}`
  const total = db.prepare(`SELECT COUNT(*) AS n FROM ads a ${clause}`).get(...params).n

  const rows = db
    .prepare(
      `${SELECT_AD} ${clause} ORDER BY ${SORTS[sort] ?? SORTS.recent} LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset)

  const photos = photosFor(rows.map((r) => r.id))
  res.json({
    total,
    items: rows.map((row) => shapeAd(row, photos.get(row.id))),
  })
})

adRoutes.get('/mine', requireUser, (req, res) => {
  const rows = db
    .prepare(`${SELECT_AD} WHERE a.user_id = ? ORDER BY a.created_at DESC`)
    .all(req.user.id)
  const photos = photosFor(rows.map((r) => r.id))
  res.json({ items: rows.map((row) => shapeAd(row, photos.get(row.id))) })
})

adRoutes.get('/:slug', (req, res) => {
  const row = db.prepare(`${SELECT_AD} WHERE a.slug = ?`).get(req.params.slug)
  if (!row) return res.status(404).json({ error: 'ad_not_found' })

  const photos = photosFor([row.id]).get(row.id) ?? []
  const attributes = db
    .prepare('SELECT * FROM ad_attributes WHERE ad_id = ? ORDER BY position')
    .all(row.id)
    .map((a) => ({ fr: a.label_fr, en: a.label_en, value: a.value }))

  res.json({ ad: { ...shapeAd(row, photos), attributes } })
})

/** `mon-super-velo`, made unique by suffixing when the slug is already taken. */
function uniqueSlug(title) {
  const base =
    String(title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'annonce'

  let slug = base
  let n = 2
  while (db.prepare('SELECT 1 FROM ads WHERE slug = ?').get(slug)) {
    slug = `${base}-${n}`
    n += 1
  }
  return slug
}

adRoutes.post('/', requireUser, upload.array('photos', MAX_PHOTOS), async (req, res, next) => {
  const stored = []
  try {
    const body = req.body ?? {}
    const title = String(body.title ?? '').trim()
    const description = String(body.description ?? '').trim()
    const categoryId = String(body.categoryId ?? '')
    const subCategoryId = body.subCategoryId ? String(body.subCategoryId) : null
    const location = String(body.location ?? '').trim()
    const price = Number(body.priceGnf ?? 0)

    const errors = {}
    if (title.length < 5) errors.title = 'too_short'
    if (description.length < 15) errors.description = 'too_short'
    if (!location) errors.location = 'required'
    if (!Number.isFinite(price) || price < 0) errors.priceGnf = 'invalid'
    if (!db.prepare('SELECT 1 FROM categories WHERE id = ?').get(categoryId)) {
      errors.categoryId = 'unknown'
    }
    if (
      subCategoryId &&
      !db
        .prepare('SELECT 1 FROM subcategories WHERE id = ? AND category_id = ?')
        .get(subCategoryId, categoryId)
    ) {
      errors.subCategoryId = 'unknown'
    }
    if (!req.files?.length) errors.photos = 'required'

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'validation_failed', fields: errors })
    }

    // Images are written before the transaction because sharp is async and
    // node:sqlite transactions are synchronous. Anything written here is removed
    // again if the insert then fails.
    for (const file of req.files) {
      stored.push(await storeImage(file.buffer))
    }

    const condition = CONDITIONS.has(String(body.condition)) ? String(body.condition) : 'used'
    const id = randomUUID()
    const slug = uniqueSlug(title)

    transaction(() => {
      db.prepare(
        `INSERT INTO ads (
           id, slug, user_id, category_id, subcategory_id,
           title_fr, title_en, description_fr, description_en,
           price_gnf, negotiable, condition, location, status, featured, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, ?)`,
      ).run(
        id,
        slug,
        req.user.id,
        categoryId,
        subCategoryId,
        // A single submission fills both languages: the prototype has no
        // translation step, so the text the seller typed is shown either way.
        title,
        title,
        description,
        description,
        Math.round(price),
        body.negotiable === 'false' || body.negotiable === false ? 0 : 1,
        condition,
        location,
        nowIso(),
      )

      stored.forEach((filename, index) => {
        db.prepare(
          'INSERT INTO photos (id, ad_id, filename, position) VALUES (?, ?, ?, ?)',
        ).run(randomUUID(), id, filename, index)
      })
    })

    const row = db.prepare(`${SELECT_AD} WHERE a.id = ?`).get(id)
    const photos = photosFor([id]).get(id) ?? []
    res.status(201).json({ ad: { ...shapeAd(row, photos), attributes: [] } })
  } catch (err) {
    await Promise.all(stored.map(removeImage))
    next(err)
  }
})
