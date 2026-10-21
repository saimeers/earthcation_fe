import { v1 } from '@/shared/api/v1'
import type { CreateUserResponseDto, ProgressRowDto, UserDto, UserSessionDto } from '@/shared/api/types'
import type { UsersGateway } from '../application/ports'

export const usersHttp: UsersGateway = {
  list: () => v1.list<UserDto>('/users'),
  get: (id) => v1.get<UserDto>(`/users/${id}`),
  sessions: (id) => v1.list<UserSessionDto>(`/users/${id}/sessions`),
  progressHistory: (id) => v1.list<ProgressRowDto>(`/users/${id}/risk-results`),
  create: (payload) => v1.post<CreateUserResponseDto | null>('/users', payload).then(r => r ?? {}),
  update: (id, payload) => v1.patch(`/users/${id}`, payload),
  setActive: (id, active) => v1.put(`/users/${id}/active`, { is_active: active }),
}
