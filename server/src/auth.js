import { randomUUID, randomBytes } from 'node:crypto'
import { db, nowIso } from './db.js'

/** The prototype's fixed one-time code. A real build would generate and send this. */
export const MOCK_OTP = '1234'
const OTP_TTL_MINUTES = 10
const SESSION_TTL_DAYS = 30

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Turns whatever the user typed into a canonical identifier, so that
 * "+224 622 45 18 90", "00224 622451890" and "622451890" all reach one account,
 * and email case never creates duplicates.
 */
export function normaliseIdentifier(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return null

  if (EMAIL_RE.test(value)) {
    return { kind: 'email', value: value.toLowerCase() }
  }

  let digits = value.replace(/\D/g, '')
  if (!digits) return null
  // Accept the country code written as 00224 or 224, and store the local part.
  if (digits.startsWith('00224')) digits = digits.slice(5)
  else if (digits.startsWith('224') && digits.length > 9) digits = digits.slice(3)
  digits = digits.replace(/^0+/, '')

  if (digits.length < 8 || digits.length > 12) return null
  return { kind: 'phone', value: digits }
}

export const findUserByIdentifier = (identifier) =>
  identifier.kind === 'email'
    ? db.prepare('SELECT * FROM users WHERE email = ?').get(identifier.value)
    : db.prepare('SELECT * FROM users WHERE phone = ?').get(identifier.value)

export function createUser({ fullName, identifier, verified = 1 }) {
  const user = {
    id: randomUUID(),
    full_name: fullName.trim(),
    email: identifier.kind === 'email' ? identifier.value : null,
    phone: identifier.kind === 'phone' ? identifier.value : null,
    // Completing the OTP proves control of the address or number, which is
    // exactly what the "verified seller" badge claims.
    verified: verified ? 1 : 0,
    created_at: nowIso(),
  }
  db.prepare(
    `INSERT INTO users (id, full_name, email, phone, verified, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(user.id, user.full_name, user.email, user.phone, user.verified, user.created_at)
  return user
}

export function issueOtp({ identifier, purpose, fullName }) {
  // Any earlier code for this identifier is spent, so a fresh request always
  // invalidates one that is still sitting in someone's inbox.
  db.prepare(
    'UPDATE otp_codes SET consumed_at = ? WHERE identifier = ? AND consumed_at IS NULL',
  ).run(nowIso(), identifier.value)

  const expires = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString()
  db.prepare(
    `INSERT INTO otp_codes (id, identifier, code, purpose, full_name, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(randomUUID(), identifier.value, MOCK_OTP, purpose, fullName ?? null, nowIso(), expires)

  return { code: MOCK_OTP, expiresAt: expires }
}

/**
 * Checks a submitted code and consumes it. Returns the pending registration name
 * so the caller can create the account in the same step.
 */
export function consumeOtp({ identifier, code }) {
  const row = db
    .prepare(
      `SELECT * FROM otp_codes
       WHERE identifier = ? AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
    )
    .get(identifier.value)

  if (!row) return { ok: false, reason: 'no_code' }
  if (new Date(row.expires_at) < new Date()) return { ok: false, reason: 'expired' }
  if (row.code !== String(code).trim()) return { ok: false, reason: 'invalid_code' }

  db.prepare('UPDATE otp_codes SET consumed_at = ? WHERE id = ?').run(nowIso(), row.id)
  return { ok: true, purpose: row.purpose, fullName: row.full_name }
}

export function createSession(userId) {
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000).toISOString()
  db.prepare(
    'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
  ).run(token, userId, nowIso(), expires)
  return { token, expiresAt: expires }
}

export const destroySession = (token) =>
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token)

function userForToken(token) {
  if (!token) return null
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get(token, nowIso())
  return row ?? null
}

const bearer = (req) => {
  const header = req.get('authorization') ?? ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null
}

/** Attaches `req.user` when a valid token is present; never rejects. */
export function attachUser(req, _res, next) {
  req.token = bearer(req)
  req.user = userForToken(req.token)
  next()
}

/** Guards routes that need a signed-in user. */
export function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'authentication_required' })
  next()
}

export const publicUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  phone: user.phone,
  verified: user.verified === 1,
  createdAt: user.created_at,
})
