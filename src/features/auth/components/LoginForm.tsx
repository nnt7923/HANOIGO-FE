import { AuthPanel } from './AuthPanel'

export function LoginForm({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  return <AuthPanel initialMode="login" onAuthSuccess={onAuthSuccess} />
}
