import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang } from '../data/types'
import { dictionaries } from './translations'
import type { TranslationKey } from './translations'

const STORAGE_KEY = 'makitii.lang'

interface LanguageValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
  /** Picks the right side of a bilingual object, e.g. a category or an ad. */
  pick: <T>(item: Record<Lang, T>) => T
  formatPrice: (gnf: number) => string
  formatDate: (iso: string) => string
}

const LanguageContext = createContext<LanguageValue | null>(null)

const readStored = (): Lang => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') return stored
  } catch {
    /* private mode or storage disabled — fall through to the default */
  }
  return 'fr'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStored)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* nothing to do — the choice simply won't persist */
    }
  }, [])

  const value = useMemo<LanguageValue>(() => {
    const dict = dictionaries[lang]
    return {
      lang,
      setLang,
      t: (key) => dict[key] ?? key,
      pick: (item) => item[lang],
      formatPrice: (gnf) => {
        if (gnf === 0) return dict['card.free']
        const digits = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB').format(gnf)
        return lang === 'fr' ? `${digits} GNF` : `GNF ${digits}`
      },
      formatDate: (iso) =>
        new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        }),
    }
  }, [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside a LanguageProvider')
  return ctx
}
