import { Link } from 'react-router-dom'
import type { Ad } from '../data/types'
import { categoryById, subCategoryById } from '../data/categories'
import { useLang } from '../i18n/LanguageContext'
import { useFavorites } from '../hooks/useFavorites'
import { Icon } from './Icon'
import { Thumb } from './Thumb'

export function AdCard({ ad }: { ad: Ad }) {
  const { t, pick, formatPrice, formatDate } = useLang()
  const { isFavorite, toggle } = useFavorites()
  const category = categoryById(ad.categoryId)
  const sub = subCategoryById(ad.categoryId, ad.subCategoryId)
  if (!category) return null

  const saved = isFavorite(ad.id)

  return (
    <article className="card">
      <div className="card__media">
        <Link to={`/ad/${ad.slug}`} tabIndex={-1} aria-hidden="true">
          <Thumb seed={ad.slug} category={category} />
        </Link>
        {ad.featured && <span className="card__badge">{t('card.featured')}</span>}
        <button
          type="button"
          className="card__fav"
          aria-pressed={saved}
          aria-label={saved ? t('card.saved') : t('card.save')}
          onClick={() => toggle(ad.id)}
        >
          <Icon name="heart" size={15} filled={saved} strokeWidth={1.6} />
        </button>
      </div>

      <div className="card__body">
        <span className="card__cat">{sub ? pick(sub) : pick(category)}</span>
        <h3 className="card__title">
          <Link to={`/ad/${ad.slug}`}>{pick(ad).title}</Link>
        </h3>
        <span className="card__meta">
          <Icon name="pin" size={13} />
          {ad.location}
        </span>
        <span className="card__meta">
          {t('card.postedOn')} {formatDate(ad.postedAt)}
        </span>
        <span className="card__price">
          {formatPrice(ad.priceGnf)}
          {ad.negotiable && ad.priceGnf > 0 && <small>{t('card.negotiable')}</small>}
        </span>
      </div>
    </article>
  )
}
