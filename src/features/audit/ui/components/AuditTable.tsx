import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { actionLabel, describeChanges, roleLabel, type AuditEntry } from '../../domain/audit'

const when = (iso: string): string =>
  new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })

const TARGET_LABEL: Readonly<Record<string, string>> = {
  user: 'Usuario', organization: 'Organización', location: 'Localidad', session: 'Sesión', game_version: 'Versión del juego',
}

function Row({ entry }: { entry: AuditEntry }) {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap tabular-nums">{when(entry.occurred_at)}</TableCell>
      <TableCell className="font-medium">{actionLabel(entry.action)}</TableCell>
      <TableCell><Badge variant="outline">{roleLabel(entry.actor_role)}</Badge></TableCell>
      <TableCell className="text-muted-foreground">{TARGET_LABEL[entry.target_type] ?? entry.target_type}</TableCell>
      <TableCell className="text-muted-foreground max-w-80 truncate" title={describeChanges(entry.changes)}>{describeChanges(entry.changes) || '—'}</TableCell>
      <TableCell className="font-mono text-[11px] text-muted-foreground" title={entry.user_agent ?? undefined}>{entry.ip_hash?.slice(0, 8) ?? '—'}</TableCell>
    </TableRow>
  )
}

export function AuditTable({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead>Quién</TableHead>
            <TableHead>Sobre</TableHead>
            <TableHead>Qué cambió</TableHead>
            <TableHead>Origen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{entries.map(e => <Row key={e.id} entry={e} />)}</TableBody>
      </Table>
    </div>
  )
}
