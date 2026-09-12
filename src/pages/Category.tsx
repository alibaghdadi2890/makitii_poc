import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAds } from '../api/hooks'
import { locations, useCatalog } from '../api/CatalogContext'
import type { Condition } from '../data/types'
import { useLang } from '../i18n/LanguageContext'
import { AdCard } from '../components/AdCard'
import { CardSkeletons } from '../components/Skeleton'
import { Icon } from '../components/Icon'

const PRICE_STEPS = [1_000_000, 5_000_000, 20_000_000, 100_000_000, 500_000_000]

/**
 * One component backs both /c/:slug and /search — a category page is simply a
 * search pre-filtered to that category. All filtering happens server-side.
 */
export function Category({ mode = 'category' }: { mode?: 'category' | 'search' }) {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const { t, pick, formatPrice } = useLang()
  const { bySlug, byId, subById, loading: catalogLoading } = useCatalog()

  const active = mode === 'category' ? bySlug(slug) : byId(params.get('cat'))

  const queryText = params.get('q') ?? ''
  const sub = params.get('sub') ?? ''
  const location = params.get('loc') ?? ''
  const condition = params.get('cond') ?? ''
  const maxPrice = params.get('max') ?? ''
  const sort = params.get('sort') ?? 'recent'

  // Below 1100px the filter rail stacks above the results, so it starts
  // collapsed: otherwise a phone shows a screen and a half of form controls
  // before the first listing.
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Keyword input is local so typing stays responsive; the URL catches up.
  const [keyword, setKeyword] = useState(queryText)
  useEffect(() => setKeyword(queryText), [queryText])

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  // Debounce the keyword into the URL so it stays shareable and back-navigable.
  useEffect(() => {
    if (keyword === queryText) return
    const id = window.setTimeout(() => update('q', keyword), 300)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword])

  const { ads, total, loading, error } = useAds({
    category: mode === 'category' ? slug : (params.get('cat') ?? undefined),
    sub: sub || undefined,
    q: queryText || undefined,
    location: location || undefined,
    condition: condition || undefined,
    maxPrice: maxPrice || undefined,
    sort,
  })

  const reset = () => {
    const next = new URLSearchParams()
    if (mode === 'search' && params.get('cat')) next.set('cat', params.get('cat')!)
    setParams(next, { replace: true })
  }

  const heading = active
    ? pick(active)
    : `${t('category.searchResults')}${queryText ? ` ${t('category.searchFor')} “${queryText}”` : ''}`

  const subLabel = active ? subById(active.id, sub) : undefined
  const activeChips = [
    subLabel ? { key: 'sub', label: pick(subLabel) } : null,
    location ? { key: 'loc', label: location } : null,
    condition ? { key: 'cond', label: t(`condition.${condition as Condition}`) } : null,
    maxPrice ? { key: 'max', label: `≤ ${formatPrice(Number(maxPrice))}` } : null,
    queryText ? { key: 'q', label: `“${queryText}”` } : null,
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
            <h1>{catalogLoading && !active ? '…' : heading}</h1>
            {active && <p>{active.children.map(pick).join(' · ')}</p>}
          </div>
        </div>

        <div className="layout-2col">
          <aside
            className={`panel panel--filters ${filtersOpen ? 'is-open' : ''}`}
            aria-label={t('category.filters')}
          >
            <button
              type="button"
              className="filters-toggle"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <h3>{t('category.filters')}</h3>
              {activeChips.length > 0 && <span className="filters-toggle__count">{activeChips.length}</span>}
              <Icon name="chevron" size={16} className="filters-toggle__chevron" />
            </button>

            <div className="filters-body">
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
                      {pick(s)} ({s.adCount})
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
            </div>
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
                {loading ? '…' : total} {t('category.results')}
              </strong>
              <select value={sort} onChange={(e) => update('sort', e.target.value)} aria-label={t('category.sort')}>
                <option value="recent">{t('category.sortRecent')}</option>
                <option value="price-asc">{t('category.sortPriceAsc')}</option>
                <option value="price-desc">{t('category.sortPriceDesc')}</option>
              </select>
            </div>

            {loading ? (
              <CardSkeletons count={6} columns={3} />
            ) : error ? (
              <div className="empty">
                <i>
                  <Icon name="close" size={24} />
                </i>
                <h3>{t('error.title')}</h3>
                <p>{t('error.body')}</p>
              </div>
            ) : ads.length > 0 ? (
              <div className="grid grid--3">
                {ads.map((ad) => (
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
