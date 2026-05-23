import { useEffect, useRef, useState } from 'react'

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleAccounts = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string
        callback: (response: GoogleCredentialResponse) => void
        auto_select?: boolean
      }) => void
      renderButton: (
        parent: HTMLElement,
        options: {
          theme?: 'outline' | 'filled_blue' | 'filled_black'
          size?: 'large' | 'medium' | 'small'
          text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
          width?: number
        },
      ) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleAccounts
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-services'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

export function GoogleLoginButton({
  onCredential,
  onError,
}: {
  onCredential: (idToken: string) => Promise<void>
  onError: (message: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    if (window.google?.accounts.id) {
      setReady(true)
      return
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)
    if (existingScript) {
      existingScript.addEventListener('load', () => setReady(true), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => setReady(true)
    script.onerror = () => onError('Cannot load Google login')
    document.head.appendChild(script)
  }, [onError])

  useEffect(() => {
    if (!ready || !GOOGLE_CLIENT_ID || !containerRef.current || !window.google?.accounts.id) {
      return
    }

    containerRef.current.innerHTML = ''
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      auto_select: false,
      callback: (response) => {
        if (!response.credential) {
          onError('Google login did not return a credential')
          return
        }
        onCredential(response.credential).catch((error: unknown) => {
          onError(error instanceof Error ? error.message : 'Google login failed')
        })
      },
    })
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      width: 240,
    })
  }, [onCredential, onError, ready])

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="google-login-disabled">
        <span>Google sign-in is unavailable</span>
      </div>
    )
  }

  return <div className="google-login-button" ref={containerRef} />
}
