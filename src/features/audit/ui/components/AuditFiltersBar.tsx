import { Download, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { ACTIONS, actionLabel, hasFilters, NO_FILTERS, type AuditFilters } from '../../domain/audit'

const ALL = 'all'

interface Props {
  filters: AuditFilters
  onChange: (next: AuditFilters) => void
  onExport: () => void
  exporting: boolean
}

/** Acción y rango de fechas; el CSV se baja con los mismos filtros. */
export function AuditFiltersBar({ filters, onChange, onExport, exporting }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Acción
        <Select value={filters.action || ALL} onValueChange={(v) => onChange({ ...filters, action: v === ALL ? '' : v })}>
          <SelectTrigger className="h-9 w-56 bg-background text-sm"><SelectValue /></SelectTrigger>
          <SelectContent position="popper" className="max-h-72 bg-popover border shadow-lg z-[200]">
            <SelectItem value={ALL} className="text-sm">Todas las acciones</SelectItem>
            {ACTIONS.map(a => <SelectItem key={a} value={a} className="text-sm">{actionLabel(a)}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Desde
        <Input type="date" className="h-9 w-40 bg-background text-sm" value={filters.from} max={filters.to || undefined}
          onChange={(e) => onChange({ ...filters, from: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Hasta
        <Input type="date" className="h-9 w-40 bg-background text-sm" value={filters.to} min={filters.from || undefined}
          onChange={(e) => onChange({ ...filters, to: e.target.value })} />
      </label>
      {hasFilters(filters) && (
        <Button variant="ghost" size="sm" className="h-9" onClick={() => onChange(NO_FILTERS)}>
          <X className="h-3.5 w-3.5 mr-1.5" /> Quitar filtros
        </Button>
      )}
      <Button variant="outline" size="sm" className="h-9 ml-auto" onClick={onExport} disabled={exporting}>
        <Download className="h-3.5 w-3.5 mr-1.5" /> {exporting ? 'Exportando…' : 'Exportar CSV'}
      </Button>
    </div>
  )
}
