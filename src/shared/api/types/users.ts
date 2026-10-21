import type { IsoDate, PersonDto, ProfileDto, Role, Uuid, VarkProfileDto } from './common'
import type { SessionStatus } from './sessions'

export interface UserDto extends PersonDto {
  role: Role
  username: string | null
  cedula: string | null
  email: string | null
  age: number | null
  is_active: boolean
  created_at?: IsoDate
  profile?: ProfileDto | null
  varkProfile?: VarkProfileDto | null
}

/** Cuerpo de crear/editar un usuario: los opcionales vacíos van como null, nunca ''. */
export interface UserWriteDto {
  first_name: string
  last_name: string
  cedula: string
  email: string | null
  username?: string
  role: Role
  age: number | null
  organization_id: Uuid | null
  location_id: Uuid | null
}

export interface CreateUserResponseDto extends Partial<UserDto> {
  email_sent?: boolean
}

export interface RiskRefDto {
  id?: string
  name?: string
  category?: string
  level_id?: number | string | null
  level?: { id: number | string, name: string } | null
}

/** Una fila del historial de progreso por riesgo (GET /api/v1/users/:id/risk-results). */
export interface ProgressRowDto {
  id: Uuid
  risk_id: string
  attempt_id?: Uuid | null
  session_id?: Uuid | null
  is_mitigated: boolean
  mistakes_count?: number | null
  reaction_time_ms?: number | null
  recorded_at: IsoDate
  risk?: RiskRefDto | null
}

/** Inscripción de un usuario en una sesión (GET /api/v1/users/:id/sessions). */
export interface UserSessionDto {
  id: Uuid
  joined_at: IsoDate | null
  session?: { id: Uuid, name: string, code: string | null, status: SessionStatus } | null
}
