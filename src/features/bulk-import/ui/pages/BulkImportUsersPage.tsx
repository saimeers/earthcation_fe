import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  countRows, editRow, initialSelection, selectedRows, toggleAll, toggleIndex, type ImportRow,
} from '../../domain/importRows'
import { useConfirmImport, useParseImport } from '../../application/useBulkImport'
import { ImportDropzone } from '../components/ImportDropzone'
import { ImportSummary } from '../components/ImportSummary'
import { ImportRowCards, ImportRowsTable, type ImportRowsProps } from '../components/ImportRows'

/** Excel ANM → vista previa editable (cada fila con su estado) → confirmar las filas elegidas. */
export function BulkImportUsersPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<ImportRow[] | null>(null) // null = sin archivo cargado aún
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [fileKey, setFileKey] = useState(0)
  const parse = useParseImport()
  const confirm = useConfirmImport()
  const isConfirming = confirm.isPending

  const reset = () => {
    setRows(null)
    setSelected(new Set())
    setFileKey(k => k + 1)
  }

  const loadFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const parsed = await parse.mutateAsync(file)
      setRows(parsed)
      setSelected(initialSelection(parsed))
    } catch {
      // el toast de error lo muestra useParseImport
    }
  }

  const handleConfirm = async () => {
    const toImport = selectedRows(rows ?? [], selected)
    if (toImport.length === 0) return
    try {
      await confirm.mutateAsync(toImport)
      navigate('/admin/users')
    } catch {
      // el toast de error lo muestra useConfirmImport
    }
  }

  const rowsProps: ImportRowsProps = {
    rows: rows ?? [],
    selected,
    disabled: isConfirming,
    onToggle: idx => setSelected(prev => toggleIndex(prev, idx)),
    onToggleAll: () => setSelected(prev => toggleAll(prev, rows?.length ?? 0)),
    onEdit: (idx, field, value) => setRows(prev => (prev ? editRow(prev, idx, field, value) : prev)),
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-10">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
          <Link to="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carga masiva de usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Sube el Excel de personal capacitado (formato ANM) y revisa los datos antes de confirmar.
          </p>
        </div>
      </div>

      {!rows ? (
        <ImportDropzone key={fileKey} isParsing={parse.isPending} onFile={f => void loadFile(f)} />
      ) : (
        <div className="space-y-4">
          <ImportSummary counts={countRows(rows)} />

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {selected.size} de {rows.length} filas seleccionadas para importar
            </p>
            <Button variant="outline" size="sm" onClick={reset} disabled={isConfirming} className="self-start sm:self-auto">
              <X className="h-3.5 w-3.5 mr-1.5" /> Cambiar archivo
            </Button>
          </div>

          <ImportRowCards {...rowsProps} />
          <ImportRowsTable {...rowsProps} />

          <div className="sticky bottom-4 flex justify-center sm:justify-end px-2 sm:px-0">
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border bg-background/95 backdrop-blur px-3 py-2 shadow-lg w-full sm:w-auto">
              <Button variant="outline" onClick={reset} disabled={isConfirming}>
                Cancelar
              </Button>
              <Button onClick={() => void handleConfirm()} disabled={isConfirming || selected.size === 0}>
                {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="h-4 w-4 mr-1.5" />
                {isConfirming ? 'Creando...' : `Crear ${selected.size} usuario${selected.size !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
