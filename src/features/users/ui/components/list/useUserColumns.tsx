import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/shared/ui/badge'
import type { User, UserAction } from '../../../domain/users'
import { RoleCell, RowActions, SortableHeader } from './userCells'

interface UserColumnsOptions {
  onEdit: (user: User) => void
  onConfirmAction: (action: UserAction) => void
  readOnly?: boolean
}

export function useUserColumns({ onEdit, onConfirmAction, readOnly = false }: UserColumnsOptions): ColumnDef<User>[] {
  return useMemo(() => {
    const columns: ColumnDef<User>[] = [
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
        cell: ({ getValue }) => <span className="text-sm font-mono tabular-nums">{getValue<string | null>() ?? '—'}</span>,
      },
      {
        accessorKey: 'email',
        header: ({ column }) => <SortableHeader column={column}>Correo</SortableHeader>,
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground truncate max-w-45 block">{getValue<string | null>() ?? '—'}</span>,
      },
      {
        accessorKey: 'role',
        header: ({ column }) => <SortableHeader column={column}>Rol</SortableHeader>,
        cell: ({ row }) => <RoleCell row={row} onRoleChange={(user, newRole) => onConfirmAction({ type: 'role', user, newRole })} />,
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
        cell: ({ row }) => <RowActions user={row.original} onEdit={onEdit} onConfirm={onConfirmAction} />,
      },
    ]
    return columns.filter(c => !(readOnly && c.id === 'actions'))
  }, [onEdit, onConfirmAction, readOnly])
}
