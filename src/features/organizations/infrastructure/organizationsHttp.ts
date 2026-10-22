import { v1 } from '@/shared/api/v1'
import type { OrganizationDto } from '@/shared/api/types'
import type { OrganizationsGateway } from '../application/ports'

export const organizationsHttp: OrganizationsGateway = {
  list: () => v1.list<OrganizationDto>('/organizations', { include_inactive: true }),
  create: (input) => v1.post('/organizations', input),
  update: (id, input) => v1.patch(`/organizations/${id}`, input),
  setActive: (id, active) => v1.put(`/organizations/${id}/active`, { is_active: active }),
}
