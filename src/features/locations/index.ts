// API pública del feature de localidades (catálogo de municipios).
import { bindPort } from '@/shared/lib/ports'
import { locationsPort } from './application/ports'
import { locationsHttp } from './infrastructure/locationsHttp'

export { LocationsPage } from './ui/pages/LocationsPage'
export { LocationCombobox } from './ui/components/LocationCombobox'
export { useLocationList } from './application/useLocations'
export { findLocation, type Location } from './domain/locations'

export const locationsBindings = [bindPort(locationsPort, locationsHttp)]
