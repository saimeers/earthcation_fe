// Tipos de las respuestas de la API v1, escritos a mano contra el backend (earthcation_be).
// En la fase de API v2 se generarán del OpenAPI. Las fechas llegan como texto ISO 8601.
export type Uuid = string
export type IsoDate = string

export type Role = 'player' | 'instructor' | 'admin' | 'developer'

export interface LocationDto {
  id: Uuid
  municipality: string
  department: string
  country: string
  is_active: boolean
}

export interface OrganizationDto {
  id: Uuid
  name: string
  type: string | null
  is_active: boolean
  created_at?: IsoDate
}

export interface ProfileDto {
  id?: Uuid
  user_id?: Uuid
  organization_id: Uuid | null
  location_id: Uuid | null
  organization?: OrganizationDto | null
  location?: LocationDto | null
}

export interface VarkProfileDto {
  id?: Uuid
  user_id?: Uuid
  visual_score: number | null
  auditory_score: number | null
  reading_score: number | null
  dominant_style: string | null
}

/** Datos mínimos de una persona que vienen anidados en otras respuestas. */
export interface PersonDto {
  id: Uuid
  first_name: string | null
  last_name: string | null
  username?: string | null
  cedula?: string | null
  email?: string | null
  role?: Role
}
