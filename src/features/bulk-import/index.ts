// API pública del feature de carga masiva de usuarios (Excel ANM).
import { bindPort } from '@/shared/lib/ports'
import { bulkImportPort } from './application/ports'
import { bulkImportHttp } from './infrastructure/bulkImportHttp'

export { BulkImportUsersPage } from './ui/pages/BulkImportUsersPage'

export const bulkImportBindings = [bindPort(bulkImportPort, bulkImportHttp)]
