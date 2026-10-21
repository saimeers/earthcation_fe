import { definePort } from '@/shared/lib/ports'
import type { Mine } from '../domain/minesMap'
import type { OrganizationPlayer, Overview, TelemetryOverview, VarkEntry } from '../domain/overview'

export interface AnalyticsGateway {
  overview(): Promise<Overview>
  varkAll(): Promise<VarkEntry[]>
  minesMap(): Promise<Mine[]>
  byOrganization(orgId: string): Promise<OrganizationPlayer[]>
  /** Telemetría agregada de todo el juego. */
  telemetryOverview(): Promise<TelemetryOverview>
}

export const analyticsPort = definePort<AnalyticsGateway>('analytics')

export const analyticsKeys = {
  overview: () => ['analytics', 'overview'] as const,
  vark: () => ['analytics', 'vark'] as const,
  map: () => ['analytics', 'map'] as const,
  organization: (orgId: string) => ['analytics', 'organization', orgId] as const,
  telemetry: () => ['telemetry', 'overview', {}] as const,
}
