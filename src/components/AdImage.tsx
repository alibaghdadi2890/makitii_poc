import { useState } from 'react'
import type { ApiPhoto } from '../api/types'
import { Thumb } from './Thumb'
import type { ThumbCategory } from './Thumb'

interface AdImageProps {
  slug: string
  category: ThumbCategory
  photos: ApiPhoto[]
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
  photos,
  alt,
  index = 0,
  ratio = 0.72,
  className,
  eager,
}: AdImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (failed || photos.length === 0) {
    return <Thumb seed={slug} category={category} variant={index} ratio={ratio} className={className} />
  }

  return (
    <div className={`thumb ${className ?? ''}`} style={{ aspectRatio: `1 / ${ratio}` }}>
      <Thumb seed={slug} category={category} variant={index} ratio={ratio} className="thumb__under" />
      <img
        className={`thumb__photo ${loaded ? 'is-loaded' : ''}`}
        src={photos[index % photos.length].url}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
