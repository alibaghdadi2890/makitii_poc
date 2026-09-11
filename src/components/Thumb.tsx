import { useMemo } from 'react'
import type { IconName } from '../data/types'
import { Icon } from './Icon'

/** Everything the artwork needs, shared by the API and static category shapes. */
export interface ThumbCategory {
  id: string
  icon: IconName
  hue: number
}

/**
 * Placeholder artwork. The POC ships no photography, so each listing gets a
 * deterministic illustration derived from its slug: a tinted gradient in the
 * category hue, a soft blob pattern, and the category glyph. Swapping in real
 * photos later means replacing this component with an <img>.
 */
function hash(input: string) {
  let h = 0
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) | 0
  return Math.abs(h)
}

interface ThumbProps {
  seed: string
  category: ThumbCategory
  /** Extra variation index, used for the gallery on the ad page. */
  variant?: number
  className?: string
  ratio?: number
}

export function Thumb({ seed, category, variant = 0, className, ratio = 0.72 }: ThumbProps) {
  const art = useMemo(() => {
    const h = hash(`${seed}:${variant}`)
    const hue = (category.hue + (h % 24) - 12 + 360) % 360
    const id = `g-${category.id}-${h % 100000}-${variant}`
    return {
      id,
      from: `hsl(${hue} 62% ${variant % 2 ? 92 : 88}%)`,
      to: `hsl(${(hue + 26) % 360} 48% ${variant % 2 ? 78 : 72}%)`,
      glyph: `hsl(${hue} 55% 30%)`,
      blobs: [
        { cx: 18 + (h % 20), cy: 22 + (h % 13), r: 16 + (h % 9) },
        { cx: 78 - (h % 17), cy: 70 - (h % 11), r: 22 + ((h >> 3) % 12) },
        { cx: 62 + ((h >> 5) % 15), cy: 26 + ((h >> 2) % 10), r: 10 + ((h >> 4) % 7) },
      ],
    }
  }, [seed, variant, category])

  return (
    <div className={`thumb ${className ?? ''}`} style={{ aspectRatio: `1 / ${ratio}` }}>
      <svg viewBox="0 0 100 72" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={art.id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={art.from} />
            <stop offset="100%" stopColor={art.to} />
          </linearGradient>
        </defs>
        <rect width="100" height="72" fill={`url(#${art.id})`} />
        {art.blobs.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="#fff" opacity={0.1 + i * 0.04} />
        ))}
      </svg>
      <span className="thumb__glyph" style={{ color: art.glyph }}>
        <Icon name={category.icon} size={44} strokeWidth={1.2} />
      </span>
    </div>
  )
}
