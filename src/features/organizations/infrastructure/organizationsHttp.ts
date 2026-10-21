import { http } from '@/shared/api/client'
import type { OrganizationDto } from '@/shared/api/types'
import type { OrganizationsGateway } from '../application/ports'

export const organizationsHttp: OrganizationsGateway = {
  list: () => http.get<OrganizationDto[]>('/api/organizations'),
  create: (input) => http.post('/api/organizations', input).then(() => undefined),
  update: (id, input) => http.put(`/api/organizations/${id}`, input).then(() => undefined),
  setActive: (id, active) => http.patch(`/api/organizations/${id}/${active ? 'enable' : 'disable'}`).then(() => undefined),
}
