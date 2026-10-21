import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import type { User } from '../../../domain/users'

export function UsersTable({ table, onOpen }: { table: TanstackTable<User>, onOpen: (user: User) => void }) {
  const rows = table.getRowModel().rows
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {table.getHeaderGroups().map(hg =>
              hg.headers.map(h => (
                <TableHead key={h.id} className="whitespace-nowrap">
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              )),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="text-center py-12 text-sm text-muted-foreground">
                No se encontraron usuarios.
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => (
              <TableRow
                key={row.id}
                onClick={() => onOpen(row.original)}
                className={`cursor-pointer hover:bg-muted/30 ${row.original.is_active === false ? 'opacity-50' : ''}`}>
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    onClick={cell.column.id === 'actions' ? (e) => e.stopPropagation() : undefined}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function UsersPagination({ table }: { table: TanstackTable<User> }) {
  const { pageIndex, pageSize } = table.getState().pagination
  const results = table.getFilteredRowModel().rows.length
  const pages = [
    { fn: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage(), Icon: ChevronsLeft },
    { fn: () => table.previousPage(), disabled: !table.getCanPreviousPage(), Icon: ChevronLeft },
    { fn: () => table.nextPage(), disabled: !table.getCanNextPage(), Icon: ChevronRight },
    { fn: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage(), Icon: ChevronsRight },
  ]
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        {results} resultado{results !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Por página</span>
          <Select value={String(pageSize)} onValueChange={v => table.setPagination({ pageSize: Number(v), pageIndex: 0 })}>
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
          {pageIndex + 1} / {Math.max(1, table.getPageCount())}
        </span>
        <div className="flex items-center gap-1">
          {pages.map(({ fn, disabled, Icon }, i) => (
            <Button key={i} variant="outline" size="icon" className="h-7 w-7 bg-background" onClick={fn} disabled={disabled}>
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
