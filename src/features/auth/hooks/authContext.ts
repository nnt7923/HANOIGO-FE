import { createContext } from 'react'
import type { OtpPurpose, SafeUser } from '../../../types/api.type'

export type AuthContextValue = {
  user: SafeUser | null
  bootstrapping: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  verifyOtp: (email: string, code: string) => Promise<void>
  resendOtp: (email: string, purpose: OtpPurpose) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>
  loginGoogle: (idToken: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  logoutAll: () => Promise<void>
  refreshMe: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
