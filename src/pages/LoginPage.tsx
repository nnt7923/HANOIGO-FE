import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthHero } from '../features/auth/components/AuthHero'
import { LoginForm } from '../features/auth/components/LoginForm'
import { useAuth } from '../features/auth/hooks/useAuth'

type AuthLocationState = {
  from?: {
    pathname?: string
    search?: string
  }
}

export function LoginPage() {
  const { user, bootstrapping } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = getRedirectPath(location.state)

  if (!bootstrapping && user) {
    return <Navigate replace to={from} />
  }

  return (
    <section className="auth-page">
      <AuthHero mode="login" />
      <div className="auth-card-column">
        <div className="auth-page-heading">
          <span className="eyebrow">HanoiGo account</span>
          <h1>Login</h1>
        </div>
        <LoginForm onAuthSuccess={() => navigate(from, { replace: true })} />
      </div>
    </section>
  )
}

function getRedirectPath(state: unknown) {
  const from = (state as AuthLocationState | null)?.from
  return `${from?.pathname || '/discover'}${from?.search || ''}`
}
