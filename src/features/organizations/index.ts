// API pública del feature de organizaciones.
import { bindPort } from '@/shared/lib/ports'
import { organizationsPort } from './application/ports'
import { organizationsHttp } from './infrastructure/organizationsHttp'

export { OrganizationsPage } from './ui/pages/OrganizationsPage'
export { useOrganizationList } from './application/useOrganizations'
export { selectableOrganizations, type Organization } from './domain/organizations'

export const organizationsBindings = [bindPort(organizationsPort, organizationsHttp)]
