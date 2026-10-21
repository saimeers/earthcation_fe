import { v1 } from '@/shared/api/v1'
import type { VisitStatsDto } from '@/shared/api/types'
import type { VisitsGateway } from '../application/ports'

export const visitsHttp: VisitsGateway = {
  stats: (days) => v1.get<VisitStatsDto>('/visits/stats', { days }),
}
