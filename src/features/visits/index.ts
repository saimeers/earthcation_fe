// API pública del feature de visitas (panel developer).
import { bindPort } from '@/shared/lib/ports'
import { visitsPort } from './application/ports'
import { visitsHttp } from './infrastructure/visitsHttp'

export { VisitsPage } from './ui/pages/VisitsPage'

export const visitsBindings = [bindPort(visitsPort, visitsHttp)]
