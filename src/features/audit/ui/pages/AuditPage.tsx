import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { NO_FILTERS, type AuditFilters } from '../../domain/audit'
import { useAuditLogs, useExportAudit } from '../../application/useAudit'
import { AuditFiltersBar } from '../components/AuditFiltersBar'
import { AuditTable } from '../components/AuditTable'

export function AuditPage() {
  const [filters, setFilters] = useState<AuditFilters>(NO_FILTERS)
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching } = useAuditLogs(filters, page)
  const exportCsv = useExportAudit()
  const change = (next: AuditFilters) => { setFilters(next); setPage(1) }
  const totalPages = data?.meta.total_pages ?? 1

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Auditoría</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Quién hizo qué y cuándo. Los registros no se editan ni se borran, y no guardan datos personales ni la IP, solo una huella de ella.
        </p>
      </div>
      <AuditFiltersBar filters={filters} onChange={change} onExport={() => exportCsv.mutate(filters)} exporting={exportCsv.isPending} />
      {isLoading || !data ? <Skeleton className="h-96 rounded-xl" /> : !data.items.length ? (
        <p className="text-sm text-muted-foreground py-10 text-center rounded-xl border border-dashed">No hay registros con estos filtros.</p>
      ) : <AuditTable entries={data.items} />}
      {data && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{data.meta.total} registros{isFetching ? ' · actualizando…' : ''}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="tabular-nums">Página {page} de {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Página siguiente" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
