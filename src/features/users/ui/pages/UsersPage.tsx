import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel,
  type PaginationState, type SortingState,
} from '@tanstack/react-table'
import { Plus, Upload } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Separator } from '@/shared/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { OnboardingCard, useCanEdit, usePanelBase } from '@/features/auth'
import { filterByRole, ROLES, type RoleFilter, type UserAction } from '../../domain/users'
import { useUserAction, useUserList } from '../../application/useUsers'
import { useUserColumns } from '../components/list/useUserColumns'
import { UsersPagination, UsersTable } from '../components/list/UsersTable'
import { UserActionDialog } from '../components/list/UserActionDialog'

export function UsersPage() {
  const navigate = useNavigate()
  const [globalFilter, setGlobalFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [confirm, setConfirm] = useState<UserAction | null>(null)

  const { data: users, isLoading } = useUserList()
  const runAction = useUserAction()
  const base = usePanelBase()
  const canEdit = useCanEdit()

  const handleConfirm = () => {
    if (confirm) runAction.mutate(confirm)
    setConfirm(null)
  }

  const columns = useUserColumns({
    onEdit: (user) => navigate(`/admin/users/${user.id}/edit`),
    onConfirmAction: setConfirm,
    readOnly: !canEdit,
  })

  const data = useMemo(() => filterByRole(users ?? [], roleFilter), [users, roleFilter])

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table devuelve funciones que el React Compiler no puede memorizar
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, pagination, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
  })

  return (
    <div className="space-y-5">
      <OnboardingCard
        storageKey="users"
        title="Usuarios"
        description="Administra jugadores, instructores y admins."
        tips={[
          'Crea uno a la vez con el formulario, o carga un Excel ANM masivo (se revisa antes de confirmar).',
          'Haz clic en cualquier fila para ver el detalle de progreso de esa persona.',
        ]}
        ctaLabel="Crear tu primer usuario"
        onCta={() => navigate('/admin/users/new')}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users?.length ?? 0} usuarios registrados
          </p>
        </div>
        {canEdit && <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/admin/users/bulk-import">
              <Upload className="h-4 w-4 mr-1.5" />
              Carga masiva
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/users/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Nuevo usuario
            </Link>
          </Button>
        </div>}
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Input
          placeholder="Buscar nombre, cédula, correo..."
          value={globalFilter}
          onChange={e => { setGlobalFilter(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })) }}
          className="h-9 w-full sm:max-w-xs"
        />
        <Select value={roleFilter} onValueChange={v => { setRoleFilter(v as RoleFilter); setPagination(p => ({ ...p, pageIndex: 0 })) }}>
          <SelectTrigger className="h-9 w-full sm:w-44 bg-background">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent className="z-200 bg-popover border border-border shadow-lg">
            <SelectItem value="all">Todos los roles</SelectItem>
            {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
        </div>
      ) : (
        <UsersTable table={table} onOpen={(user) => navigate(`${base}/users/${user.id}`)} />
      )}

      <UsersPagination table={table} />

      <UserActionDialog action={confirm} onConfirm={handleConfirm} onCancel={() => setConfirm(null)} />
    </div>
  )
}
