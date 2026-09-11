import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useLang } from '../i18n/LanguageContext'
import { useToast } from '../components/Toast'
import { Icon } from '../components/Icon'
import type { TranslationKey } from '../i18n/translations'

/** Maps the server's error codes onto translated messages. */
const ERROR_KEYS: Record<string, TranslationKey> = {
  invalid_identifier: 'auth.errorIdentifier',
  full_name_required: 'auth.errorName',
  identifier_taken: 'auth.errorTaken',
  user_not_found: 'auth.errorNotFound',
  invalid_code: 'auth.errorInvalidCode',
  expired: 'auth.errorExpired',
  no_code: 'auth.errorExpired',
}

export function Auth({ mode }: { mode: 'login' | 'register' }) {
  const { t } = useLang()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [step, setStep] = useState<'identifier' | 'code'>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [fullName, setFullName] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLogin = mode === 'login'

  const describe = (err: unknown) => {
    if (err instanceof ApiError && ERROR_KEYS[err.code]) return t(ERROR_KEYS[err.code])
    return t('auth.errorGeneric')
  }

  const requestCode = async (event?: React.FormEvent) => {
    event?.preventDefault()
    setError(null)

    if (!identifier.trim()) return setError(t('auth.errorIdentifier'))
    if (!isLogin && fullName.trim().length < 2) return setError(t('auth.errorName'))

    setBusy(true)
    try {
      await api.requestOtp({
        identifier: identifier.trim(),
        fullName: isLogin ? undefined : fullName.trim(),
        mode,
      })
      setStep('code')
      setCode('')
    } catch (err) {
      setError(describe(err))
    } finally {
      setBusy(false)
    }
  }

  const verify = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const { token, user } = await api.verifyOtp({ identifier: identifier.trim(), code })
      signIn(token, user)
      toast(`${t('auth.welcome')}, ${user.fullName}`)
      navigate('/')
    } catch (err) {
      setError(describe(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="auth">
          <div className="auth__head">
            <h1>{isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}</h1>
            <p>{isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}</p>
          </div>

          {step === 'identifier' ? (
            <form className="panel" onSubmit={requestCode} noValidate>
              {!isLogin && (
                <div className="field">
                  <label htmlFor="a-name">{t('auth.fullName')}</label>
                  <input
                    id="a-name"
                    value={fullName}
                    autoComplete="name"
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="field">
                <label htmlFor="a-id">{t('auth.identifier')}</label>
                <input
                  id="a-id"
                  value={identifier}
                  placeholder="+224 6XX XX XX XX"
                  autoComplete="username"
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <span className="field__hint">{t('auth.identifierHint')}</span>
              </div>

              {error && (
                <span className="field__error" role="alert">
                  {error}
                </span>
              )}

              <button type="submit" className="btn btn--green btn--block" disabled={busy}>
                {busy ? t('auth.sending') : t('auth.sendCode')}
              </button>
            </form>
          ) : (
            <form className="panel" onSubmit={verify} noValidate>
              <div className="otp-head">
                <span>
                  {t('auth.codeSentTo')} <strong>{identifier}</strong>
                </span>
                <button type="button" className="link-button" onClick={() => setStep('identifier')}>
                  {t('auth.changeIdentifier')}
                </button>
              </div>

              <div className="field">
                <label htmlFor="a-code">{t('auth.code')}</label>
                <input
                  id="a-code"
                  className="otp-input"
                  value={code}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  autoFocus
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {error && (
                <span className="field__error" role="alert">
                  {error}
                </span>
              )}

              <button
                type="submit"
                className="btn btn--green btn--block"
                disabled={busy || code.length < 4}
              >
                {busy ? t('auth.verifying') : t('auth.verify')}
              </button>

              <button
                type="button"
                className="link-button link-button--centred"
                onClick={() => requestCode()}
                disabled={busy}
              >
                {t('auth.resend')}
              </button>

              <div className="demo-note">
                <Icon name="shield" size={14} />
                {t('auth.demoCode')} <strong style={{ marginLeft: 4 }}>1234</strong>
              </div>
            </form>
          )}

          <p className="auth__alt">
            {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
            <Link to={isLogin ? '/register' : '/login'}>
              {isLogin ? t('topbar.register') : t('topbar.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
