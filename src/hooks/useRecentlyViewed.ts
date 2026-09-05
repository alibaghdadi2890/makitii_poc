import { useEffect, useState } from 'react'

const STORAGE_KEY = 'makitii.recent'
const LIMIT = 8

const read = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/**
 * Records the ads a visitor opens, most recent first. Returns the list as it
 * stood *before* the current ad was added, so the page can show "recently
 * viewed" without listing the ad you are already looking at.
 */
export function useRecentlyViewed(currentId?: string) {
  const [previous, setPrevious] = useState<string[]>([])

  useEffect(() => {
    const stored = read()
    setPrevious(stored.filter((id) => id !== currentId))
    if (!currentId) return
    const next = [currentId, ...stored.filter((id) => id !== currentId)].slice(0, LIMIT)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable — history simply won't persist */
    }
  }, [currentId])

  return previous
}
