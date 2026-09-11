import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAd, useAds } from '../api/hooks'
import { useCatalog } from '../api/CatalogContext'
import { useLang } from '../i18n/LanguageContext'
import { AdCard } from '../components/AdCard'
import { Icon } from '../components/Icon'
import { AdImage } from '../components/AdImage'
import { CardSkeletons } from '../components/Skeleton'
import { useFavorites } from '../hooks/useFavorites'
import { useToast } from '../components/Toast'

/** Stable numeric reference derived from the slug, so it reads like a real ID. */
function reference(slug: string) {
  let h = 0
  for (let i = 0; i < slug.length; i += 1) h = (h * 33 + slug.charCodeAt(i)) % 1_000_000
  return String(h).padStart(6, '0')
}

export function AdDetail() {
  const { slug } = useParams()
  const { t, pick, formatPrice, formatDate } = useLang()
  const { isFavorite, toggle } = useFavorites()
  const { byId, subById } = useCatalog()
  const toast = useToast()
  const [variant, setVariant] = useState(0)
  const [phoneShown, setPhoneShown] = useState(false)

  const { ad, loading, error } = useAd(slug)

  // Similar listings come from the same subcategory, resolved once the ad loads.
  const { ads: similar } = useAds(
    ad ? { sub: ad.subCategoryId ?? undefined, category: ad.categoryId, limit: 4 } : {},
  )

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="ad-layout">
            <div className="panel">
              <div className="skeleton__media" style={{ borderRadius: 8 }} />
            </div>
            <div className="panel">
              <div className="skeleton__line" />
              <div className="skeleton__line skeleton__line--short" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ad) {
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

  const category = byId(ad.categoryId)
  const sub = subById(ad.categoryId, ad.subCategoryId)
  const copy = pick(ad)
  const saved = isFavorite(ad.id)

  const galleryLength = Math.max(ad.photos.length, 1)
  const credit = ad.photos[variant % galleryLength]?.credit ?? null
  const step = (delta: number) =>
    setVariant((v) => (v + delta + galleryLength) % galleryLength)

  const onToggleFavorite = () => {
    toggle(ad.id)
    toast(saved ? t('toast.removed') : t('toast.saved'))
  }

  const others = similar.filter((a) => a.id !== ad.id).slice(0, 3)

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{t('common.breadcrumbHome')}</Link>
          <Icon name="chevron" size={13} />
          {category && <Link to={`/c/${category.slug}`}>{pick(category)}</Link>}
          {category && sub && (
            <>
              <Icon name="chevron" size={13} />
              <Link to={`/c/${category.slug}?sub=${sub.id}`}>{pick(sub)}</Link>
            </>
          )}
        </nav>

        <div className="ad-layout">
          <div>
            <div className="panel" style={{ marginBottom: 22 }}>
              <div className="gallery__main" style={{ position: 'relative' }}>
                {category && (
                  <AdImage
                    slug={ad.slug}
                    category={category}
                    photos={ad.photos}
                    alt={copy.title}
                    index={variant}
                    ratio={0.6}
                    eager
                  />
                )}
                {ad.photos.length > 1 && (
                  <div className="ad-gallery__nav">
                    <button type="button" aria-label={t('ad.previousImage')} onClick={() => step(-1)}>
                      <Icon name="arrow" size={17} />
                    </button>
                    <button type="button" aria-label={t('ad.nextImage')} onClick={() => step(1)}>
                      <Icon name="arrow" size={17} />
                    </button>
                  </div>
                )}
              </div>

              {ad.photos.length > 1 && category && (
                <div className="gallery__thumbs">
                  {ad.photos.map((photo, i) => (
                    <button
                      key={photo.id}
                      type="button"
                      aria-current={variant === i}
                      aria-label={`${copy.title} — ${i + 1}/${ad.photos.length}`}
                      onClick={() => setVariant(i)}
                    >
                      <AdImage
                        slug={ad.slug}
                        category={category}
                        photos={ad.photos}
                        alt={copy.title}
                        index={i}
                        ratio={0.72}
                      />
                    </button>
                  ))}
                </div>
              )}

              {credit && (
                <p className="photo-credit">
                  {t('ad.photoCredit')}: {credit.title ?? '—'} — {t('credits.by')}{' '}
                  {credit.creator ?? t('credits.unknownAuthor')} ({credit.license.toUpperCase()}) ·{' '}
                  <a href={credit.source} target="_blank" rel="noreferrer noopener">
                    {t('credits.source')}
                  </a>
                </p>
              )}
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
                  {t('ad.reference')} #{reference(ad.slug)}
                </span>
                <span className="pill">{t(`condition.${ad.condition}`)}</span>
                {ad.negotiable && ad.priceGnf > 0 && <span className="pill">{t('card.negotiable')}</span>}
              </div>

              <h2 style={{ fontSize: 17, marginBottom: 10 }}>{t('ad.description')}</h2>
              <p style={{ color: 'var(--ink-soft)', whiteSpace: 'pre-line' }}>{copy.description}</p>

              {ad.attributes && ad.attributes.length > 0 && (
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

              <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn--outline"
                  aria-pressed={saved}
                  onClick={onToggleFavorite}
                >
                  <Icon name="heart" size={15} filled={saved} />
                  {saved ? t('card.saved') : t('card.save')}
                </button>
                <button type="button" className="btn btn--outline">
                  <Icon name="arrow" size={15} />
                  {t('ad.share')}
                </button>
                <button type="button" className="btn btn--outline" style={{ marginLeft: 'auto' }}>
                  {t('ad.report')}
                </button>
              </div>
            </div>
          </div>

          <aside>
            {ad.seller && (
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
                  {ad.seller.memberSince && (
                    <>
                      <br />
                      {t('ad.memberSince')} {formatDate(ad.seller.memberSince)}
                    </>
                  )}
                </p>

                <button
                  type="button"
                  className="btn btn--green btn--block"
                  onClick={() => setPhoneShown(true)}
                >
                  <Icon name="phoneCall" size={16} />
                  {phoneShown && ad.seller.phone ? `+224 ${ad.seller.phone}` : t('ad.showPhone')}
                </button>
                <button type="button" className="btn btn--outline btn--block">
                  <Icon name="message" size={16} />
                  {t('ad.message')}
                </button>

                <div className="demo-note">{t('ad.demoNotice')}</div>
              </div>
            )}

            <div className="notice">
              <Icon name="shield" size={20} />
              <div>
                <strong>{t('ad.safetyTitle')}</strong>
                {t('ad.safetyBody')}
              </div>
            </div>
          </aside>
        </div>

        <section style={{ marginTop: 44 }}>
          <div className="section__head">
            <h2 style={{ fontSize: 20 }}>{t('ad.similar')}</h2>
            {category && (
              <Link to={`/c/${category.slug}`} className="btn btn--outline">
                {t('section.viewAll')}
              </Link>
            )}
          </div>
          {others.length > 0 ? (
            <div className="grid grid--3">
              {others.map((item) => (
                <AdCard key={item.id} ad={item} />
              ))}
            </div>
          ) : (
            <CardSkeletons count={3} columns={3} />
          )}
        </section>
      </div>
    </div>
  )
}
