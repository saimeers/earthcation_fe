import { Input } from '@/shared/ui/input'
import { Card, CardContent } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { rowStatus, type EditableField, type ImportRow, type StatusTone } from '../../domain/importRows'

const TONE_CLASS: Record<StatusTone, string> = {
  ok: 'text-emerald-600', warning: 'text-amber-600', error: 'text-destructive', none: '',
}

export interface ImportRowsProps {
  rows: ImportRow[]
  selected: Set<number>
  disabled: boolean
  onToggle: (index: number) => void
  onToggleAll: () => void
  onEdit: (index: number, field: EditableField, value: string) => void
}

// Columnas editables de escritorio, con su ancho
const DESKTOP_FIELDS: { field: EditableField, label: string, width: string, className?: string, lgOnly?: boolean }[] = [
  { field: 'cedula', label: 'Cédula', width: 'w-28', className: 'font-mono' },
  { field: 'first_name', label: 'Nombre', width: 'w-28' },
  { field: 'last_name', label: 'Apellido', width: 'w-28' },
  { field: 'email', label: 'Correo', width: 'w-40' },
  { field: 'organization_name', label: 'Organización', width: 'w-32' },
  { field: 'location_municipality', label: 'Municipio', width: 'w-28', lgOnly: true },
  { field: 'location_department', label: 'Departamento', width: 'w-32', lgOnly: true },
]

// Orden y ancho de los campos en las tarjetas de móvil
const MOBILE_FIELDS: { field: EditableField, label: string, span?: boolean, className?: string }[] = [
  { field: 'cedula', label: 'Cédula', className: 'font-mono' },
  { field: 'email', label: 'Correo' },
  { field: 'first_name', label: 'Nombre' },
  { field: 'last_name', label: 'Apellido' },
  { field: 'organization_name', label: 'Organización', span: true },
  { field: 'location_municipality', label: 'Municipio' },
  { field: 'location_department', label: 'Departamento' },
]

/** Vista de tarjetas — móvil. */
export function ImportRowCards({ rows, selected, disabled, onToggle, onEdit }: ImportRowsProps) {
  return (
    <div className="md:hidden space-y-3">
      {rows.map((row, i) => {
        const status = rowStatus(row.status)
        return (
          <Card key={i} className={selected.has(i) ? '' : 'opacity-50'}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selected.has(i)} onChange={() => onToggle(i)} disabled={disabled} />
                  <span className="font-mono text-xs text-muted-foreground">Fila {i + 1}</span>
                </label>
                <span className={`text-xs whitespace-nowrap ${TONE_CLASS[status.tone]}`}>{status.text}</span>
              </div>
              {row.message && <p className="text-xs text-muted-foreground -mt-2">{row.message}</p>}

              <div className="grid grid-cols-2 gap-2">
                {MOBILE_FIELDS.map(f => (
                  <div key={f.field} className={`space-y-1${f.span ? ' col-span-2' : ''}`}>
                    <label className="text-[11px] text-muted-foreground">{f.label}</label>
                    <Input value={row[f.field]} onChange={e => onEdit(i, f.field, e.target.value)} className={`h-8 ${f.className ? `${f.className} ` : ''}text-xs`} disabled={disabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/** Vista de tabla — escritorio. */
export function ImportRowsTable({ rows, selected, disabled, onToggle, onToggleAll, onEdit }: ImportRowsProps) {
  return (
    <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-8">
              <input type="checkbox" checked={rows.length > 0 && selected.size === rows.length} onChange={onToggleAll} disabled={disabled} />
            </TableHead>
            {DESKTOP_FIELDS.map(f => (
              <TableHead key={f.field} className={f.lgOnly ? 'hidden lg:table-cell' : undefined}>{f.label}</TableHead>
            ))}
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const status = rowStatus(row.status)
            return (
              <TableRow key={i} className={selected.has(i) ? '' : 'opacity-50'}>
                <TableCell>
                  <input type="checkbox" checked={selected.has(i)} onChange={() => onToggle(i)} disabled={disabled} />
                </TableCell>
                {DESKTOP_FIELDS.map(f => (
                  <TableCell key={f.field} className={f.lgOnly ? 'hidden lg:table-cell' : undefined}>
                    <Input
                      value={row[f.field]}
                      onChange={e => onEdit(i, f.field, e.target.value)}
                      className={`h-8 ${f.width} ${f.className ? `${f.className} ` : ''}text-xs`}
                      disabled={disabled}
                    />
                  </TableCell>
                ))}
                <TableCell className={`text-xs whitespace-nowrap ${TONE_CLASS[status.tone]}`}>
                  {status.text}
                  {row.message && <div className="text-muted-foreground">{row.message}</div>}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
