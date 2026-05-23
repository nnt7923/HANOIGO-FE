import { Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Field } from '../../../components/ui/Field'
import { getErrorMessage } from '../../../services/hanoigo.api'
import { useAuth } from '../hooks/useAuth'
import { GoogleLoginButton } from './GoogleLoginButton'

export function AuthPanel({
  initialMode = 'login',
  onAuthSuccess,
}: {
  initialMode?: 'login' | 'register' | 'verify' | 'reset'
  onAuthSuccess?: () => void
}) {
  const { login, register, verifyOtp, resendOtp, forgotPassword, resetPassword, loginGoogle } = useAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'reset'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(0)
  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000))

  useEffect(() => {
    if (!cooldownUntil) return
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [cooldownUntil])

  function beginCooldown() {
    const current = Date.now()
    setNow(current)
    setCooldownUntil(current + 60_000)
  }

  function switchMode(nextMode: 'login' | 'register' | 'verify' | 'reset') {
    setError('')
    setStatus('')
    setMode(nextMode)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setStatus('')

    try {
      if (mode === 'login') {
        await login(email, password)
        onAuthSuccess?.()
      }
      if (mode === 'register') {
        await register(name, email, password)
        setStatus('OTP sent')
        beginCooldown()
        setMode('verify')
      }
      if (mode === 'verify') {
        await verifyOtp(email, code)
        onAuthSuccess?.()
      }
      if (mode === 'reset') {
        if (code && newPassword) {
          await resetPassword(email, code, newPassword)
          setStatus('Password updated')
          setMode('login')
        } else {
          await forgotPassword(email)
          beginCooldown()
          setStatus('OTP sent')
        }
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      if (message.toLowerCase().includes('verify')) {
        setMode('verify')
      }
    }
  }

  return (
    <form className="auth-panel" onSubmit={submit}>
      <div className="segmented">
        <button className={mode === 'login' ? 'selected' : ''} onClick={() => switchMode('login')} type="button">
          Login
        </button>
        <button className={mode === 'register' ? 'selected' : ''} onClick={() => switchMode('register')} type="button">
          Register
        </button>
      </div>

      <div className="auth-mode-copy">
        <strong>{getModeTitle(mode)}</strong>
        <span>{getModeDescription(mode)}</span>
      </div>

      {mode === 'register' && <Field label="Name" value={name} onChange={setName} required />}
      <Field label="Email" type="email" value={email} onChange={setEmail} required />
      {(mode === 'login' || mode === 'register') && (
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
      )}
      {(mode === 'verify' || mode === 'reset') && <Field label="OTP" value={code} onChange={setCode} />}
      {mode === 'reset' && (
        <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} />
      )}

      {error && <p className="form-error">{error}</p>}
      {status && <p className="form-status">{status}</p>}

      <button className="primary-button" type="submit">
        <Send size={16} />
        {getSubmitLabel(mode, Boolean(code && newPassword))}
      </button>

      {(mode === 'login' || mode === 'register') && (
        <>
          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          <GoogleLoginButton
            onCredential={async (credential) => {
              setError('')
              await loginGoogle(credential)
              onAuthSuccess?.()
            }}
            onError={setError}
          />
        </>
      )}

      {mode === 'login' && (
        <div className="auth-links">
          <button onClick={() => switchMode('reset')} type="button">
            Forgot password?
          </button>
          <button onClick={() => switchMode('verify')} type="button">
            Verify email
          </button>
        </div>
      )}

      {mode === 'register' && (
        <div className="auth-links">
          <button onClick={() => switchMode('verify')} type="button">
            Already have an OTP?
          </button>
        </div>
      )}

      {mode === 'verify' && (
        <div className="auth-links stacked">
          <button
            disabled={cooldownSeconds > 0}
            onClick={async () => {
              setError('')
              try {
                await resendOtp(email, 'email_verification')
                beginCooldown()
                setStatus('OTP sent')
              } catch (err) {
                setError(getErrorMessage(err))
              }
            }}
            type="button"
          >
            {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend verification OTP'}
          </button>
          <button onClick={() => switchMode('login')} type="button">
            Back to login
          </button>
        </div>
      )}

      {mode === 'reset' && (
        <div className="auth-links">
          <button onClick={() => switchMode('login')} type="button">
            Back to login
          </button>
        </div>
      )}
    </form>
  )
}

function getModeTitle(mode: 'login' | 'register' | 'verify' | 'reset') {
  if (mode === 'register') return 'Create your HanoiGo account'
  if (mode === 'verify') return 'Verify your email'
  if (mode === 'reset') return 'Reset your password'
  return 'Welcome back'
}

function getModeDescription(mode: 'login' | 'register' | 'verify' | 'reset') {
  if (mode === 'register') return 'Use email/password or Google to start planning.'
  if (mode === 'verify') return 'Enter the OTP sent to your email address.'
  if (mode === 'reset') return 'Submit your email first, then enter OTP and a new password.'
  return 'Login with email/password or Google.'
}

function getSubmitLabel(mode: 'login' | 'register' | 'verify' | 'reset', hasResetFields: boolean) {
  if (mode === 'login') return 'Login'
  if (mode === 'register') return 'Create account'
  if (mode === 'verify') return 'Verify email'
  if (mode === 'reset' && hasResetFields) return 'Update password'
  return 'Send reset OTP'
}
