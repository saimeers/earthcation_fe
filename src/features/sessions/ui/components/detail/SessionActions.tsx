import { Play, Square, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { useCanEdit, usePanelBase } from '@/features/auth'
import { canEnd, canStart, type Session } from '../../../domain/sessions'
import { useEndSession, useExportSessionXlsx, useStartSession } from '../../../application/useSessions'

/** Iniciar / finalizar la sala y exportar (Excel del servidor o informe imprimible). El Excel lleva nombres y cédulas: soporte no lo descarga. */
export function SessionActions({ id, session }: { id: string, session: Session | undefined }) {
  const base = usePanelBase()
  const canEdit = useCanEdit()
  const startSession = useStartSession()
  const endSession = useEndSession()
  const exportXlsx = useExportSessionXlsx()

  return (
    <>
      {canEdit && canStart(session) && (
        <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => startSession.mutate(id)} disabled={startSession.isPending}>
          <Play className="h-3.5 w-3.5 mr-1.5" /> Iniciar sesión
        </Button>
      )}
      {canEdit && canEnd(session) && (
        <Button size="sm" variant="destructive" className="h-8" onClick={() => endSession.mutate(id)} disabled={endSession.isPending}>
          <Square className="h-3.5 w-3.5 mr-1.5" /> Finalizar sesión
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-8" disabled={exportXlsx.isPending}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> {exportXlsx.isPending ? 'Exportando…' : 'Exportar resultados'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-popover border shadow-lg z-[200]">
          {canEdit && <DropdownMenuItem className="gap-2.5 py-2 cursor-pointer" onClick={() => exportXlsx.mutate({ id, code: session?.code ?? 'juego-libre' })}>
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span><span className="block text-sm font-medium">Excel (.xlsx)</span><span className="block text-[11px] text-muted-foreground">Participantes, riesgos e intentos en hojas</span></span>
          </DropdownMenuItem>}
          <DropdownMenuItem className="gap-2.5 py-2 cursor-pointer" onClick={() => window.open(`${base}/sessions/${id}/report`, '_blank', 'noopener')}>
            <FileText className="h-4 w-4 text-red-600" />
            <span><span className="block text-sm font-medium">Informe PDF</span><span className="block text-[11px] text-muted-foreground">Informe visual listo para imprimir</span></span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
