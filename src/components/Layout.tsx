import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logoUrl from '../assets/logo-makitii.png'
import { useCatalog } from '../api/CatalogContext'
import { useAuth } from '../auth/AuthContext'
import { useLang } from '../i18n/LanguageContext'
import { useFavorites } from '../hooks/useFavorites'
import { Icon } from './Icon'

function Logo({ variant }: { variant?: 'footer' }) {
  return (
    <Link to="/" className={`logo ${variant === 'footer' ? 'logo--footer' : ''}`} aria-label="Makitii">
      <img src={logoUrl} alt="Makitii" width={400} height={160} />
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

/** Shared by the top bar and the condensed sticky header. */
function useSearchSubmit() {
  const navigate = useNavigate()
  return (query: string, cat = '') => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (cat) params.set('cat', cat)
    navigate(`/search?${params.toString()}`)
  }
}

function TopBar() {
  const { t, pick } = useLang()
  const { ids } = useFavorites()
  const { categories } = useCatalog()
  const { user, signOut } = useAuth()
  const submitSearch = useSearchSubmit()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('')

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

        <form
          className="topbar__search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            submitSearch(query, cat)
          }}
        >
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
          <Link to="/favorites" className="fav-link" aria-label={t('nav.favorites')}>
            <Icon name="heart" size={16} />
            <span className="fav-label">{t('nav.favorites')}</span>
            {ids.length > 0 && <span className="fav-link__count">{ids.length}</span>}
          </Link>
          <span className="topbar__divider" />
          {user ? (
            <>
              <Link to="/my-ads" aria-label={t('account.myAds')}>
                <Icon name="user" size={16} />
                <span className="account-label">{user.fullName.split(' ')[0]}</span>
              </Link>
              <span className="topbar__divider" />
              <button type="button" className="topbar__signout" onClick={() => void signOut()}>
                {t('account.signOut')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" aria-label={t('topbar.signIn')}>
                <Icon name="user" size={16} />
                <span className="account-label">{t('topbar.signIn')}</span>
              </Link>
              <span className="topbar__divider" />
              <Link to="/register">{t('topbar.register')}</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const { pick } = useLang()
  const { categories } = useCatalog()
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

function Drawer({ onClose }: { onClose: () => void }) {
  const { t, pick } = useLang()
  const { categories } = useCatalog()
  const { user, signOut } = useAuth()
  const submitSearch = useSearchSubmit()
  const [drawerQuery, setDrawerQuery] = useState('')
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div
        className="drawer"
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.allCategories')}
      >
        <div className="drawer__head">
          <Logo />
          <button type="button" className="drawer__close" aria-label={t('nav.close')} onClick={onClose}>
            <Icon name="close" size={17} />
          </button>
        </div>

        <form
          className="drawer__search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            submitSearch(drawerQuery)
            onClose()
          }}
        >
          <Icon name="search" size={16} />
          <input
            type="search"
            value={drawerQuery}
            onChange={(e) => setDrawerQuery(e.target.value)}
            placeholder={t('topbar.searchPlaceholder')}
            aria-label={t('topbar.searchPlaceholder')}
          />
        </form>

        <div className="drawer__body">
          {categories.map((category) => (
            <details key={category.id} className="drawer__group">
              <summary>
                <Icon name={category.icon} size={17} />
                {pick(category)}
                <Icon name="chevron" size={15} className="drawer__chevron" />
              </summary>
              <ul>
                <li>
                  <Link to={`/c/${category.slug}`} onClick={onClose}>
                    {t('category.all')}
                  </Link>
                </li>
                {category.children.map((sub) => (
                  <li key={sub.id}>
                    <Link to={`/c/${category.slug}?sub=${sub.id}`} onClick={onClose}>
                      {pick(sub)}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <div className="drawer__foot">
          <Link to="/post" className="btn btn--green btn--block" onClick={onClose}>
            <Icon name="plus" size={16} />
            {t('nav.postAd')}
          </Link>
          {user ? (
            <>
              <Link to="/my-ads" className="btn btn--outline btn--block" onClick={onClose}>
                {t('account.myAds')}
              </Link>
              <button
                type="button"
                className="btn btn--outline btn--block"
                onClick={() => {
                  void signOut()
                  onClose()
                }}
              >
                {t('account.signOut')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--outline btn--block" onClick={onClose}>
                {t('topbar.signIn')}
              </Link>
              <Link to="/register" className="btn btn--outline btn--block" onClick={onClose}>
                {t('topbar.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function Header() {
  const { t, pick } = useLang()
  const { categories } = useCatalog()
  const [megaOpen, setMegaOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [stuck, setStuck] = useState(false)
  const [query, setQuery] = useState('')
  const wrapper = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const submitSearch = useSearchSubmit()

  useEffect(() => {
    setMegaOpen(false)
    setDrawerOpen(false)
  }, [location.pathname, location.search])

  // The condensed header takes over once the top bar has scrolled out of view.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 70)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!megaOpen) return
    const onClick = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setMegaOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMegaOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [megaOpen])

  const highlighted = ['vehicles', 'fashion', 'bazzar', 'madinah']
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  return (
    <>
      <header className={`header ${stuck ? 'is-stuck' : ''}`}>
        <div className="container header__inner">
          <Logo />

          <nav className="mainnav" aria-label="Primary">
            <div ref={wrapper}>
              <button
                type="button"
                className="mainnav__trigger"
                aria-expanded={megaOpen}
                onClick={() => setMegaOpen((v) => !v)}
              >
                {t('nav.allCategories')}
                <Icon name="chevron" size={15} />
              </button>
              {megaOpen && <MegaMenu onNavigate={() => setMegaOpen(false)} />}
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

          <form
            className="header__search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              submitSearch(query)
            }}
          >
            <Icon name="search" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('topbar.searchPlaceholder')}
              aria-label={t('topbar.searchPlaceholder')}
            />
          </form>

          <div className="header__actions">
            <Link to="/post" className="btn btn--green btn--post" title={t('nav.postAd')}>
              <Icon name="plus" size={16} />
              <span className="btn__label">{t('nav.postAd')}</span>
            </Link>
            <button
              type="button"
              className="burger"
              aria-label={t('nav.menu')}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && <Drawer onClose={() => setDrawerOpen(false)} />}
    </>
  )
}

function Footer() {
  const { t, pick } = useLang()
  const { categories } = useCatalog()
  const quickLinks: [string, string][] = [
    ['/about', t('footer.aboutUs')],
    ['/post', t('footer.postAd')],
    ['/contact', t('footer.contactUs')],
    ['/login', t('footer.login')],
    ['/register', t('footer.signUp')],
    ['/help', t('footer.help')],
    ['/safety', t('footer.safety')],
    ['/terms', t('footer.terms')],
    ['/privacy', t('footer.privacy')],
    ['/credits', t('footer.credits')],
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
          © {new Date().getFullYear()} <span>Makitii</span> — {t('footer.rights')} {t('footer.demoBadge')}
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
