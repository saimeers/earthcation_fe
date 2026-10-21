import { v1 } from '@/shared/api/v1'
import type { LocationDto } from '@/shared/api/types'
import type { LocationsGateway } from '../application/ports'

export const locationsHttp: LocationsGateway = {
  list: () => v1.list<LocationDto>('/locations', { include_inactive: true }),
  create: (input) => v1.post('/locations', input),
  update: (id, input) => v1.patch(`/locations/${id}`, input),
  setActive: (id, active) => v1.put(`/locations/${id}/active`, { is_active: active }),
}
