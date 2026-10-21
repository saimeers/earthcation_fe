import { definePort } from '@/shared/lib/ports'
import type { Uuid } from '@/shared/api/types'
import type { DeployStatus, GameVersion, UploadTicket } from '../domain/deploy'

/** Progreso de la subida del ZIP, como fracción 0..1. */
export type UploadProgress = (fraction: number) => void

export interface CreateVersionInput { label: string, notes: string, size_bytes: number }

/** Despliegue del build del juego: GET /api/v1/game-versions/status, /api/v1/game-versions y sus acciones. */
export interface DeployGateway {
  status(): Promise<DeployStatus>
  versions(): Promise<GameVersion[]>
  create(input: CreateVersionInput): Promise<{ version: GameVersion, upload: UploadTicket }>
  /** Sube el ZIP: a la URL prefirmada de S3 (sin el token de la API) o, sin S3, a la propia API. */
  upload(ticket: UploadTicket, file: Blob, onProgress?: UploadProgress): Promise<void>
  complete(id: Uuid): Promise<GameVersion>
  activate(id: Uuid): Promise<GameVersion>
  preview(id: Uuid): Promise<string>
  remove(id: Uuid): Promise<void>
}

export const deployPort = definePort<DeployGateway>('deploy')

export const deployKeys = {
  status: () => ['deploy', 'status'] as const,
  versions: () => ['deploy', 'versions'] as const,
}
