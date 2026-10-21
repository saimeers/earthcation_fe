import { useMutation } from '@tanstack/react-query'
import { usePort } from '@/shared/lib/ports'
import { homeFor, type AuthUser, type PanelBase } from '../domain/roles'
import { authPort, type Credentials } from './ports'
import { useAuthStore } from './authStore'

export type LoginOutcome =
  | { status: 'ok', user: AuthUser, home: PanelBase }
  | { status: 'forbidden', user: AuthUser }

/** Inicia sesión. Un jugador no entra al panel: la sesión no se guarda. Los errores de la API se lanzan. */
export function useLogin() {
  const auth = usePort(authPort)
  const setAuth = useAuthStore(s => s.setAuth)
  return useMutation({
    mutationFn: async (credentials: Credentials): Promise<LoginOutcome> => {
      const { token, user } = await auth.login(credentials)
      const home = homeFor(user.role)
      if (!home) return { status: 'forbidden', user }
      setAuth(token, user)
      return { status: 'ok', user, home }
    },
  })
}

/** Pide el enlace de recuperación. Responde igual exista o no el correo (no revela cuentas). */
export function useForgotPassword() {
  const auth = usePort(authPort)
  return useMutation({
    mutationFn: (email: string) => auth.forgotPassword(email).catch(() => undefined),
  })
}

export function useResetPassword() {
  const auth = usePort(authPort)
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string, newPassword: string }) => auth.resetPassword(token, newPassword),
  })
}
