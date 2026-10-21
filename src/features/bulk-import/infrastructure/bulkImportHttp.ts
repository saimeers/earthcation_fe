import { v1 } from '@/shared/api/v1'
import type { ConfirmImportResponseDto, ParseImportResponseDto } from '@/shared/api/types'
import type { BulkImportGateway } from '../application/ports'

export const bulkImportHttp: BulkImportGateway = {
  parse: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return v1.post<ParseImportResponseDto>('/user-imports/previews', formData).then(r => r.rows)
  },
  confirm: (rows) => v1.post<ConfirmImportResponseDto>('/user-imports', { rows }),
}
