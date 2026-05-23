import { Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Field } from '../../../components/ui/Field'
import { getErrorMessage } from '../../../services/hanoigo.api'
import { useAuth } from '../hooks/useAuth'
import { GoogleLoginButton } from './GoogleLoginButton'

export function AuthPanel({
  initialMode = 'login',
}: {
  initialMode?: 'login' | 'register' | 'verify' | 'reset'
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

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setStatus('')

    try {
      if (mode === 'login') {
        await login(email, password)
      }
      if (mode === 'register') {
        await register(name, email, password)
        setStatus('OTP sent')
        beginCooldown()
        setMode('verify')
      }
      if (mode === 'verify') {
        await verifyOtp(email, code)
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
        <button className={mode === 'login' ? 'selected' : ''} onClick={() => setMode('login')} type="button">
          Login
        </button>
        <button className={mode === 'register' ? 'selected' : ''} onClick={() => setMode('register')} type="button">
          Register
        </button>
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
        {mode === 'reset' && !code ? 'Send OTP' : 'Submit'}
      </button>
      <GoogleLoginButton
        onCredential={async (credential) => {
          setError('')
          await loginGoogle(credential)
        }}
        onError={setError}
      />
      <div className="auth-links">
        <button onClick={() => setMode('verify')} type="button">
          Verify OTP
        </button>
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
          {cooldownSeconds > 0 ? `${cooldownSeconds}s` : 'Resend'}
        </button>
        <button onClick={() => setMode('reset')} type="button">
          Reset
        </button>
      </div>
    </form>
  )
}
