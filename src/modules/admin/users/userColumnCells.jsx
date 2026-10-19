import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { ROLES, roleLabel, roleVariant } from './constants'

// Celdas y encabezados de la tabla de usuarios (separados de useUserColumns para que Fast Refresh funcione)
export function SortIcon({ column }) {
  if (!column.getIsSorted()) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />
  if (column.getIsSorted() === 'asc') return <ArrowUp className="h-3 w-3" />
  return <ArrowDown className="h-3 w-3" />
}

export function SortableHeader({ column, children }) {
  return (
    <button
      className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors select-none"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {children}
      <SortIcon column={column} />
    </button>
  )
}

export function RoleCell({ row, onRoleChange }) {
  const role = row.original.role
  return (
    <Select
      value={role}
      onValueChange={(newRole) => {
        if (newRole !== role) onRoleChange(row.original, newRole)
      }}>
      <SelectTrigger className="h-7 w-fit min-w-28 border border-border/60 bg-background text-xs shadow-none focus:ring-1 focus:ring-ring">
        <SelectValue>
          <Badge variant={roleVariant[role] ?? 'secondary'} className="text-xs font-normal">
            {roleLabel[role] ?? role}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-200 bg-popover border border-border shadow-lg">
        {ROLES.map(r => (
          <SelectItem key={r.value} value={r.value} className="text-sm cursor-pointer">
            <div className="flex items-center gap-2">
              <Badge variant={r.variant} className="text-xs font-normal">{r.label}</Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
