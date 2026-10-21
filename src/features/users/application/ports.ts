import { definePort } from '@/shared/lib/ports'
import type { CreateUserResponseDto, UserSessionDto, UserWriteDto } from '@/shared/api/types'
import type { User } from '../domain/users'
import type { ProgressRow } from '../domain/attempts'

export interface UsersGateway {
  list(): Promise<User[]>
  get(id: string): Promise<User>
  sessions(id: string): Promise<UserSessionDto[]>
  progressHistory(id: string): Promise<ProgressRow[]>
  create(payload: UserWriteDto): Promise<CreateUserResponseDto>
  update(id: string, payload: Partial<UserWriteDto>): Promise<void>
  setActive(id: string, active: boolean): Promise<void>
}

export const usersPort = definePort<UsersGateway>('users')

export const userKeys = {
  all: ['users'] as const,
  list: () => ['users', 'all'] as const,
  detail: (id: string) => ['users', id] as const,
  progress: (id: string) => ['users', id, 'progress'] as const,
  sessions: (id: string) => ['users', id, 'sessions'] as const,
}
