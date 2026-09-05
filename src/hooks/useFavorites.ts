import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'makitii.favorites'

const read = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/**
 * Favourites live in localStorage so the POC keeps state across reloads without
 * a backend. A window event keeps every mounted card in sync.
 */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>(read)

  useEffect(() => {
    const sync = () => setIds(read())
    window.addEventListener('makitii:favorites', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('makitii:favorites', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggle = useCallback((id: string) => {
    const next = read().includes(id) ? read().filter((x) => x !== id) : [...read(), id]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable — favourites simply won't persist */
    }
    window.dispatchEvent(new Event('makitii:favorites'))
  }, [])

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids])

  return { ids, isFavorite, toggle }
}
