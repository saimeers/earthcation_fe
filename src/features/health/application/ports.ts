import { definePort } from '@/shared/lib/ports'
import type { Health } from '../domain/health'

/** GET /api/v1/health/details. */
export interface HealthGateway {
  details(): Promise<Health>
}

export const healthPort = definePort<HealthGateway>('health')

export const healthKeys = {
  details: () => ['health', 'details'] as const,
}
