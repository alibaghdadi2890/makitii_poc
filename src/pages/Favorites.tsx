import { Link } from 'react-router-dom'
import { useAds } from '../api/hooks'
import { useLang } from '../i18n/LanguageContext'
import { useFavorites } from '../hooks/useFavorites'
import { AdCard } from '../components/AdCard'
import { CardSkeletons } from '../components/Skeleton'
import { Icon } from '../components/Icon'

export function Favorites() {
  const { t } = useLang()
  const { ids } = useFavorites()
  // Favourites are ids held on the device, so the listings themselves still
  // have to come from the API; the catalogue is small enough to filter locally.
  const { ads, loading } = useAds({ limit: 200 })

  const saved = ads.filter((ad) => ids.includes(ad.id))

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{t('common.breadcrumbHome')}</Link>
          <Icon name="chevron" size={13} />
          <span>{t('fav.title')}</span>
        </nav>

        <div className="page__head">
          <div>
            <h1>{t('fav.title')}</h1>
            <p>{t('fav.subtitle')}</p>
          </div>
        </div>

        {loading ? (
          <CardSkeletons count={4} />
        ) : saved.length > 0 ? (
          <div className="grid">
            {saved.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <i>
              <Icon name="heart" size={24} />
            </i>
            <h3>{t('fav.emptyTitle')}</h3>
            <p>{t('fav.emptyBody')}</p>
            <Link to="/" className="btn btn--green">
              {t('fav.browse')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
