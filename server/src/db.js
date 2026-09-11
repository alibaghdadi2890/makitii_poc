import { DatabaseSync } from 'node:sqlite'
import { readFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

export const SERVER_ROOT = path.resolve(import.meta.dirname, '..')
export const UPLOAD_DIR = path.join(SERVER_ROOT, 'uploads')
const DB_PATH = process.env.MAKITII_DB ?? path.join(SERVER_ROOT, 'makitii.db')

mkdirSync(UPLOAD_DIR, { recursive: true })

export const db = new DatabaseSync(DB_PATH)

// Applied on every boot — the schema file is written to be idempotent, which
// keeps the prototype free of a migration runner.
db.exec(readFileSync(path.join(import.meta.dirname, 'schema.sql'), 'utf8'))

export const dbPath = DB_PATH

/** Runs `fn` inside a transaction, rolling back if it throws. */
export function transaction(fn) {
  db.exec('BEGIN')
  try {
    const result = fn()
    db.exec('COMMIT')
    return result
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

export const nowIso = () => new Date().toISOString()

/** SQLite has no boolean type; rows come back as 0/1. */
export const bool = (value) => value === 1 || value === true
