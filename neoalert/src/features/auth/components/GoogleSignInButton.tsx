import { useEffect, useRef, useState } from 'react'
import { Button } from '@shared/components/ui/Button'
import { USE_MOCK_API } from '@shared/config/api.config'
import { GOOGLE_CLIENT_ID } from '@shared/config/auth.config'

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void
  onError?: (message: string) => void
  disabled?: boolean
}

interface GoogleCredentialResponse {
  credential?: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
  }) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black'
      size?: 'large' | 'medium' | 'small'
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
      width?: number
      locale?: string
    },
  ) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId
      }
    }
  }
}

const GIS_SCRIPT_ID = 'google-identity-services'
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  const existing = document.getElementById(GIS_SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google Sign-In.')), {
        once: true,
      })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = GIS_SCRIPT_ID
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Google Sign-In.'))
    document.head.appendChild(script)
  })
}

export function GoogleSignInButton({ onSuccess, onError, disabled = false }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [scriptError, setScriptError] = useState<string | null>(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || USE_MOCK_API) {
      return
    }

    let cancelled = false

    const handleCredential = (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        onError?.('No se recibió credencial de Google.')
        return
      }
      onSuccess(response.credential)
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) {
          return
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        buttonRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: 380,
          locale: 'es',
        })
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : 'No se pudo cargar Google Sign-In.'
        setScriptError(message)
        onError?.(message)
      })

    return () => {
      cancelled = true
    }
  }, [onError, onSuccess])

  if (!GOOGLE_CLIENT_ID && !USE_MOCK_API) {
    return null
  }

  if (USE_MOCK_API) {
    return (
      <Button
        type="button"
        variant="secondary"
        fullWidth
        disabled={disabled}
        onClick={() => onSuccess('mock-google-id-token')}
      >
        Continuar con Google (demo)
      </Button>
    )
  }

  if (scriptError) {
    return <p className="text-sm text-red-600">{scriptError}</p>
  }

  return (
    <div
      ref={buttonRef}
      className={disabled ? 'pointer-events-none opacity-60' : undefined}
    />
  )
}
