import { http } from '@/shared/api/client'
import type { CreateUserResponseDto, ProgressRowDto, UserDto, UserSessionDto } from '@/shared/api/types'
import type { UsersGateway } from '../application/ports'

const done = () => undefined

export const usersHttp: UsersGateway = {
  list: () => http.get<UserDto[]>('/api/users'),
  get: (id) => http.get<UserDto>(`/api/users/${id}`),
  sessions: (id) => http.get<UserSessionDto[]>(`/api/users/${id}/sessions`),
  progressHistory: (id) => http.get<ProgressRowDto[]>(`/api/progress/user/${id}/history`),
  create: (payload) => http.post<CreateUserResponseDto | null>('/api/users', payload).then(r => r ?? {}),
  update: (id, payload) => http.put(`/api/users/${id}`, payload).then(done),
  setActive: (id, active) => http.patch(`/api/users/${id}/${active ? 'enable' : 'disable'}`).then(done),
}
