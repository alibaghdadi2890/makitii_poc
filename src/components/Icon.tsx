import type { IconName } from '../data/types'

type GlyphName =
  | IconName
  | 'search'
  | 'user'
  | 'heart'
  | 'pin'
  | 'clock'
  | 'chevron'
  | 'check'
  | 'shield'
  | 'phoneCall'
  | 'message'
  | 'camera'
  | 'plus'
  | 'close'
  | 'menu'
  | 'mail'
  | 'globe'
  | 'star'
  | 'arrow'

/** Single-path line icons drawn on a 24 × 24 grid. */
const paths: Record<GlyphName, string> = {
  car: 'M4 16v3h3v-3M17 16v3h3v-3M3 16h18v-3.2a2 2 0 0 0-.4-1.2l-2.2-3A3 3 0 0 0 16 7H8a3 3 0 0 0-2.4 1.2l-2.2 3A2 2 0 0 0 3 12.4V16Zm3.5-3h11M7 13v0m10 0v0',
  home: 'M4 11 12 4l8 7M6 10v9h12v-9M10 19v-5h4v5',
  phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2.5 15h3',
  laptop: 'M5 6h14v9H5zM3 18h18M9 18h6',
  sofa: 'M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 11h18v6H3zM6 17v2M18 17v2M8 11V9h8v2',
  briefcase: 'M4 8h16v11H4zM9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 13h16',
  shirt: 'M9 4 5 6l1 4h2v10h8V10h2l1-4-4-2a3 3 0 0 1-6 0Z',
  toy: 'M12 4a3 3 0 0 1 3 3v1h1a3 3 0 1 1 0 6h-1v3a3 3 0 1 1-6 0v-3H8a3 3 0 1 1 0-6h1V7a3 3 0 0 1 3-3Z',
  paw: 'M7 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM10 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm4 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm-2 5c3 0 5 2 5 4a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2c0-2 2-4 5-4Z',
  dumbbell: 'M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10',
  music: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  tag: 'M4 4h7l9 9-7 7-9-9V4Zm3.5 3.5v0',
  store: 'M4 9h16l-1-4H5L4 9Zm1 0v10h14V9M9 19v-6h6v6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4',
  user: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-8 16a8 8 0 0 1 16 0',
  heart: 'M12 20S4 15 4 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15 12 20 12 20Z',
  pin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 4v5l3 2',
  chevron: 'm7 10 5 5 5-5',
  check: 'm5 13 4 4L19 7',
  shield: 'M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Zm-2.5 8.5 2 2 4-4',
  phoneCall: 'M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 5.2 2 2 0 0 1 6 3Z',
  message: 'M4 5h16v11H9l-5 4V5Zm4 4h8M8 12h5',
  camera: 'M4 8h3l1.5-2h7L17 8h3v11H4V8Zm8 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
  plus: 'M12 5v14M5 12h14',
  close: 'm6 6 12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  globe: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 0c-3 3-3 15 0 18m0-18c3 3 3 15 0 18M3.5 9h17m-17 6h17',
  star: 'm12 4 2.5 5.2 5.5.8-4 4 1 5.5-5-2.7-5 2.7 1-5.5-4-4 5.5-.8L12 4Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
}

interface IconProps {
  name: GlyphName
  size?: number
  strokeWidth?: number
  className?: string
  filled?: boolean
}

export function Icon({ name, size = 20, strokeWidth = 1.7, className, filled }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  )
}
