import type { ReactNode } from 'react'
import type { Column, Row } from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu'
import { ROLES, roleLabel, type Role, type User, type UserAction } from '../../../domain/users'

// Los rótulos de rol van sin variante de color (texto sobre el fondo de la celda), como siempre.
const ROLE_BADGE = null

function SortIcon({ column }: { column: Column<User> }) {
  if (!column.getIsSorted()) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />
  if (column.getIsSorted() === 'asc') return <ArrowUp className="h-3 w-3" />
  return <ArrowDown className="h-3 w-3" />
}

export function SortableHeader({ column, children }: { column: Column<User>, children: ReactNode }) {
  return (
    <button
      className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors select-none"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {children}
      <SortIcon column={column} />
    </button>
  )
}

export function RoleBadge({ role, className = 'text-xs font-normal' }: { role: string, className?: string }) {
  return <Badge variant={ROLE_BADGE} className={className}>{roleLabel(role)}</Badge>
}

export function RoleCell({ row, onRoleChange }: { row: Row<User>, onRoleChange: (user: User, role: Role) => void }) {
  const role = row.original.role
  return (
    <Select value={role} onValueChange={(newRole) => { if (newRole !== role) onRoleChange(row.original, newRole as Role) }}>
      <SelectTrigger className="h-7 w-fit min-w-28 border border-border/60 bg-background text-xs shadow-none focus:ring-1 focus:ring-ring">
        <SelectValue>
          <RoleBadge role={role} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-200 bg-popover border border-border shadow-lg">
        {ROLES.map(r => (
          <SelectItem key={r.value} value={r.value} className="text-sm cursor-pointer">
            <div className="flex items-center gap-2">
              <RoleBadge role={r.value} />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function RowActions({ user, onEdit, onConfirm }: { user: User, onEdit: (u: User) => void, onConfirm: (a: UserAction) => void }) {
  const isActive = user.is_active !== false
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Acciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" sideOffset={10} className="w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
        <DropdownMenuItem className="text-sm cursor-pointer" onClick={() => onEdit(user)}>
          Editar datos
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isActive ? (
          <DropdownMenuItem
            className="text-sm cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30"
            onClick={() => onConfirm({ type: 'disable', user })}>
            Deshabilitar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-sm cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-950/30"
            onClick={() => onConfirm({ type: 'enable', user })}>
            Habilitar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
