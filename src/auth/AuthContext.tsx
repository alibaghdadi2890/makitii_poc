import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, readToken, writeToken } from '../api/client'
import type { ApiUser } from '../api/types'

interface AuthValue {
  user: ApiUser | null
  /** True until the stored token has been checked against the server. */
  loading: boolean
  signIn: (token: string, user: ApiUser) => void
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(Boolean(readToken()))

  const refresh = useCallback(async () => {
    if (!readToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { user: me } = await api.me()
      setUser(me)
    } catch {
      // The stored token is expired or unknown; drop it rather than leaving the
      // UI in a half-signed-in state.
      writeToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signIn = useCallback((token: string, nextUser: ApiUser) => {
    writeToken(token)
    setUser(nextUser)
    setLoading(false)
  }, [])

  const signOut = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      /* the local session is cleared either way */
    }
    writeToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ user, loading, signIn, signOut, refresh }),
    [user, loading, signIn, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}
