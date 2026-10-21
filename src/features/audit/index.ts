// API pública del feature de auditoría (paneles de administrador y soporte).
import { bindPort } from '@/shared/lib/ports'
import { auditPort } from './application/ports'
import { auditHttp } from './infrastructure/auditHttp'

export { AuditPage } from './ui/pages/AuditPage'

export const auditBindings = [bindPort(auditPort, auditHttp)]
