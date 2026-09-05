import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ads } from '../data/ads'
import { categories, categoryBySlug, locations } from '../data/categories'
import type { Ad, Condition } from '../data/types'
import { useLang } from '../i18n/LanguageContext'
import { AdCard } from '../components/AdCard'
import { Icon } from '../components/Icon'

const PRICE_STEPS = [1_000_000, 5_000_000, 20_000_000, 100_000_000, 500_000_000]

function sortAds(list: Ad[], sort: string) {
  const copy = [...list]
  if (sort === 'price-asc') return copy.sort((a, b) => a.priceGnf - b.priceGnf)
  if (sort === 'price-desc') return copy.sort((a, b) => b.priceGnf - a.priceGnf)
  return copy.sort((a, b) => b.postedAt.localeCompare(a.postedAt))
}

/**
 * One component backs both /c/:slug and /search — a category page is simply a
 * search pre-filtered to that category.
 */
export function Category({ mode = 'category' }: { mode?: 'category' | 'search' }) {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const { t, pick, formatPrice } = useLang()

  const category = mode === 'category' ? categoryBySlug(slug ?? '') : categoryBySlug(params.get('catSlug') ?? '')
  const searchCategory = mode === 'search' ? categories.find((c) => c.id === params.get('cat')) : undefined
  const active = category ?? searchCategory

  const query = params.get('q') ?? ''
  const sub = params.get('sub') ?? ''
  const location = params.get('loc') ?? ''
  const condition = params.get('cond') ?? ''
  const maxPrice = params.get('max') ?? ''
  const sort = params.get('sort') ?? 'recent'

  const results = useMemo(() => {
    let list = ads
    if (active) list = list.filter((a) => a.categoryId === active.id)
    if (sub) list = list.filter((a) => a.subCategoryId === sub)
    if (location) list = list.filter((a) => a.location === location)
    if (condition) list = list.filter((a) => a.condition === (condition as Condition))
    if (maxPrice) list = list.filter((a) => a.priceGnf <= Number(maxPrice))
    if (query) {
      const needle = query.toLowerCase()
      list = list.filter(
        (a) =>
          a.fr.title.toLowerCase().includes(needle) ||
          a.en.title.toLowerCase().includes(needle) ||
          a.fr.description.toLowerCase().includes(needle) ||
          a.en.description.toLowerCase().includes(needle) ||
          a.location.toLowerCase().includes(needle),
      )
    }
    return sortAds(list, sort)
  }, [active, sub, location, condition, maxPrice, query, sort])

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const reset = () => {
    const next = new URLSearchParams()
    if (query) next.set('q', query)
    if (mode === 'search' && params.get('cat')) next.set('cat', params.get('cat')!)
    setParams(next, { replace: true })
  }

  const heading = active
    ? pick(active)
    : `${t('category.searchResults')}${query ? ` ${t('category.searchFor')} “${query}”` : ''}`

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{t('common.breadcrumbHome')}</Link>
          <Icon name="chevron" size={13} className="breadcrumb__sep" />
          <span>{heading}</span>
        </nav>

        <div className="page__head">
          <div>
            <h1>{heading}</h1>
            {active && (
              <p>
                {active.children.map(pick).join(' · ')}
              </p>
            )}
          </div>
        </div>

        <div className="layout-2col">
          <aside className="panel" aria-label={t('category.filters')}>
            <h3>{t('category.filters')}</h3>

            {active && (
              <div className="field">
                <label htmlFor="f-sub">{t('category.subcategory')}</label>
                <select id="f-sub" value={sub} onChange={(e) => update('sub', e.target.value)}>
                  <option value="">{t('category.all')}</option>
                  {active.children.map((s) => (
                    <option key={s.id} value={s.id}>
                      {pick(s)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="field">
              <label htmlFor="f-loc">{t('category.location')}</label>
              <select id="f-loc" value={location} onChange={(e) => update('loc', e.target.value)}>
                <option value="">{t('category.allLocations')}</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="f-cond">{t('category.condition')}</label>
              <select id="f-cond" value={condition} onChange={(e) => update('cond', e.target.value)}>
                <option value="">{t('category.anyCondition')}</option>
                <option value="new">{t('condition.new')}</option>
                <option value="like-new">{t('condition.like-new')}</option>
                <option value="used">{t('condition.used')}</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="f-max">{t('category.maxPrice')}</label>
              <select id="f-max" value={maxPrice} onChange={(e) => update('max', e.target.value)}>
                <option value="">{t('category.all')}</option>
                {PRICE_STEPS.map((step) => (
                  <option key={step} value={step}>
                    ≤ {formatPrice(step)}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="btn btn--outline btn--block" onClick={reset}>
              {t('category.reset')}
            </button>
          </aside>

          <div>
            <div className="results-bar">
              <strong>
                {results.length} {t('category.results')}
              </strong>
              <select value={sort} onChange={(e) => update('sort', e.target.value)} aria-label={t('category.sort')}>
                <option value="recent">{t('category.sortRecent')}</option>
                <option value="price-asc">{t('category.sortPriceAsc')}</option>
                <option value="price-desc">{t('category.sortPriceDesc')}</option>
              </select>
            </div>

            {results.length > 0 ? (
              <div className="grid grid--3">
                {results.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <i>
                  <Icon name="search" size={24} />
                </i>
                <h3>{t('category.emptyTitle')}</h3>
                <p>{t('category.emptyBody')}</p>
                <button type="button" className="btn btn--green" onClick={reset}>
                  {t('category.reset')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
