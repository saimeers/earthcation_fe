import { http } from '@/shared/api/client'
import type { VisitStatsDto } from '@/shared/api/types'
import type { VisitsGateway } from '../application/ports'

export const visitsHttp: VisitsGateway = {
  stats: (days) => http.get<VisitStatsDto>('/api/visits/stats', { days }),
}
