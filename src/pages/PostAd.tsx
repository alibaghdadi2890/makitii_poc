import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, locations } from '../data/categories'
import { useLang } from '../i18n/LanguageContext'
import { Icon } from '../components/Icon'
import { MAX_PHOTOS, usePhotoUploads } from '../hooks/usePhotoUploads'
import type { TranslationKey } from '../i18n/translations'

interface Draft {
  categoryId: string
  subCategoryId: string
  title: string
  description: string
  price: string
  negotiable: boolean
  condition: string
  location: string
  name: string
  phone: string
  email: string
}

const empty: Draft = {
  categoryId: '',
  subCategoryId: '',
  title: '',
  description: '',
  price: '',
  negotiable: true,
  condition: 'used',
  location: '',
  name: '',
  phone: '',
  email: '',
}

const PHONE_RE = /^(\+?224)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function PostAd() {
  const { t, pick, formatPrice } = useLang()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const uploadMessages = useMemo(
    () => ({
      type: t('post.photoInvalidType'),
      size: t('post.photoTooLarge'),
      limit: t('post.photoLimit'),
    }),
    [t],
  )
  const { photos, error: photoError, add, remove, makeCover, reset: resetPhotos } =
    usePhotoUploads(uploadMessages)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const category = categories.find((c) => c.id === draft.categoryId)

  const validate = (index: number) => {
    const next: Record<string, string> = {}
    if (index === 0) {
      if (!draft.categoryId) next.categoryId = t('post.required')
      if (!draft.subCategoryId) next.subCategoryId = t('post.required')
    }
    if (index === 1) {
      if (draft.title.trim().length < 5) next.title = t('post.required')
      if (draft.description.trim().length < 15) next.description = t('post.required')
      if (!draft.price) next.price = t('post.required')
      if (!draft.location) next.location = t('post.required')
    }
    if (index === 2) {
      if (photos.length === 0) next.photos = t('post.photosRequired')
    }
    if (index === 3) {
      if (!draft.name.trim()) next.name = t('post.required')
      if (!PHONE_RE.test(draft.phone.trim())) next.phone = t('post.invalidPhone')
      if (draft.email && !EMAIL_RE.test(draft.email.trim())) next.email = t('post.invalidEmail')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const next = () => {
    if (!validate(step)) return
    if (step === 3) {
      setDone(true)
      return
    }
    setStep((s) => s + 1)
  }

  if (done) {
    return (
      <div className="page">
        <div className="container">
          <div className="panel success" style={{ maxWidth: 620, margin: '0 auto' }}>
            <i>
              <Icon name="check" size={30} strokeWidth={2.4} />
            </i>
            <h2>{t('post.successTitle')}</h2>
            <p>{t('post.successBody')}</p>

            {photos.length > 0 && (
              <div className="success__photos">
                {photos.map((photo) => (
                  <img key={photo.id} src={photo.url} alt={photo.name} />
                ))}
              </div>
            )}

            <div className="panel" style={{ textAlign: 'left', marginBottom: 20 }}>
              <h3>{t('post.summary')}</h3>
              <dl className="attr-table">
                <div>
                  <dt>{t('post.adTitle')}</dt>
                  <dd>{draft.title}</dd>
                </div>
                <div>
                  <dt>{t('post.price')}</dt>
                  <dd>{formatPrice(Number(draft.price) || 0)}</dd>
                </div>
                <div>
                  <dt>{t('post.chooseCategory')}</dt>
                  <dd>{category ? pick(category) : '—'}</dd>
                </div>
                <div>
                  <dt>{t('post.locationLabel')}</dt>
                  <dd>{draft.location}</dd>
                </div>
              </dl>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => {
                  setDraft(empty)
                  resetPhotos()
                  setStep(0)
                  setDone(false)
                }}
              >
                {t('post.successAgain')}
              </button>
              <Link to="/" className="btn btn--green">
                {t('ad.backHome')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="page__head">
          <div>
            <h1>{t('post.title')}</h1>
            <p>{t('post.subtitle')}</p>
          </div>
        </div>

        <ol className="stepper">
          {([0, 1, 2, 3] as const).map((i) => (
            <li
              key={i}
              className={`stepper__item ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}
            >
              {t(`post.step${i + 1}` as TranslationKey)}
            </li>
          ))}
        </ol>

        <div className="panel">
          {step === 0 && (
            <div className="form-grid">
              <div className={`field ${errors.categoryId ? 'field--error' : ''}`}>
                <label htmlFor="p-cat">{t('post.chooseCategory')}</label>
                <select
                  id="p-cat"
                  value={draft.categoryId}
                  onChange={(e) => {
                    set('categoryId', e.target.value)
                    set('subCategoryId', '')
                  }}
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {pick(c)}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <span className="field__error">{errors.categoryId}</span>}
              </div>

              <div className={`field ${errors.subCategoryId ? 'field--error' : ''}`}>
                <label htmlFor="p-sub">{t('post.chooseSubcategory')}</label>
                <select
                  id="p-sub"
                  value={draft.subCategoryId}
                  disabled={!category}
                  onChange={(e) => set('subCategoryId', e.target.value)}
                >
                  <option value="">—</option>
                  {category?.children.map((s) => (
                    <option key={s.id} value={s.id}>
                      {pick(s)}
                    </option>
                  ))}
                </select>
                {errors.subCategoryId && <span className="field__error">{errors.subCategoryId}</span>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="form-grid">
              <div className={`field field--full ${errors.title ? 'field--error' : ''}`}>
                <label htmlFor="p-title">{t('post.adTitle')}</label>
                <input
                  id="p-title"
                  value={draft.title}
                  placeholder={t('post.adTitlePlaceholder')}
                  onChange={(e) => set('title', e.target.value)}
                />
                {errors.title && <span className="field__error">{errors.title}</span>}
              </div>

              <div className={`field field--full ${errors.description ? 'field--error' : ''}`}>
                <label htmlFor="p-desc">{t('post.adDescription')}</label>
                <textarea
                  id="p-desc"
                  value={draft.description}
                  placeholder={t('post.adDescriptionPlaceholder')}
                  onChange={(e) => set('description', e.target.value)}
                />
                {errors.description && <span className="field__error">{errors.description}</span>}
              </div>

              <div className={`field ${errors.price ? 'field--error' : ''}`}>
                <label htmlFor="p-price">{t('post.price')}</label>
                <input
                  id="p-price"
                  type="number"
                  min="0"
                  step="10000"
                  value={draft.price}
                  onChange={(e) => set('price', e.target.value)}
                />
                {errors.price && <span className="field__error">{errors.price}</span>}
              </div>

              <div className="field">
                <label htmlFor="p-cond">{t('post.conditionLabel')}</label>
                <select id="p-cond" value={draft.condition} onChange={(e) => set('condition', e.target.value)}>
                  <option value="new">{t('condition.new')}</option>
                  <option value="like-new">{t('condition.like-new')}</option>
                  <option value="used">{t('condition.used')}</option>
                </select>
              </div>

              <div className={`field ${errors.location ? 'field--error' : ''}`}>
                <label htmlFor="p-loc">{t('post.locationLabel')}</label>
                <select id="p-loc" value={draft.location} onChange={(e) => set('location', e.target.value)}>
                  <option value="">—</option>
                  {locations.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                {errors.location && <span className="field__error">{errors.location}</span>}
              </div>

              <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label className="check" style={{ marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    checked={draft.negotiable}
                    onChange={(e) => set('negotiable', e.target.checked)}
                  />
                  {t('post.negotiable')}
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="field">
                <span>{t('post.photos')}</span>
                <p className="field__hint">{t('post.photosHint')}</p>
              </div>

              <div
                className={`dropzone ${dragging ? 'is-dragging' : ''} ${
                  errors.photos ? 'is-invalid' : ''
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  if (e.dataTransfer.files.length) add(e.dataTransfer.files)
                }}
              >
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.length) add(e.target.files)
                    e.target.value = ''
                  }}
                />
                <Icon name="camera" size={30} strokeWidth={1.4} />
                <button
                  type="button"
                  className="dropzone__trigger"
                  onClick={() => fileInput.current?.click()}
                  disabled={photos.length >= MAX_PHOTOS}
                >
                  {t('post.dropHint')}
                </button>
                <span className="field__hint">{t('post.dropFormats')}</span>
                <span className="dropzone__count">
                  {photos.length} {t('post.photoCount')} {MAX_PHOTOS}
                </span>
              </div>

              {(photoError || errors.photos) && (
                <span className="field__error" role="alert">
                  {photoError ?? errors.photos}
                </span>
              )}

              {photos.length > 0 && (
                <div className="photo-grid" style={{ marginTop: 16 }}>
                  {photos.map((photo, index) => (
                    <figure key={photo.id} className="photo-preview">
                      <img src={photo.url} alt={photo.name} />
                      {index === 0 && <span className="photo-preview__cover">{t('post.cover')}</span>}
                      <div className="photo-preview__actions">
                        {index !== 0 && (
                          <button
                            type="button"
                            title={t('post.makeCover')}
                            aria-label={`${t('post.makeCover')} — ${photo.name}`}
                            onClick={() => makeCover(photo.id)}
                          >
                            <Icon name="star" size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          title={t('post.removePhoto')}
                          aria-label={`${t('post.removePhoto')} — ${photo.name}`}
                          onClick={() => remove(photo.id)}
                        >
                          <Icon name="close" size={13} />
                        </button>
                      </div>
                      <figcaption>{(photo.size / 1024).toFixed(0)} KB</figcaption>
                    </figure>
                  ))}
                </div>
              )}

              <div className="demo-note" style={{ marginTop: 16 }}>
                <Icon name="shield" size={14} />
                {t('post.photosLocal')}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-grid">
              <div className={`field ${errors.name ? 'field--error' : ''}`}>
                <label htmlFor="p-name">{t('post.name')}</label>
                <input id="p-name" value={draft.name} onChange={(e) => set('name', e.target.value)} />
                {errors.name && <span className="field__error">{errors.name}</span>}
              </div>

              <div className={`field ${errors.phone ? 'field--error' : ''}`}>
                <label htmlFor="p-phone">{t('post.phone')}</label>
                <input
                  id="p-phone"
                  value={draft.phone}
                  placeholder="+224 6XX XX XX XX"
                  onChange={(e) => set('phone', e.target.value)}
                />
                {errors.phone && <span className="field__error">{errors.phone}</span>}
              </div>

              <div className={`field field--full ${errors.email ? 'field--error' : ''}`}>
                <label htmlFor="p-email">{t('post.email')}</label>
                <input
                  id="p-email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                {errors.email && <span className="field__error">{errors.email}</span>}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--outline"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              {t('post.back')}
            </button>
            <button type="button" className="btn btn--green" onClick={next}>
              {step === 3 ? t('post.submit') : t('post.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
