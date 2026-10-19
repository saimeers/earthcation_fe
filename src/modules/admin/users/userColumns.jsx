import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { SortableHeader, RoleCell } from './userColumnCells'

export function useUserColumns({ onEdit, onConfirmAction, readOnly = false }) {
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
      cell: ({ getValue }) => <span className="text-sm text-muted-foreground truncate max-w-45 block">{getValue() ?? '—'}</span>,
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
  ].filter(c => !(readOnly && c.id === 'actions')), [onEdit, onConfirmAction, readOnly])
}