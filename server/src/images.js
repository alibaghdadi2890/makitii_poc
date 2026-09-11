import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { unlink } from 'node:fs/promises'
import multer from 'multer'
import sharp from 'sharp'
import { UPLOAD_DIR } from './db.js'

export const MAX_PHOTOS = 6
export const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const WIDTH = 900
const HEIGHT = 675

/**
 * Files are buffered in memory rather than written straight to disk: every
 * upload is re-encoded by sharp anyway, so the only bytes that ever reach the
 * uploads directory are ones we produced ourselves.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: MAX_PHOTOS },
  fileFilter: (_req, file, cb) => {
    if (!ACCEPTED.has(file.mimetype)) {
      cb(Object.assign(new Error('unsupported_image_type'), { status: 400 }))
      return
    }
    cb(null, true)
  },
})

/**
 * Normalises one uploaded buffer to a 900x675 WebP on disk. Re-encoding caps the
 * file size, drops EXIF, fixes the aspect ratio the card grid expects, and makes
 * a malformed image fail here rather than in someone's browser.
 */
export async function storeImage(buffer) {
  const filename = `${randomUUID()}.webp`
  await sharp(buffer)
    .rotate() // honour EXIF orientation before it is stripped
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
    .webp({ quality: 80 })
    .toFile(path.join(UPLOAD_DIR, filename))
  return filename
}

/** Best-effort cleanup; a missing file is not an error worth failing a request over. */
export async function removeImage(filename) {
  try {
    await unlink(path.join(UPLOAD_DIR, filename))
  } catch {
    /* already gone */
  }
}
