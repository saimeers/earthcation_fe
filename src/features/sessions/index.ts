// API pública del feature de sesiones: pantallas, la escala de desempeño y piezas que reutilizan
// otras pantallas (analíticas).
import { bindPort } from '@/shared/lib/ports'
import { sessionsPort } from './application/ports'
import { sessionsHttp } from './infrastructure/sessionsHttp'

export { SessionsPage } from './ui/pages/SessionsPage'
export { SessionDetailPage } from './ui/pages/SessionDetailPage'
export { ParticipantAnalysisPage } from './ui/pages/ParticipantAnalysisPage'
export { SessionReportPage } from './ui/pages/SessionReportPage'
export { BandPill } from './ui/components/BandPill'
export { bandMeta, categoryIcon, outcomeSegments } from './ui/meta'
export { bandFor, rateTone } from './domain/bands'
export { failReasonLabel, levelLabel } from './domain/telemetry'

export const sessionsBindings = [bindPort(sessionsPort, sessionsHttp)]
