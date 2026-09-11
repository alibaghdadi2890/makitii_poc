import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useCategories } from './hooks'
import type { ApiCategory, ApiSubCategory } from './types'

interface CatalogValue {
  categories: ApiCategory[]
  loading: boolean
  error: string | null
  byId: (id: string | null | undefined) => ApiCategory | undefined
  bySlug: (slug: string | null | undefined) => ApiCategory | undefined
  subById: (categoryId: string, subId: string | null | undefined) => ApiSubCategory | undefined
}

const CatalogContext = createContext<CatalogValue | null>(null)

/**
 * The taxonomy is needed by almost every screen and changes rarely, so it is
 * fetched once here rather than per component.
 */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const { categories, loading, error } = useCategories()

  const value = useMemo<CatalogValue>(() => {
    const idMap = new Map(categories.map((c) => [c.id, c]))
    const slugMap = new Map(categories.map((c) => [c.slug, c]))
    return {
      categories,
      loading,
      error,
      byId: (id) => (id ? idMap.get(id) : undefined),
      bySlug: (slug) => (slug ? slugMap.get(slug) : undefined),
      subById: (categoryId, subId) =>
        subId ? idMap.get(categoryId)?.children.find((s) => s.id === subId) : undefined,
    }
  }, [categories, loading, error])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used inside a CatalogProvider')
  return ctx
}

/** Conakry neighbourhoods offered in the filters and the post form. */
export const locations = [
  'Kaloum',
  'Dixinn',
  'Matam',
  'Ratoma',
  'Matoto',
  'Kipé',
  'Lambanyi',
  'Nongo',
  'Taouyah',
  'Coléah',
  'Madina',
]
