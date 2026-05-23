import { RegisterForm } from '../features/auth/components/RegisterForm'

export function RegisterPage() {
  return (
    <section className="auth-page">
      <div>
        <span className="eyebrow">Account</span>
        <h1>Register</h1>
      </div>
      <RegisterForm />
    </section>
  )
}
