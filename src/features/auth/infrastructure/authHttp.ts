import { v1 } from '@/shared/api/v1'
import type { LoginResponseDto } from '@/shared/api/types'
import type { AuthGateway } from '../application/ports'

export const authHttp: AuthGateway = {
  login: (credentials) => v1.post<LoginResponseDto>('/auth/login', credentials).then(({ token, user }) => ({ token, user })),
  forgotPassword: (email) => v1.post('/auth/password-resets', { email }),
  resetPassword: (token, newPassword) => v1.put('/auth/password', { token, new_password: newPassword }),
}
