import type { IsoDate, PersonDto, Uuid } from './common'

export type VersionStatus = 'uploading' | 'processing' | 'ready' | 'failed'

/** Versión del juego (GET /api/deploy/versions). */
export interface GameVersionDto {
  id: Uuid
  label: string
  notes: string | null
  status: VersionStatus
  is_active: boolean
  size_bytes: number | string | null
  error: string | null
  created_at: IsoDate
  activated_at: IsoDate | null
  uploader?: PersonDto | null
  manifest?: { files?: unknown[], total_bytes?: number | null, compression?: string, warnings?: string[] } | null
}

/** GET /api/deploy/status */
export interface DeployStatusDto {
  play_url?: string | null
  max_mb?: number | null
  storage: { originals: string, published: string }
}

/** Dónde subir el ZIP: URL prefirmada de S3 o, sin S3 (desarrollo), la propia API. */
export interface UploadTicketDto { mode: string, url: string, headers?: Record<string, string> }

export interface CreateVersionRequestDto { label: string, notes: string, size_bytes: number }
export interface CreateVersionResponseDto { version: GameVersionDto, upload: UploadTicketDto }
export interface PreviewDto { url: string }
