import { definePort } from '@/shared/lib/ports'
import type { Location, LocationInput } from '../domain/locations'

export interface LocationsGateway {
  list(): Promise<Location[]>
  create(input: LocationInput): Promise<void>
  update(id: string, input: LocationInput): Promise<void>
  setActive(id: string, active: boolean): Promise<void>
}

export const locationsPort = definePort<LocationsGateway>('locations')

export const locationKeys = {
  all: ['locations'] as const,
}
