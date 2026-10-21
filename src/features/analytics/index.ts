// API pública del feature de analíticas.
import { bindPort } from '@/shared/lib/ports'
import { analyticsPort } from './application/ports'
import { analyticsHttp } from './infrastructure/analyticsHttp'

export { AnalyticsPage } from './ui/pages/AnalyticsPage'

export const analyticsBindings = [bindPort(analyticsPort, analyticsHttp)]
