// API pública del feature de autenticación: pantallas de acceso, sesión actual, panel en uso y guías.
import { bindPort } from '@/shared/lib/ports'
import { authPort } from './application/ports'
import { authHttp } from './infrastructure/authHttp'

export { LoginPage } from './ui/pages/LoginPage'
export { ForgotPasswordPage } from './ui/pages/ForgotPasswordPage'
export { ResetPasswordPage } from './ui/pages/ResetPasswordPage'
export { OnboardingCard } from './ui/components/OnboardingCard'

export { useAuthStore, currentToken, expireSession } from './application/authStore'
export { usePanelBase, useCanEdit } from './application/usePanel'
export { roleAllowed, type AuthUser, type PanelBase, type Role } from './domain/roles'

export const authBindings = [bindPort(authPort, authHttp)]
