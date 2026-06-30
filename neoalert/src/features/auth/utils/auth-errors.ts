import { HttpClientError } from '@shared/services/api'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Email already registered': 'Este correo ya está registrado.',
  'Username already taken': 'Este nombre de usuario ya está en uso.',
  'Invalid credentials': 'Usuario o contraseña incorrectos.',
  'Use Google sign-in for this account':
    'Esta cuenta se creó con Google. Usa el botón «Continuar con Google» para entrar; la contraseña de Gmail no funciona aquí.',
  'Email not verified': 'Debes verificar tu correo antes de iniciar sesión.',
  'Invalid verification token': 'El enlace de verificación no es válido.',
  'Verification token already used': 'Este enlace de verificación ya fue utilizado.',
  'Verification token expired': 'El enlace de verificación ha expirado.',
  'Account is inactive': 'Tu cuenta está inactiva. Contacta al administrador.',
  'Google OAuth is not configured': 'El inicio de sesión con Google no está configurado.',
  'Invalid Google ID token': 'No se pudo validar la sesión de Google. Intenta de nuevo.',
  'Invalid Google ID token audience': 'La aplicación de Google no coincide con la configuración.',
  'Google email is not verified': 'Tu correo de Google no está verificado.',
  'Google profile incomplete': 'No se pudo obtener tu perfil de Google.',
}

export function translateAuthError(error: unknown, fallback: string): string {
  if (error instanceof HttpClientError) {
    return AUTH_ERROR_MESSAGES[error.message] ?? error.message
  }
  if (error instanceof Error) {
    return AUTH_ERROR_MESSAGES[error.message] ?? error.message
  }
  return fallback
}

export function mapAuthError(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? message
}
