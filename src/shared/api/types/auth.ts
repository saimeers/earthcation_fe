import type { Role, Uuid } from './common'

export interface AuthUserDto {
  id: Uuid
  role: Role
  first_name: string | null
  last_name: string | null
  email?: string | null
  username?: string | null
  cedula?: string | null
}

export interface LoginRequestDto { cedula: string, password: string }
export interface LoginResponseDto { message?: string, token: string, user: AuthUserDto }
export interface ForgotPasswordRequestDto { email: string }
export interface ResetPasswordRequestDto { token: string, new_password: string }
