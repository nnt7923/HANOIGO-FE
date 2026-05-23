import { LoginForm } from '../features/auth/components/LoginForm'

export function LoginPage() {
  return (
    <section className="auth-page">
      <div>
        <span className="eyebrow">Account</span>
        <h1>Login</h1>
      </div>
      <LoginForm />
    </section>
  )
}
