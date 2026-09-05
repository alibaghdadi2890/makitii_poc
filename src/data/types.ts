export type Lang = 'fr' | 'en'

export interface SubCategory {
  id: string
  slug: string
  fr: string
  en: string
}

export interface Category {
  id: string
  slug: string
  fr: string
  en: string
  icon: IconName
  /** Hue used to tint generated placeholder artwork. */
  hue: number
  children: SubCategory[]
}

export type IconName =
  | 'car'
  | 'home'
  | 'phone'
  | 'sofa'
  | 'briefcase'
  | 'shirt'
  | 'toy'
  | 'paw'
  | 'dumbbell'
  | 'music'
  | 'tag'
  | 'store'
  | 'laptop'

export type Condition = 'new' | 'like-new' | 'used'

export interface Seller {
  name: string
  memberSince: string
  phone: string
  verified: boolean
}

export interface Ad {
  id: string
  slug: string
  categoryId: string
  subCategoryId: string
  fr: { title: string; description: string }
  en: { title: string; description: string }
  priceGnf: number
  negotiable: boolean
  condition: Condition
  location: string
  postedAt: string
  featured: boolean
  seller: Seller
  attributes: { fr: string; en: string; value: string }[]
}
