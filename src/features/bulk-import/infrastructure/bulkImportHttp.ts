import { http } from '@/shared/api/client'
import type { ConfirmImportResponseDto, ParseImportResponseDto } from '@/shared/api/types'
import type { BulkImportGateway } from '../application/ports'

export const bulkImportHttp: BulkImportGateway = {
  parse: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post<ParseImportResponseDto>('/api/users/bulk-import/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.rows)
  },
  confirm: (rows) => http.post<ConfirmImportResponseDto>('/api/users/bulk-import/confirm', { rows }),
}
