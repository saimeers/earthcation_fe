// API pública del feature de salud del servicio (panel developer).
import { bindPort } from '@/shared/lib/ports'
import { healthPort } from './application/ports'
import { healthHttp } from './infrastructure/healthHttp'

export { HealthPage } from './ui/pages/HealthPage'

export const healthBindings = [bindPort(healthPort, healthHttp)]
