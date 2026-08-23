import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Upload } from 'lucide-react'

import { useUsers } from '@/hooks/admin/useUsers'
import { ROLES, roleLabel } from './constants'
import { useUserColumns } from './userColumns'

export function UsersPage() {
  const navigate = useNavigate()
  const [globalFilter, setGlobalFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [confirm, setConfirm] = useState(null)

  const { users, isLoading, changeRole, disableUser, enableUser } = useUsers()

  const handleConfirm = () => {
    if (!confirm) return
    if (confirm.type === 'role') changeRole({ id: confirm.user.id, role: confirm.newRole })
    if (confirm.type === 'disable') disableUser(confirm.user.id)
    if (confirm.type === 'enable') enableUser(confirm.user.id)
    setConfirm(null)
  }

  const columns = useUserColumns({
    onEdit: (user) => navigate(`/admin/users/${user.id}/edit`),
    onConfirmAction: setConfirm
  })

  const filteredData = useMemo(() => {
    const data = users ?? []
    return roleFilter === 'all' ? data : data.filter(u => u.role === roleFilter)
  }, [users, roleFilter])

  const table = useReactTable({
    data: filteredData,
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
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users?.length ?? 0} usuarios registrados
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <Separator />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Input
          placeholder="Buscar nombre, cédula, correo..."
          value={globalFilter}
          onChange={e => { setGlobalFilter(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })) }}
          className="h-9 w-full sm:max-w-xs"
        />
        <Select
          value={roleFilter}
          onValueChange={v => { setRoleFilter(v); setPagination(p => ({ ...p, pageIndex: 0 })) }}>
          <SelectTrigger className="h-9 w-full sm:w-44 bg-background">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent className="z-200 bg-popover border border-border shadow-lg">
            <SelectItem value="all">Todos los roles</SelectItem>
            {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {table.getHeaderGroups().map(hg =>
                  hg.headers.map(h => (
                    <TableHead key={h.id} className="whitespace-nowrap">
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-12 text-sm text-muted-foreground">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className={`hover:bg-muted/30 ${row.original.is_active === false ? 'opacity-50' : ''}`}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} resultado{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Por página</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={v => setPagination(p => ({ ...p, pageSize: Number(v), pageIndex: 0 }))}>
              <SelectTrigger className="h-7 w-16 text-xs bg-background border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-200 bg-popover border border-border shadow-lg">
                {[10, 20, 50].map(s => (
                  <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>
          <div className="flex items-center gap-1">
            {[
              { fn: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage(), Icon: ChevronsLeft },
              { fn: () => table.previousPage(), disabled: !table.getCanPreviousPage(), Icon: ChevronLeft },
              { fn: () => table.nextPage(), disabled: !table.getCanNextPage(), Icon: ChevronRight },
              { fn: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage(), Icon: ChevronsRight },
            ].map(({ fn, disabled, Icon }, i) => (
              <Button key={i} variant="outline" size="icon" className="h-7 w-7 bg-background" onClick={fn} disabled={disabled}>
                <Icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={!!confirm} onOpenChange={v => !v && setConfirm(null)}>
        <AlertDialogContent className="bg-background border border-border shadow-2xl z-300 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.type === 'disable' && 'Deshabilitar usuario'}
              {confirm?.type === 'enable' && 'Habilitar usuario'}
              {confirm?.type === 'role' && `Cambiar rol a ${roleLabel[confirm?.newRole]}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {confirm?.type === 'disable' && `Vas a deshabilitar a ${confirm.user?.first_name} ${confirm.user?.last_name}. No podrá acceder al sistema.`}
              {confirm?.type === 'enable' && `Vas a habilitar a ${confirm.user?.first_name} ${confirm.user?.last_name}. Recuperará acceso al sistema.`}
              {confirm?.type === 'role' && `Cambiarás el rol de ${confirm?.user?.first_name} ${confirm?.user?.last_name} de "${roleLabel[confirm?.user?.role]}" a "${roleLabel[confirm?.newRole]}".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={confirm?.type === 'disable' ? 'bg-amber-600 hover:bg-amber-700' : ''}>
              {confirm?.type === 'disable' && 'Deshabilitar'}
              {confirm?.type === 'enable' && 'Habilitar'}
              {confirm?.type === 'role' && 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}