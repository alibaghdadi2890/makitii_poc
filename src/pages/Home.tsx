import { Link } from 'react-router-dom'
import { useAds } from '../api/hooks'
import { useCatalog } from '../api/CatalogContext'
import type { AdQuery } from '../api/types'
import { useLang } from '../i18n/LanguageContext'
import { AdCard } from '../components/AdCard'
import { Icon } from '../components/Icon'
import { AdImage } from '../components/AdImage'
import { CardSkeletons } from '../components/Skeleton'
import type { TranslationKey } from '../i18n/translations'

function Hero() {
  const { t, pick, formatPrice } = useLang()
  const { byId } = useCatalog()
  const { ads, loading } = useAds({ sort: 'recent', limit: 12 })
  const { categories } = useCatalog()

  const spotlight = ads.filter((a) => a.featured).slice(0, 4)

  return (
    <section className="hero">
      <svg className="hero__art" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="180" cy="120" r="240" fill="#ffffff" opacity="0.06" />
        <circle cx="1290" cy="470" r="300" fill="#ffffff" opacity="0.05" />
        <path d="M0 470 Q 360 380 720 470 T 1440 470 V560 H0Z" fill="#ffffff" opacity="0.07" />
        <g opacity="0.16">
          <rect x="1040" y="60" width="70" height="46" rx="6" fill="#ce1126" />
          <rect x="1130" y="60" width="70" height="46" rx="6" fill="#fcd116" />
          <rect x="1220" y="60" width="70" height="46" rx="6" fill="#ffffff" />
        </g>
      </svg>

      <div className="container hero__inner">
        <div>
          <span className="hero__eyebrow">
            <Icon name="star" size={14} filled />
            {t('hero.eyebrow')}
          </span>
          <h1>{t('hero.title')}</h1>
          <p className="hero__sub">{t('hero.subtitle')}</p>

          <div className="hero__actions">
            <Link to="/post" className="btn btn--yellow btn--lg">
              <Icon name="plus" size={17} />
              {t('hero.ctaPrimary')}
            </Link>
            <a href="#categories" className="btn btn--outline">
              {t('hero.ctaSecondary')}
            </a>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <b>10 000+</b>
              <span>{t('hero.statAds')}</span>
            </div>
            <div className="hero__stat">
              <b>3 200</b>
              <span>{t('hero.statSellers')}</span>
            </div>
            <div className="hero__stat">
              <b>{categories.length || '—'}</b>
              <span>{t('hero.statCategories')}</span>
            </div>
          </div>
        </div>

        <div className="hero__cards">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="hero__card hero__card--loading" aria-hidden="true" />
              ))
            : spotlight.map((ad) => {
                const category = byId(ad.categoryId)
                if (!category) return null
                return (
                  <Link key={ad.id} to={`/ad/${ad.slug}`} className="hero__card">
                    <AdImage
                      slug={ad.slug}
                      category={category}
                      photos={ad.photos}
                      alt={pick(ad).title}
                      ratio={0.62}
                      eager
                    />
                    <strong>{pick(ad).title}</strong>
                    <span>{formatPrice(ad.priceGnf)}</span>
                  </Link>
                )
              })}
        </div>
      </div>
    </section>
  )
}

function CategoryTiles() {
  const { t, pick } = useLang()
  const { categories, loading } = useCatalog()

  return (
    <section className="section section--white" id="categories">
      <div className="container">
        <div className="section__title-center">
          <h2>{t('section.browseCategories')}</h2>
          <p>{t('section.browseCategoriesSub')}</p>
        </div>
        <div className="cat-grid">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="cat-tile cat-tile--loading" aria-hidden="true" />
              ))
            : categories.map((category) => (
                <Link key={category.id} to={`/c/${category.slug}`} className="cat-tile">
                  <i>
                    <Icon name={category.icon} size={22} />
                  </i>
                  <b>{pick(category)}</b>
                  <span>
                    {category.adCount} {t('section.adsCount')}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}

function WhyMakitii() {
  const { t } = useLang()
  const items = [1, 2, 3, 4, 5, 6] as const
  const artIcons = ['tag', 'car', 'phone', 'home', 'store', 'shirt'] as const

  return (
    <section className="section">
      <div className="container why">
        <div>
          <h2>{t('why.title')}</h2>
          <div className="why__list">
            {items.map((n) => (
              <div key={n} className="why__item">
                <i>
                  <Icon name="check" size={16} strokeWidth={2.2} />
                </i>
                <div>
                  <h3>{t(`why.item${n}.title` as TranslationKey)}</h3>
                  <p>{t(`why.item${n}.body` as TranslationKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="why__art" aria-hidden="true">
          {artIcons.map((name) => (
            <div key={name}>
              <Icon name={name} size={30} strokeWidth={1.4} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const { t } = useLang()
  const steps = [1, 2, 3, 4] as const
  return (
    <section className="section section--white">
      <div className="container">
        <div className="section__title-center">
          <h2>{t('how.title')}</h2>
        </div>
        <div className="steps">
          {steps.map((n) => (
            <div key={n} className="step">
              <div className="step__num">{n}</div>
              <h3>{t(`how.step${n}.title` as TranslationKey)}</h3>
              <p>{t(`how.step${n}.body` as TranslationKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Each row asks the API for just the four listings it shows. */
function AdSection({ title, to, query }: { title: string; to: string; query: AdQuery }) {
  const { t } = useLang()
  const { ads, loading, error } = useAds({ ...query, limit: 4 })

  if (!loading && (error || ads.length === 0)) return null

  return (
    <section className="section section--tight">
      <div className="container">
        <div className="section__head">
          <h2>{title}</h2>
          <Link to={to} className="btn btn--outline">
            {t('section.viewAll')}
          </Link>
        </div>
        {loading ? (
          <CardSkeletons count={4} />
        ) : (
          <div className="grid">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function CtaBand() {
  const { t } = useLang()
  return (
    <section className="cta">
      <div className="container cta__inner">
        <div>
          <h2>{t('cta.title')}</h2>
          <p>{t('cta.subtitle')}</p>
        </div>
        <Link to="/post" className="btn btn--yellow btn--lg">
          {t('cta.button')}
        </Link>
      </div>
    </section>
  )
}

export function Home() {
  const { t } = useLang()

  return (
    <>
      <Hero />
      <CategoryTiles />
      <WhyMakitii />
      <HowItWorks />

      <AdSection
        title={t('section.carsForSale')}
        to="/c/vehicules?sub=cars-for-sale"
        query={{ sub: 'cars-for-sale' }}
      />
      <AdSection
        title={t('section.properties')}
        to="/c/immobilier"
        query={{ category: 'real-estate' }}
      />
      <AdSection
        title={t('section.mobilePhones')}
        to="/c/electronique?sub=mobile-phones"
        query={{ sub: 'mobile-phones' }}
      />
      <AdSection
        title={t('section.laptops')}
        to="/c/electronique?sub=laptops"
        query={{ sub: 'laptops' }}
      />

      <CtaBand />
    </>
  )
}
