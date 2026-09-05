import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { categories } from '../data/categories'
import { ads } from '../data/ads'
import { useLang } from '../i18n/LanguageContext'
import { Icon } from './Icon'

function Logo({ variant }: { variant?: 'footer' }) {
  return (
    <Link to="/" className={`logo ${variant === 'footer' ? 'logo--footer' : ''}`} aria-label="Makitii">
      <span className="logo__mark">M</span>
      <span className="logo__text">
        Mak<i>i</i>tii
      </span>
    </Link>
  )
}

function LanguageToggle() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="lang-toggle" role="group" aria-label={t('common.language')}>
      <button type="button" aria-pressed={lang === 'fr'} onClick={() => setLang('fr')}>
        FR
      </button>
      <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
        EN
      </button>
    </div>
  )
}

function TopBar() {
  const { t, pick } = useLang()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (cat) params.set('cat', cat)
    navigate(`/search?${params.toString()}`)
  }

  const tagline = t('topbar.tagline')
  const [before, after] = tagline.split(/10[\s,.]?000/)

  return (
    <div className="topbar">
      <div className="container topbar__inner">
        <p className="topbar__tagline">
          {before}
          <b>10 000</b>
          {after}
        </p>

        <form className="topbar__search" role="search" onSubmit={submit}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('topbar.searchPlaceholder')}
            aria-label={t('topbar.searchPlaceholder')}
          />
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label={t('topbar.allCategories')}>
            <option value="">{t('topbar.allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {pick(c)}
              </option>
            ))}
          </select>
          <button type="submit" className="btn">
            <Icon name="search" size={16} />
            {t('topbar.search')}
          </button>
        </form>

        <div className="topbar__auth">
          <LanguageToggle />
          <span className="topbar__divider" />
          <Link to="/login">
            <Icon name="user" size={16} />
            {t('topbar.signIn')}
          </Link>
          <span className="topbar__divider" />
          <Link to="/register">{t('topbar.register')}</Link>
        </div>
      </div>
    </div>
  )
}

function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const { pick } = useLang()
  return (
    <div className="mega">
      {categories.map((category) => (
        <div key={category.id} className="mega__col">
          <h4>
            <Icon name={category.icon} size={16} />
            <Link to={`/c/${category.slug}`} onClick={onNavigate}>
              {pick(category)}
            </Link>
          </h4>
          <ul>
            {category.children.map((sub) => (
              <li key={sub.id}>
                <Link to={`/c/${category.slug}?sub=${sub.id}`} onClick={onNavigate}>
                  {pick(sub)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function Header() {
  const { t, pick } = useLang()
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname, location.search])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const highlighted = ['vehicles', 'fashion', 'bazzar', 'madinah']
    .map((id) => categories.find((c) => c.id === id)!)
    .filter(Boolean)

  return (
    <header className="header">
      <div className="container header__inner">
        <Logo />

        <nav className="mainnav" aria-label="Primary">
          <div ref={wrapper}>
            <button
              type="button"
              className="mainnav__trigger"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {t('nav.allCategories')}
              <Icon name="chevron" size={15} />
            </button>
            {open && <MegaMenu onNavigate={() => setOpen(false)} />}
          </div>

          {highlighted.map((category) => (
            <NavLink
              key={category.id}
              to={`/c/${category.slug}`}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              {pick(category)}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <Link to="/post" className="btn btn--green">
            <Icon name="plus" size={16} />
            {t('nav.postAd')}
          </Link>
          <button type="button" className="burger" aria-label={t('nav.menu')} onClick={() => setOpen((v) => !v)}>
            <Icon name="menu" size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const { t, pick } = useLang()
  const quickLinks: [string, string][] = [
    ['/about', t('footer.aboutUs')],
    ['/post', t('footer.postAd')],
    ['/contact', t('footer.contactUs')],
    ['/login', t('footer.login')],
    ['/register', t('footer.signUp')],
  ]
  const helpLinks: [string, string][] = [
    ['/help', t('footer.help')],
    ['/safety', t('footer.safety')],
    ['/terms', t('footer.terms')],
    ['/privacy', t('footer.privacy')],
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Logo variant="footer" />
            <p style={{ marginTop: 16 }}>{t('footer.about')}</p>
            <h4 style={{ marginTop: 26, marginBottom: 0 }}>{t('footer.follow')}</h4>
            <div className="social">
              <a href="#" aria-label="Facebook">
                <Icon name="globe" size={17} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Icon name="briefcase" size={17} />
              </a>
              <a href="#" aria-label="Instagram">
                <Icon name="camera" size={17} />
              </a>
            </div>
          </div>

          <div>
            <h4>{t('footer.contact')}</h4>
            <ul className="footer__contact">
              <li>
                <i>
                  <Icon name="pin" size={17} />
                </i>
                <span>
                  <b>{t('footer.address')}</b>
                  {t('footer.addressValue')}
                </span>
              </li>
              <li>
                <i>
                  <Icon name="phoneCall" size={17} />
                </i>
                <span>
                  <b>{t('footer.phone')}</b>
                  +224 620 00 00 00
                </span>
              </li>
              <li>
                <i>
                  <Icon name="mail" size={17} />
                </i>
                <span>
                  <b>{t('footer.email')}</b>
                  contact@makitii.gn
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4>{t('footer.quickLinks')}</h4>
            <ul className="footer__links">
              {quickLinks.map(([to, label]) => (
                <li key={to}>
                  <Link to={to}>
                    <Icon name="arrow" size={13} />
                    {label}
                  </Link>
                </li>
              ))}
              {helpLinks.map(([to, label]) => (
                <li key={to}>
                  <Link to={to}>
                    <Icon name="arrow" size={13} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{t('footer.categories')}</h4>
            <ul className="footer__links">
              {categories.slice(0, 8).map((category) => (
                <li key={category.id}>
                  <Link to={`/c/${category.slug}`}>
                    <Icon name="arrow" size={13} />
                    {pick(category)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          © {new Date().getFullYear()} <span>Makitii</span> — {t('footer.rights')} {t('footer.demoBadge')}{' '}
          {ads.length} {t('section.adsCount')}.
        </div>
      </div>
    </footer>
  )
}

export function Layout() {
  const { t } = useLang()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#main">
        {t('common.skipToContent')}
      </a>
      <TopBar />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
