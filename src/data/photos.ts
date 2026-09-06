import manifest from './photos.json'

export interface PhotoCredit {
  file: string
  title: string | null
  creator: string | null
  license: string
  source: string
}

const photos = manifest as Record<string, PhotoCredit[]>

/** Public URLs of the photos attached to a listing, cover first. */
export const photosFor = (slug: string): string[] =>
  (photos[slug] ?? []).map((p) => `${import.meta.env.BASE_URL}photos/${p.file}`)

/** Provenance for every photo, used by the credits page. */
export const creditsFor = (slug: string): PhotoCredit[] => photos[slug] ?? []

export const allCredits = (): [string, PhotoCredit[]][] => Object.entries(photos)

export const hasPhotos = (slug: string) => (photos[slug]?.length ?? 0) > 0
