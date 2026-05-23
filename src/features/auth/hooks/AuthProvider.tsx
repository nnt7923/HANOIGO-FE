import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { api } from '../../../services/hanoigo.api'
import { clearTokens, getAccessToken, getRefreshToken, setUnauthorizedHandler } from '../../../services/http'
import type { SafeUser } from '../../../types/api.type'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  const refreshMe = useCallback(async () => {
    const nextUser = await api.users.me()
    setUser(nextUser)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    if (!getAccessToken() && !getRefreshToken()) {
      setBootstrapping(false)
      return
    }
    refreshMe()
      .catch(() => {
        clearTokens()
        setUser(null)
      })
      .finally(() => setBootstrapping(false))

    return () => setUnauthorizedHandler(null)
  }, [refreshMe])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      bootstrapping,
      login: async (email, password) => {
        await api.auth.login({ email, password })
        await refreshMe()
      },
      register: async (name, email, password) => {
        await api.auth.register({ name, email, password })
      },
      verifyOtp: async (email, code) => {
        await api.auth.verifyOtp({
          email,
          code,
          purpose: 'email_verification',
        })
        await refreshMe()
      },
      resendOtp: async (email, purpose) => {
        await api.auth.resendOtp({ email, purpose })
      },
      forgotPassword: async (email) => {
        await api.auth.forgotPassword(email)
      },
      resetPassword: async (email, code, newPassword) => {
        await api.auth.resetPassword({ email, code, newPassword })
      },
      loginGoogle: async (idToken) => {
        await api.auth.loginGoogle(idToken)
        await refreshMe()
      },
      changePassword: async (currentPassword, newPassword) => {
        await api.auth.changePassword({ currentPassword, newPassword })
        setUser(null)
      },
      logoutAll: async () => {
        try {
          await api.auth.logoutAll()
        } finally {
          clearTokens()
          setUser(null)
        }
      },
      refreshMe,
      logout: async () => {
        try {
          await api.auth.logout()
        } finally {
          clearTokens()
          setUser(null)
        }
      },
    }),
    [bootstrapping, refreshMe, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
