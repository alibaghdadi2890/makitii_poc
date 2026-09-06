import { useState } from 'react'
import type { Category } from '../data/types'
import { photosFor } from '../data/photos'
import { Thumb } from './Thumb'

interface AdImageProps {
  slug: string
  category: Category
  alt: string
  /** Which photo to show — wraps around, so galleries can index freely. */
  index?: number
  ratio?: number
  className?: string
  eager?: boolean
}

/**
 * Shows a listing's photo over the generated category artwork. The artwork
 * doubles as the loading placeholder and as the fallback when a listing has no
 * photo or the file fails to load, so a card is never a blank grey box.
 */
export function AdImage({
  slug,
  category,
  alt,
  index = 0,
  ratio = 0.72,
  className,
  eager,
}: AdImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const sources = photosFor(slug)

  if (failed || sources.length === 0) {
    return <Thumb seed={slug} category={category} variant={index} ratio={ratio} className={className} />
  }

  return (
    <div className={`thumb ${className ?? ''}`} style={{ aspectRatio: `1 / ${ratio}` }}>
      <Thumb seed={slug} category={category} variant={index} ratio={ratio} className="thumb__under" />
      <img
        className={`thumb__photo ${loaded ? 'is-loaded' : ''}`}
        src={sources[index % sources.length]}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

/** How many distinct photos a listing has, for gallery controls. */
export const photoCount = (slug: string) => photosFor(slug).length
