import { v1 } from '@/shared/api/v1'
import type { AnalyticsOverviewDto, MineDto, OrganizationPlayerDto, TelemetryOverviewDto, VarkEntryDto } from '@/shared/api/types'
import type { AnalyticsGateway } from '../application/ports'

export const analyticsHttp: AnalyticsGateway = {
  overview: () => v1.get<AnalyticsOverviewDto>('/analytics/overview'),
  varkAll: () => v1.list<VarkEntryDto>('/vark-results'),
  minesMap: () => v1.get<MineDto[]>('/analytics/mines-map'),
  byOrganization: (orgId) => v1.get<OrganizationPlayerDto[]>(`/analytics/organizations/${orgId}`),
  telemetryOverview: () => v1.get<TelemetryOverviewDto>('/telemetry/overview'),
}
