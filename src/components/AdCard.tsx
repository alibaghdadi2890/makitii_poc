import { Link } from 'react-router-dom'
import type { Ad } from '../data/types'
import { categoryById, subCategoryById } from '../data/categories'
import { useLang } from '../i18n/LanguageContext'
import { useFavorites } from '../hooks/useFavorites'
import { useToast } from './Toast'
import { Icon } from './Icon'
import { AdImage } from './AdImage'

export function AdCard({ ad }: { ad: Ad }) {
  const { t, pick, formatPrice, formatDate } = useLang()
  const { isFavorite, toggle } = useFavorites()
  const toast = useToast()
  const category = categoryById(ad.categoryId)
  const sub = subCategoryById(ad.categoryId, ad.subCategoryId)
  if (!category) return null

  const saved = isFavorite(ad.id)

  const onToggle = () => {
    toggle(ad.id)
    toast(saved ? t('toast.removed') : t('toast.saved'))
  }

  return (
    <article className="card">
      <div className="card__media">
        <AdImage slug={ad.slug} category={category} alt={pick(ad).title} />

        {ad.featured && <span className="card__badge">{t('card.featured')}</span>}

        {ad.condition !== 'used' && (
          <div className="card__tags">
            <span className={`tag-chip ${ad.condition === 'new' ? 'tag-chip--new' : ''}`}>
              {t(`condition.${ad.condition}`)}
            </span>
          </div>
        )}

        <button
          type="button"
          className="card__fav"
          aria-pressed={saved}
          aria-label={saved ? t('card.saved') : t('card.save')}
          onClick={onToggle}
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
          <Icon name="clock" size={13} />
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
