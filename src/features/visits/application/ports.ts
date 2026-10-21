import { definePort } from '@/shared/lib/ports'
import type { Visits } from '../domain/visits'

/** GET /api/v1/visits/stats?days=. */
export interface VisitsGateway {
  stats(days: number): Promise<Visits>
}

export const visitsPort = definePort<VisitsGateway>('visits')

export const visitsKeys = {
  stats: (days: number) => ['visits', 'stats', days] as const,
}
