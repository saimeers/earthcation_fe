import { definePort } from '@/shared/lib/ports'
import type { Organization, OrganizationInput } from '../domain/organizations'

export interface OrganizationsGateway {
  list(): Promise<Organization[]>
  create(input: OrganizationInput): Promise<void>
  update(id: string, input: OrganizationInput): Promise<void>
  setActive(id: string, active: boolean): Promise<void>
}

export const organizationsPort = definePort<OrganizationsGateway>('organizations')

export const organizationKeys = {
  all: ['organizations'] as const,
}
