import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { ApiAd } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useLang } from '../i18n/LanguageContext'
import { AdCard } from '../components/AdCard'
import { CardSkeletons } from '../components/Skeleton'
import { Icon } from '../components/Icon'

export function MyAds() {
  const { t } = useLang()
  const { user, loading: authLoading } = useAuth()
  const [ads, setAds] = useState<ApiAd[] | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    api
      .myAds()
      .then((res) => {
        if (!cancelled) setAds(res.items)
      })
      .catch(() => {
        if (!cancelled) setAds([])
      })
    return () => {
      cancelled = true
    }
  }, [user])

  if (!authLoading && !user) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty">
            <i>
              <Icon name="user" size={24} />
            </i>
            <h3>{t('post.loginRequired')}</h3>
            <p>{t('post.loginRequiredBody')}</p>
            <Link to="/login" className="btn btn--green">
              {t('topbar.signIn')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{t('common.breadcrumbHome')}</Link>
          <Icon name="chevron" size={13} />
          <span>{t('account.myAds')}</span>
        </nav>

        <div className="page__head">
          <div>
            <h1>{t('account.myAds')}</h1>
            <p>{t('account.myAdsSubtitle')}</p>
          </div>
          <Link to="/post" className="btn btn--green">
            <Icon name="plus" size={16} />
            {t('nav.postAd')}
          </Link>
        </div>

        {ads === null ? (
          <CardSkeletons count={3} columns={3} />
        ) : ads.length > 0 ? (
          <div className="grid grid--3">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <i>
              <Icon name="tag" size={24} />
            </i>
            <h3>{t('account.noAds')}</h3>
            <Link to="/post" className="btn btn--green">
              {t('nav.postAd')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
