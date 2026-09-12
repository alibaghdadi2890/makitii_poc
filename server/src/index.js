import express from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { attachUser } from './auth.js'
import { UPLOAD_DIR, db, dbPath } from './db.js'
import { authRoutes } from './routes/auth.js'
import { categoryRoutes } from './routes/categories.js'
import { adRoutes } from './routes/ads.js'
import { MAX_BYTES } from './images.js'

const PORT = Number(process.env.PORT ?? 3001)
const app = express()

app.use(express.json())
app.use(attachUser)

// Uploaded images are immutable — the filename is a fresh UUID on every write —
// so they can be cached hard.
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '30d',
    immutable: true,
    fallthrough: false,
  }),
)

app.get('/api/health', (_req, res) => {
  const ads = db.prepare("SELECT COUNT(*) AS n FROM ads WHERE status = 'active'").get().n
  const users = db.prepare('SELECT COUNT(*) AS n FROM users').get().n
  res.json({ ok: true, ads, users, database: dbPath })
})

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/ads', adRoutes)

app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }))

// In production the built front end (dist/) is served from this same process,
// so the container is one origin for the SPA, the API and the uploads.
const DIST_DIR = path.resolve(import.meta.dirname, '..', '..', 'dist')
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { maxAge: '1h', index: false }))
  app.use('/assets', express.static(path.join(DIST_DIR, 'assets'), { maxAge: '1y', immutable: true }))
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')))
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'file_too_large', maxBytes: MAX_BYTES })
  }
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'too_many_files' })
  }
  if (err.message === 'unsupported_image_type') {
    return res.status(400).json({ error: 'unsupported_image_type' })
  }
  if (err.status === 404) return res.status(404).json({ error: 'not_found' })

  console.error(err)
  res.status(500).json({ error: 'server_error' })
})

app.listen(PORT, () => {
  console.log(`Makitii API listening on http://localhost:${PORT}`)
  console.log(`Database: ${dbPath}`)
})
