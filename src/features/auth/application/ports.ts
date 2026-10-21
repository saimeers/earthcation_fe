import { definePort } from '@/shared/lib/ports'
import type { AuthUser } from '../domain/roles'

export interface Credentials { cedula: string, password: string }

/** Lo que el feature de autenticación necesita de la API. */
export interface AuthGateway {
  login(credentials: Credentials): Promise<{ token: string, user: AuthUser }>
  forgotPassword(email: string): Promise<void>
  resetPassword(token: string, newPassword: string): Promise<void>
}

export const authPort = definePort<AuthGateway>('auth')
