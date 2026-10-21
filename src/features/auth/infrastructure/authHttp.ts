import { http } from '@/shared/api/client'
import type { LoginResponseDto } from '@/shared/api/types'
import type { AuthGateway } from '../application/ports'

export const authHttp: AuthGateway = {
  login: (credentials) => http.post<LoginResponseDto>('/api/auth/login', credentials).then(({ token, user }) => ({ token, user })),
  forgotPassword: (email) => http.post('/api/auth/forgot-password', { email }).then(() => undefined),
  resetPassword: (token, newPassword) => http.post('/api/auth/reset-password', { token, new_password: newPassword }).then(() => undefined),
}
