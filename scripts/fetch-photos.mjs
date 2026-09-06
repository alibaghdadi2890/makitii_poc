/**
 * Downloads a few public-domain photos per listing from Openverse and writes
 * them into `public/photos`, plus a `src/data/photos.json` manifest.
 *
 *   node scripts/fetch-photos.mjs [--force]
 *
 * Requests CC0, public-domain-mark, CC-BY and CC-BY-SA results. Restricting to
 * public domain alone shrinks the pool so far that results stop matching the
 * query, so attribution licences are included and every photo's creator and
 * licence are recorded in the manifest for the credits page.
 * Search results are cached under `scripts/.cache` so re-runs don't hammer the
 * API, and existing image files are skipped unless --force is passed.
 */
import { mkdir, readFile, writeFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { photoQueries } from './photo-queries.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'photos')
const CACHE_DIR = path.join(import.meta.dirname, '.cache')
const MANIFEST = path.join(ROOT, 'src', 'data', 'photos.json')

const PER_AD = 3
const WIDTH = 900
const HEIGHT = 675
const FORCE = process.argv.includes('--force')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJson(url, attempt = 1) {
  let res
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'makitii-poc/1.0 (prototype)' } })
  } catch (err) {
    // Network-level failures (DNS, reset connections) throw rather than
    // returning a status, and hit in runs long enough to exhaust the API's
    // anonymous budget — they need the same backoff as an HTTP 429.
    if (attempt > 5) throw err
    const wait = Math.min(60_000, 2_000 * 2 ** attempt)
    console.log(`   network error (${err.message}), waiting ${wait / 1000}s…`)
    await sleep(wait)
    return getJson(url, attempt + 1)
  }
  if (res.status === 429 || res.status >= 500) {
    if (attempt > 5) throw new Error(`giving up on ${url} (${res.status})`)
    const wait = Math.min(60_000, 2_000 * 2 ** attempt)
    console.log(`   rate limited (${res.status}), waiting ${wait / 1000}s…`)
    await sleep(wait)
    return getJson(url, attempt + 1)
  }
  if (!res.ok) throw new Error(`${res.status} for ${url}`)
  return res.json()
}

async function search(slug, query) {
  const cacheFile = path.join(CACHE_DIR, `${slug}.json`)
  if (existsSync(cacheFile)) {
    return JSON.parse(await readFile(cacheFile, 'utf8'))
  }
  const url =
    'https://api.openverse.org/v1/images/?' +
    new URLSearchParams({
      q: query,
      license: 'cc0,pdm,by,by-sa',
      page_size: '20',
      mature: 'false',
    })
  const json = await getJson(url)
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)

  const results = (json.results ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    creator: r.creator ?? null,
    license: `${r.license}${r.license_version ? ` ${r.license_version}` : ''}`,
    source: r.foreign_landing_url ?? r.url,
    url: r.url,
    // How many of the query's words appear in the result's own title. Openverse
    // matches on tags too, which is how a "german shepherd puppy" search can
    // return a lorry; ranking by title agreement filters most of that out.
    score: tokens.reduce(
      (n, w) => n + ((r.title ?? '').toLowerCase().includes(w) ? 1 : 0),
      0,
    ),
  }))
  results.sort((a, b) => b.score - a.score)
  await writeFile(cacheFile, JSON.stringify(results, null, 2))
  await sleep(700) // stay well inside the anonymous rate limit
  return results
}

async function download(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'makitii-poc/1.0 (prototype)' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const type = res.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) throw new Error(`not an image (${type})`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(CACHE_DIR, { recursive: true })

  const manifest = {}
  const entries = Object.entries(photoQueries)
  let downloaded = 0
  let reused = 0

  for (const [slug, query] of entries) {
    process.stdout.write(`• ${slug} … `)
    let results
    try {
      results = await search(slug, query)
    } catch (err) {
      console.log(`search failed: ${err.message}`)
      continue
    }

    // Results arrive sorted by title agreement, so the most relevant are tried
    // first; lower-scored ones remain as fallbacks rather than being discarded,
    // which otherwise leaves listings with no photo at all when links are dead.
    const saved = []
    for (const result of results) {
      if (saved.length >= PER_AD) break
      const index = saved.length + 1
      const file = `${slug}-${index}.webp`
      const dest = path.join(OUT_DIR, file)

      if (!FORCE && existsSync(dest)) {
        saved.push({ file, ...creditOf(result) })
        reused += 1
        continue
      }

      try {
        const buffer = await download(result.url)
        await sharp(buffer)
          .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
          .webp({ quality: 78 })
          .toFile(dest)
        saved.push({ file, ...creditOf(result) })
        downloaded += 1
      } catch (err) {
        // Dead links and odd formats are common in aggregated results; just
        // fall through to the next candidate.
        void err
      }
    }

    if (saved.length === 0) {
      console.log('no usable images')
      continue
    }
    manifest[slug] = saved
    console.log(`${saved.length} image(s)`)
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)

  const files = await readdir(OUT_DIR)
  let bytes = 0
  for (const f of files) bytes += (await stat(path.join(OUT_DIR, f))).size

  console.log(
    `\nDone. ${Object.keys(manifest).length}/${entries.length} listings have photos ` +
      `(${downloaded} downloaded, ${reused} reused). ` +
      `${files.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB total.`,
  )
}

function creditOf(result) {
  return {
    title: result.title ?? null,
    creator: result.creator,
    license: result.license,
    source: result.source,
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
