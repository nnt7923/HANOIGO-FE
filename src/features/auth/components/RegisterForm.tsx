import { AuthPanel } from './AuthPanel'

export function RegisterForm({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  return <AuthPanel initialMode="register" onAuthSuccess={onAuthSuccess} />
}
