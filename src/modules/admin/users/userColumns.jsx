import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react'
import { ROLES, roleLabel, roleVariant } from './constants'

function SortIcon({ column }) {
  if (!column.getIsSorted()) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />
  if (column.getIsSorted() === 'asc') return <ArrowUp className="h-3 w-3" />
  return <ArrowDown className="h-3 w-3" />
}

function SortableHeader({ column, children }) {
  return (
    <button
      className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors select-none"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {children}
      <SortIcon column={column} />
    </button>
  )
}

function RoleCell({ row, onRoleChange }) {
  const role = row.original.role
  return (
    <Select
      value={role}
      onValueChange={(newRole) => {
        if (newRole !== role) onRoleChange(row.original, newRole)
      }}>
      <SelectTrigger className="h-7 w-fit min-w-[7rem] border border-border/60 bg-background text-xs shadow-none focus:ring-1 focus:ring-ring">
        <SelectValue>
          <Badge variant={roleVariant[role] ?? 'secondary'} className="text-xs font-normal">
            {roleLabel[role] ?? role}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-[200] bg-popover border border-border shadow-lg">
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

export function useUserColumns({ onEdit, onConfirmAction }) {
  return useMemo(() => [
    {
      id: 'full_name',
      accessorFn: row => `${row.first_name ?? ''} ${row.last_name ?? ''}`,
      header: ({ column }) => <SortableHeader column={column}>Nombre</SortableHeader>,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium text-sm leading-tight truncate">
            {row.original.first_name} {row.original.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">@{row.original.username}</p>
        </div>
      ),
    },
    {
      accessorKey: 'cedula',
      header: ({ column }) => <SortableHeader column={column}>Cédula</SortableHeader>,
      cell: ({ getValue }) => <span className="text-sm font-mono tabular-nums">{getValue() ?? '—'}</span>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <SortableHeader column={column}>Correo</SortableHeader>,
      cell: ({ getValue }) => <span className="text-sm text-muted-foreground truncate max-w-[180px] block">{getValue() ?? '—'}</span>,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <SortableHeader column={column}>Rol</SortableHeader>,
      cell: ({ row }) => (
        <RoleCell
          row={row}
          onRoleChange={(user, newRole) => onConfirmAction({ type: 'role', user, newRole })}
        />
      ),
    },
    {
      id: 'vark',
      header: 'Estilo VARK',
      accessorFn: row => row.varkProfile?.dominant_style,
      cell: ({ row }) => {
        if (row.original.role !== 'player') return <span className="text-xs text-muted-foreground/40">—</span>
        const style = row.original.varkProfile?.dominant_style
        return style
          ? <Badge variant="outline" className="text-xs font-normal">{style}</Badge>
          : <span className="text-xs text-muted-foreground/50">Sin completar</span>
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const isActive = row.original.is_active !== false
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" sideOffset={10} className="w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
              <DropdownMenuItem className="text-sm cursor-pointer" onClick={() => onEdit(row.original)}>
                Editar datos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isActive ? (
                <DropdownMenuItem
                  className="text-sm cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30"
                  onClick={() => onConfirmAction({ type: 'disable', user: row.original })}>
                  Deshabilitar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-sm cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-950/30"
                  onClick={() => onConfirmAction({ type: 'enable', user: row.original })}>
                  Habilitar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [onEdit, onConfirmAction])
}