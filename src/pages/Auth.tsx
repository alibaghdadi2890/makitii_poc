import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import { Icon } from '../components/Icon'

const EMAIL_OR_PHONE = /^([^\s@]+@[^\s@]+\.[^\s@]+|(\+?224)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2})$/

export function Auth({ mode }: { mode: 'login' | 'register' }) {
  const { t } = useLang()
  const [values, setValues] = useState({ name: '', id: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const set = (key: keyof typeof values, value: string) =>
    setValues((v) => ({ ...v, [key]: value }))

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (mode === 'register' && !values.name.trim()) next.name = t('post.required')
    if (!EMAIL_OR_PHONE.test(values.id.trim())) next.id = t('post.invalidEmail')
    if (values.password.length < 6) next.password = t('post.required')
    if (mode === 'register' && values.confirm !== values.password) next.confirm = t('post.required')
    setErrors(next)
    setSubmitted(Object.keys(next).length === 0)
  }

  const isLogin = mode === 'login'

  return (
    <div className="page">
      <div className="container">
        <div className="auth">
          <div className="auth__head">
            <h1>{isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}</h1>
            <p>{isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}</p>
          </div>

          <form className="panel" onSubmit={submit} noValidate>
            {submitted && (
              <div className="notice" style={{ marginBottom: 18 }}>
                <Icon name="check" size={18} strokeWidth={2.2} />
                <div>{t('auth.demoNotice')}</div>
              </div>
            )}

            {!isLogin && (
              <div className={`field ${errors.name ? 'field--error' : ''}`}>
                <label htmlFor="a-name">{t('auth.fullName')}</label>
                <input id="a-name" value={values.name} onChange={(e) => set('name', e.target.value)} />
                {errors.name && <span className="field__error">{errors.name}</span>}
              </div>
            )}

            <div className={`field ${errors.id ? 'field--error' : ''}`}>
              <label htmlFor="a-id">{t('auth.email')}</label>
              <input id="a-id" value={values.id} onChange={(e) => set('id', e.target.value)} />
              {errors.id && <span className="field__error">{errors.id}</span>}
            </div>

            <div className={`field ${errors.password ? 'field--error' : ''}`}>
              <label htmlFor="a-pass">{t('auth.password')}</label>
              <input
                id="a-pass"
                type="password"
                value={values.password}
                onChange={(e) => set('password', e.target.value)}
              />
              {errors.password && <span className="field__error">{errors.password}</span>}
            </div>

            {!isLogin && (
              <div className={`field ${errors.confirm ? 'field--error' : ''}`}>
                <label htmlFor="a-confirm">{t('auth.confirmPassword')}</label>
                <input
                  id="a-confirm"
                  type="password"
                  value={values.confirm}
                  onChange={(e) => set('confirm', e.target.value)}
                />
                {errors.confirm && <span className="field__error">{errors.confirm}</span>}
              </div>
            )}

            {isLogin && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                }}
              >
                <label className="check">
                  <input type="checkbox" />
                  {t('auth.remember')}
                </label>
                <a href="#" style={{ fontSize: 13, color: 'var(--green)' }}>
                  {t('auth.forgot')}
                </a>
              </div>
            )}

            <button type="submit" className="btn btn--green btn--block">
              {isLogin ? t('auth.loginButton') : t('auth.registerButton')}
            </button>

            <div className="demo-note">
              <Icon name="shield" size={14} />
              {t('auth.demoNotice')}
            </div>
          </form>

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
