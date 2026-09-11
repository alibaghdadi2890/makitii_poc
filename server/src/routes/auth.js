import { Router } from 'express'
import {
  MOCK_OTP,
  consumeOtp,
  createSession,
  createUser,
  destroySession,
  findUserByIdentifier,
  issueOtp,
  normaliseIdentifier,
  publicUser,
  requireUser,
} from '../auth.js'
import { db } from '../db.js'

export const authRoutes = Router()

authRoutes.post('/request-otp', (req, res) => {
  const { identifier: raw, fullName, mode } = req.body ?? {}

  if (mode !== 'register' && mode !== 'login') {
    return res.status(400).json({ error: 'invalid_mode' })
  }

  const identifier = normaliseIdentifier(raw)
  if (!identifier) return res.status(400).json({ error: 'invalid_identifier' })

  const existing = findUserByIdentifier(identifier)

  if (mode === 'register') {
    if (!fullName || String(fullName).trim().length < 2) {
      return res.status(400).json({ error: 'full_name_required' })
    }
    if (existing) return res.status(409).json({ error: 'identifier_taken' })
  } else if (!existing) {
    return res.status(404).json({ error: 'user_not_found' })
  }

  const { expiresAt } = issueOtp({ identifier, purpose: mode, fullName })

  res.json({
    sent: true,
    channel: identifier.kind,
    identifier: identifier.value,
    expiresAt,
    // The prototype has no SMS or email gateway, so the code is returned
    // directly. A real deployment would never do this.
    devCode: MOCK_OTP,
  })
})

authRoutes.post('/verify-otp', (req, res) => {
  const identifier = normaliseIdentifier(req.body?.identifier)
  if (!identifier) return res.status(400).json({ error: 'invalid_identifier' })

  const result = consumeOtp({ identifier, code: req.body?.code })
  if (!result.ok) return res.status(400).json({ error: result.reason })

  let user = findUserByIdentifier(identifier)

  if (result.purpose === 'register') {
    // Guard the window between requesting and verifying a code, in which the
    // same identifier could have been registered by another request.
    if (user) return res.status(409).json({ error: 'identifier_taken' })
    user = createUser({ fullName: result.fullName ?? 'Utilisateur', identifier })
  } else if (!user) {
    return res.status(404).json({ error: 'user_not_found' })
  }

  const { token, expiresAt } = createSession(user.id)
  res.json({ token, expiresAt, user: publicUser(user) })
})

authRoutes.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'authentication_required' })
  const count = db
    .prepare("SELECT COUNT(*) AS n FROM ads WHERE user_id = ? AND status = 'active'")
    .get(req.user.id)
  res.json({ user: { ...publicUser(req.user), adCount: count.n } })
})

authRoutes.post('/logout', requireUser, (req, res) => {
  destroySession(req.token)
  res.json({ ok: true })
})
