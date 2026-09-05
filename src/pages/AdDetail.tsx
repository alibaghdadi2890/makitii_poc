import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adBySlug, ads } from '../data/ads'
import { categoryById, subCategoryById } from '../data/categories'
import { useLang } from '../i18n/LanguageContext'
import { AdCard } from '../components/AdCard'
import { Icon } from '../components/Icon'
import { Thumb } from '../components/Thumb'
import { useFavorites } from '../hooks/useFavorites'

export function AdDetail() {
  const { slug } = useParams()
  const { t, pick, formatPrice, formatDate } = useLang()
  const { isFavorite, toggle } = useFavorites()
  const [variant, setVariant] = useState(0)
  const [phoneShown, setPhoneShown] = useState(false)

  const ad = adBySlug(slug ?? '')

  if (!ad) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty">
            <i>
              <Icon name="search" size={24} />
            </i>
            <h3>{t('ad.notFoundTitle')}</h3>
            <p>{t('ad.notFoundBody')}</p>
            <Link to="/" className="btn btn--green">
              {t('ad.backHome')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const category = categoryById(ad.categoryId)!
  const sub = subCategoryById(ad.categoryId, ad.subCategoryId)
  const copy = pick(ad)
  const saved = isFavorite(ad.id)
  const similar = ads
    .filter((a) => a.id !== ad.id && (a.subCategoryId === ad.subCategoryId || a.categoryId === ad.categoryId))
    .slice(0, 3)

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{t('common.breadcrumbHome')}</Link>
          <Icon name="chevron" size={13} />
          <Link to={`/c/${category.slug}`}>{pick(category)}</Link>
          {sub && (
            <>
              <Icon name="chevron" size={13} />
              <Link to={`/c/${category.slug}?sub=${sub.id}`}>{pick(sub)}</Link>
            </>
          )}
        </nav>

        <div className="ad-layout">
          <div>
            <div className="panel" style={{ marginBottom: 22 }}>
              <div className="gallery__main">
                <Thumb seed={ad.slug} category={category} variant={variant} ratio={0.6} />
              </div>
              <div className="gallery__thumbs">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-current={variant === i}
                    aria-label={`${copy.title} — ${i + 1}`}
                    onClick={() => setVariant(i)}
                  >
                    <Thumb seed={ad.slug} category={category} variant={i} ratio={0.72} />
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="ad-head">
                <h1>{copy.title}</h1>
                <div className="ad-price">{formatPrice(ad.priceGnf)}</div>
              </div>

              <div className="ad-meta">
                <span>
                  <Icon name="pin" size={14} />
                  {ad.location}
                </span>
                <span>
                  <Icon name="clock" size={14} />
                  {t('ad.published')} {formatDate(ad.postedAt)}
                </span>
                <span>
                  <Icon name="tag" size={14} />
                  {t('ad.reference')} #{ad.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="pill">{t(`condition.${ad.condition}`)}</span>
                {ad.negotiable && ad.priceGnf > 0 && <span className="pill">{t('card.negotiable')}</span>}
              </div>

              <h2 style={{ fontSize: 17, marginBottom: 10 }}>{t('ad.description')}</h2>
              <p style={{ color: 'var(--ink-soft)' }}>{copy.description}</p>

              {ad.attributes.length > 0 && (
                <>
                  <h2 style={{ fontSize: 17, margin: '22px 0 12px' }}>{t('ad.details')}</h2>
                  <dl className="attr-table">
                    {ad.attributes.map((attr) => (
                      <div key={attr.en}>
                        <dt>{pick({ fr: attr.fr, en: attr.en })}</dt>
                        <dd>{attr.value}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                <button
                  type="button"
                  className="btn btn--outline"
                  aria-pressed={saved}
                  onClick={() => toggle(ad.id)}
                >
                  <Icon name="heart" size={15} filled={saved} />
                  {saved ? t('card.saved') : t('card.save')}
                </button>
                <button type="button" className="btn btn--outline">
                  <Icon name="arrow" size={15} />
                  {t('ad.share')}
                </button>
              </div>
            </div>
          </div>

          <aside>
            <div className="panel seller" style={{ marginBottom: 18 }}>
              <div className="seller__avatar" aria-hidden="true">
                {ad.seller.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')}
              </div>
              <h3>{ad.seller.name}</h3>
              <p>
                {ad.seller.verified ? (
                  <span className="pill">
                    <Icon name="shield" size={13} />
                    {t('ad.verified')}
                  </span>
                ) : (
                  t('ad.unverified')
                )}
                <br />
                {t('ad.memberSince')} {formatDate(ad.seller.memberSince)}
              </p>

              <button
                type="button"
                className="btn btn--green btn--block"
                onClick={() => setPhoneShown(true)}
              >
                <Icon name="phoneCall" size={16} />
                {phoneShown ? ad.seller.phone : t('ad.showPhone')}
              </button>
              <button type="button" className="btn btn--outline btn--block">
                <Icon name="message" size={16} />
                {t('ad.message')}
              </button>

              <div className="demo-note">
                <Icon name="shield" size={14} />
                {t('ad.demoNotice')}
              </div>
            </div>

            <div className="notice">
              <Icon name="shield" size={20} />
              <div>
                <strong>{t('ad.safetyTitle')}</strong>
                {t('ad.safetyBody')}
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section style={{ marginTop: 44 }}>
            <div className="section__head">
              <h2 style={{ fontSize: 20 }}>{t('ad.similar')}</h2>
              <Link to={`/c/${category.slug}`} className="btn btn--outline">
                {t('section.viewAll')}
              </Link>
            </div>
            <div className="grid grid--3">
              {similar.map((item) => (
                <AdCard key={item.id} ad={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
