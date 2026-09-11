import { Link } from 'react-router-dom'
import { useAds } from '../api/hooks'
import { useLang } from '../i18n/LanguageContext'
import { Icon } from '../components/Icon'

/**
 * Attribution for the demo photography. CC-BY and CC-BY-SA images require
 * credit, so every photo's creator, licence and source are listed here. The
 * credits travel with each photo in the API response.
 */
export function Credits() {
  const { t, pick } = useLang()
  const { ads, loading } = useAds({ limit: 200 })

  const withCredits = ads
    .map((ad) => ({ ad, photos: ad.photos.filter((p) => p.credit) }))
    .filter((entry) => entry.photos.length > 0)

  const total = withCredits.reduce((n, entry) => n + entry.photos.length, 0)

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{t('common.breadcrumbHome')}</Link>
          <Icon name="chevron" size={13} />
          <span>{t('credits.title')}</span>
        </nav>

        <div className="page__head">
          <div>
            <h1>{t('credits.title')}</h1>
            <p>
              {t('credits.subtitle')}
              {!loading && ` — ${total} ${t('credits.count')}.`}
            </p>
          </div>
        </div>

        <div className="credits">
          {withCredits.map(({ ad, photos }) => (
            <section key={ad.id} className="panel credits__group">
              <h2>
                <Link to={`/ad/${ad.slug}`}>{pick(ad).title}</Link>
              </h2>
              <ul>
                {photos.map((photo) => (
                  <li key={photo.id}>
                    <img src={photo.url} alt="" loading="lazy" />
                    <div>
                      <strong>{photo.credit?.title ?? '—'}</strong>
                      <span>
                        {t('credits.by')} {photo.credit?.creator ?? t('credits.unknownAuthor')} ·{' '}
                        {t('credits.license')} {photo.credit?.license.toUpperCase()}
                      </span>
                      <a href={photo.credit?.source} target="_blank" rel="noreferrer noopener">
                        {t('credits.source')}
                        <Icon name="arrow" size={12} />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
