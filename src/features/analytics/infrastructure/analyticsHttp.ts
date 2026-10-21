import { http } from '@/shared/api/client'
import type { AnalyticsOverviewDto, MineDto, OrganizationPlayerDto, TelemetryOverviewDto, VarkEntryDto } from '@/shared/api/types'
import type { AnalyticsGateway } from '../application/ports'

export const analyticsHttp: AnalyticsGateway = {
  overview: () => http.get<AnalyticsOverviewDto>('/api/analytics/overview'),
  varkAll: () => http.get<VarkEntryDto[]>('/api/vark/all'),
  minesMap: () => http.get<MineDto[]>('/api/analytics/map'),
  byOrganization: (orgId) => http.get<OrganizationPlayerDto[]>(`/api/analytics/organization/${orgId}`),
  telemetryOverview: () => http.get<TelemetryOverviewDto>('/api/telemetry/overview', {}),
}
