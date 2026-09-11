import { useCallback, useEffect, useState } from 'react'
import { api } from './client'
import type { AdQuery, ApiAd, ApiCategory } from './types'

interface Result<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

/**
 * Minimal fetch-on-mount hook. The prototype has no caching layer by design —
 * the request volume is tiny and a data library would be more machinery than
 * this needs. `key` re-runs the request whenever it changes.
 */
function useResource<T>(load: () => Promise<T>, key: string): Result<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    load()
      .then((result) => {
        // A superseded request must not overwrite fresher data.
        if (!cancelled) setData(result)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // `load` is recreated on every render; `key` is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { data, loading, error, reload }
}

export function useCategories() {
  const result = useResource<{ categories: ApiCategory[] }>(() => api.categories(), 'categories')
  return { ...result, categories: result.data?.categories ?? [] }
}

export function useAds(params: AdQuery) {
  const key = JSON.stringify(params)
  const result = useResource<{ items: ApiAd[]; total: number }>(() => api.ads(params), `ads:${key}`)
  return { ...result, ads: result.data?.items ?? [], total: result.data?.total ?? 0 }
}

export function useAd(slug: string | undefined) {
  const result = useResource<{ ad: ApiAd } | null>(
    () => (slug ? api.ad(slug) : Promise.resolve(null)),
    `ad:${slug ?? ''}`,
  )
  return { ...result, ad: result.data?.ad ?? null }
}
