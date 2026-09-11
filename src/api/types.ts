import type { Condition, IconName } from '../data/types'

/** Shapes returned by the API. These mirror the server's `shapeAd`/category output. */

export interface ApiSubCategory {
  id: string
  slug: string
  fr: string
  en: string
  adCount: number
}

export interface ApiCategory {
  id: string
  slug: string
  fr: string
  en: string
  icon: IconName
  hue: number
  adCount: number
  children: ApiSubCategory[]
}

export interface ApiPhotoCredit {
  title: string | null
  creator: string | null
  license: string
  source: string
}

export interface ApiPhoto {
  id: string
  url: string
  credit: ApiPhotoCredit | null
}

export interface ApiSeller {
  name: string
  phone: string | null
  memberSince: string | null
  verified: boolean
}

export interface ApiAd {
  id: string
  slug: string
  categoryId: string
  subCategoryId: string | null
  fr: { title: string; description: string }
  en: { title: string; description: string }
  priceGnf: number
  negotiable: boolean
  condition: Condition
  location: string
  featured: boolean
  postedAt: string
  photos: ApiPhoto[]
  seller: ApiSeller | null
  attributes?: { fr: string; en: string; value: string }[]
}

export interface ApiUser {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  verified: boolean
  createdAt: string
  adCount?: number
}

export interface AdQuery {
  category?: string
  sub?: string
  q?: string
  location?: string
  condition?: string
  maxPrice?: string
  sort?: string
  limit?: number
  offset?: number
}
