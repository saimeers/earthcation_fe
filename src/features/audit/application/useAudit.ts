import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usePort } from '@/shared/lib/ports'
import { saveBlob } from '@/shared/lib/download'
import type { AuditFilters } from '../domain/audit'
import { auditKeys, auditPort } from './ports'

export function useAuditLogs(filters: AuditFilters, page: number) {
  const gateway = usePort(auditPort)
  return useQuery({
    queryKey: auditKeys.list(filters, page),
    queryFn: () => gateway.list(filters, page),
    placeholderData: keepPreviousData,
  })
}

export function useExportAudit() {
  const gateway = usePort(auditPort)
  return useMutation({
    mutationFn: async (filters: AuditFilters) => {
      saveBlob(await gateway.exportCsv(filters), `auditoria-${new Date().toISOString().slice(0, 10)}.csv`)
    },
    onSuccess: () => toast.success('Auditoría descargada'),
    onError: () => toast.error('No se pudo exportar la auditoría'),
  })
}
