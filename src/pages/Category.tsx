import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ads } from '../data/ads'
import { categories, categoryBySlug, locations, subCategoryById } from '../data/categories'
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

function SkeletonGrid() {
  return (
    <div className="grid grid--3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton">
          <div className="skeleton__media" />
          <div className="skeleton__line skeleton__line--short" />
          <div className="skeleton__line" />
          <div className="skeleton__line skeleton__line--short" />
        </div>
      ))}
    </div>
  )
}

/**
 * One component backs both /c/:slug and /search — a category page is simply a
 * search pre-filtered to that category.
 */
export function Category({ mode = 'category' }: { mode?: 'category' | 'search' }) {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const { t, pick, formatPrice } = useLang()

  const category = mode === 'category' ? categoryBySlug(slug ?? '') : undefined
  const searchCategory = mode === 'search' ? categories.find((c) => c.id === params.get('cat')) : undefined
  const active = category ?? searchCategory

  const query = params.get('q') ?? ''
  const sub = params.get('sub') ?? ''
  const location = params.get('loc') ?? ''
  const condition = params.get('cond') ?? ''
  const maxPrice = params.get('max') ?? ''
  const sort = params.get('sort') ?? 'recent'

  // Keyword input is local so typing stays responsive; the URL catches up.
  const [keyword, setKeyword] = useState(query)
  useEffect(() => setKeyword(query), [query])

  const [loading, setLoading] = useState(false)
  const first = useRef(true)

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  // Debounce the keyword into the URL so it stays shareable and back-navigable.
  useEffect(() => {
    if (keyword === query) return
    const id = window.setTimeout(() => update('q', keyword), 300)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword])

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

  // A short skeleton pass on every filter change — a stand-in for the network
  // round-trip a real backend would add, so the states get exercised.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setLoading(true)
    const id = window.setTimeout(() => setLoading(false), 320)
    return () => window.clearTimeout(id)
  }, [active?.id, sub, location, condition, maxPrice, query, sort])

  const reset = () => {
    const next = new URLSearchParams()
    if (mode === 'search' && params.get('cat')) next.set('cat', params.get('cat')!)
    setParams(next, { replace: true })
  }

  const heading = active
    ? pick(active)
    : `${t('category.searchResults')}${query ? ` ${t('category.searchFor')} “${query}”` : ''}`

  const subLabel = active && sub ? subCategoryById(active.id, sub) : undefined
  const activeChips: { key: string; label: string }[] = [
    subLabel ? { key: 'sub', label: pick(subLabel) } : null,
    location ? { key: 'loc', label: location } : null,
    condition ? { key: 'cond', label: t(`condition.${condition as Condition}`) } : null,
    maxPrice ? { key: 'max', label: `≤ ${formatPrice(Number(maxPrice))}` } : null,
    query ? { key: 'q', label: `“${query}”` } : null,
  ].filter((c): c is { key: string; label: string } => Boolean(c))

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{t('common.breadcrumbHome')}</Link>
          <Icon name="chevron" size={13} />
          {active && subLabel ? (
            <>
              <Link to={`/c/${active.slug}`}>{pick(active)}</Link>
              <Icon name="chevron" size={13} />
              <span>{pick(subLabel)}</span>
            </>
          ) : (
            <span>{heading}</span>
          )}
        </nav>

        <div className="page__head">
          <div>
            <h1>{heading}</h1>
            {active && <p>{active.children.map(pick).join(' · ')}</p>}
          </div>
        </div>

        <div className="layout-2col">
          <aside className="panel panel--filters" aria-label={t('category.filters')}>
            <h3>{t('category.filters')}</h3>

            <div className="field">
              <label htmlFor="f-q">{t('category.keyword')}</label>
              <input
                id="f-q"
                type="search"
                value={keyword}
                placeholder={t('category.keywordPlaceholder')}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

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
            {activeChips.length > 0 && (
              <div className="chips" aria-label={t('category.activeFilters')}>
                {activeChips.map((chip) => (
                  <span key={chip.key} className="chip">
                    {chip.label}
                    <button
                      type="button"
                      aria-label={`${t('nav.close')} — ${chip.label}`}
                      onClick={() => update(chip.key, '')}
                    >
                      <Icon name="close" size={11} strokeWidth={2.4} />
                    </button>
                  </span>
                ))}
                <button type="button" className="chip chip--clear" onClick={reset}>
                  {t('category.clearAll')}
                </button>
              </div>
            )}

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

            {loading ? (
              <SkeletonGrid />
            ) : results.length > 0 ? (
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
