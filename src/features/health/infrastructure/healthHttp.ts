import { v1 } from '@/shared/api/v1'
import type { HealthDto } from '@/shared/api/types'
import type { HealthGateway } from '../application/ports'

export const healthHttp: HealthGateway = {
  details: () => v1.get<HealthDto>('/health/details'),
}
