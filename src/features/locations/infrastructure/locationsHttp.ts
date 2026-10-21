import { http } from '@/shared/api/client'
import type { LocationDto } from '@/shared/api/types'
import type { LocationsGateway } from '../application/ports'

export const locationsHttp: LocationsGateway = {
  list: () => http.get<LocationDto[]>('/api/locations'),
  create: (input) => http.post('/api/locations', input).then(() => undefined),
  update: (id, input) => http.put(`/api/locations/${id}`, input).then(() => undefined),
  setActive: (id, active) => http.patch(`/api/locations/${id}/${active ? 'enable' : 'disable'}`).then(() => undefined),
}
