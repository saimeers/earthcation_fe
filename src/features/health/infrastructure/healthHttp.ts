import { http } from '@/shared/api/client'
import type { HealthDto } from '@/shared/api/types'
import type { HealthGateway } from '../application/ports'

export const healthHttp: HealthGateway = {
  details: () => http.get<HealthDto>('/api/health/details'),
}
