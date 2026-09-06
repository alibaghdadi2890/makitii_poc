import { Link } from 'react-router-dom'
import { allCredits } from '../data/photos'
import { adBySlug } from '../data/ads'
import { useLang } from '../i18n/LanguageContext'
import { Icon } from '../components/Icon'

/**
 * Attribution for the demo photography. CC-BY and CC-BY-SA images require
 * credit, so every photo's creator, licence and source are listed here.
 */
export function Credits() {
  const { t, pick } = useLang()
  const entries = allCredits()
  const total = entries.reduce((n, [, list]) => n + list.length, 0)

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
              {t('credits.subtitle')} — {total} {t('credits.count')}.
            </p>
          </div>
        </div>

        <div className="credits">
          {entries.map(([slug, list]) => {
            const ad = adBySlug(slug)
            return (
              <section key={slug} className="panel credits__group">
                <h2>
                  {ad ? (
                    <Link to={`/ad/${slug}`}>{pick(ad).title}</Link>
                  ) : (
                    slug
                  )}
                </h2>
                <ul>
                  {list.map((photo) => (
                    <li key={photo.file}>
                      <img src={`${import.meta.env.BASE_URL}photos/${photo.file}`} alt="" loading="lazy" />
                      <div>
                        <strong>{photo.title ?? photo.file}</strong>
                        <span>
                          {t('credits.by')} {photo.creator ?? t('credits.unknownAuthor')} ·{' '}
                          {t('credits.license')} {photo.license.toUpperCase()}
                        </span>
                        <a href={photo.source} target="_blank" rel="noreferrer noopener">
                          {t('credits.source')}
                          <Icon name="arrow" size={12} />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
