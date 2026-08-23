import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, Upload, FileSpreadsheet, X,
  CheckCircle2, AlertTriangle, Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useBulkImportUsers } from '@/hooks/admin/useBulkImportUsers'

const STATUS_LABEL = {
  ok:                { text: 'Listo',               className: 'text-emerald-600' },
  duplicate_in_file: { text: 'Repetido en archivo',  className: 'text-amber-600' },
  duplicate_in_db:   { text: 'Ya existe',             className: 'text-amber-600' },
  missing_required:  { text: 'Falta información',     className: 'text-destructive' },
}

export function BulkImportUsersPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [rows, setRows] = useState(null) // null = sin archivo cargado aún
  const [selected, setSelected] = useState(new Set())
  const [dragActive, setDragActive] = useState(false)

  const { parseFile, isParsing, confirmRows, isConfirming } = useBulkImportUsers()

  const reset = () => {
    setRows(null)
    setSelected(new Set())
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const loadFile = async (file) => {
    if (!file) return
    try {
      const parsed = await parseFile(file)
      setRows(parsed)
      setSelected(new Set(parsed.map((r, i) => i).filter(i => parsed[i].status === 'ok')))
    } catch {
      // el toast de error ya lo muestra el hook
    }
  }

  const handleFileChange = (e) => loadFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    loadFile(e.dataTransfer.files?.[0])
  }

  const toggleRow = (idx) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(prev =>
      prev.size === rows.length ? new Set() : new Set(rows.map((_, i) => i))
    )
  }

  const editField = (idx, field, value) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  const handleConfirm = async () => {
    const rowsToImport = rows.filter((_, i) => selected.has(i))
    if (rowsToImport.length === 0) return
    try {
      await confirmRows(rowsToImport)
      navigate('/admin/users')
    } catch {
      // el toast de error ya lo muestra el hook
    }
  }

  const counts = rows ? {
    ok:        rows.filter(r => r.status === 'ok').length,
    duplicate: rows.filter(r => r.status === 'duplicate_in_file' || r.status === 'duplicate_in_db').length,
    missing:   rows.filter(r => r.status === 'missing_required').length,
  } : null

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-10">
      {/* Header */}
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
        /* ─── Paso 1: subir archivo ─────────────────────────────────── */
        <div
          onDragOver={e => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`
            rounded-xl border-2 border-dashed p-8 sm:p-16 flex flex-col items-center justify-center gap-4
            text-center transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}
          `}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isParsing ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileSpreadsheet className="h-6 w-6" />}
          </div>

          <div className="space-y-1">
            <p className="font-medium">
              {isParsing ? 'Leyendo archivo...' : 'Arrastra el Excel aquí o selecciónalo'}
            </p>
            <p className="text-sm text-muted-foreground">Formato .xlsx / .xls — Base de Datos Anual ANM</p>
          </div>

          <Button
            type="button"
            disabled={isParsing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Seleccionar archivo
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isParsing}
            className="hidden"
          />
        </div>
      ) : (
        /* ─── Paso 2: revisar y confirmar ───────────────────────────── */
        <div className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xl font-bold leading-none">{counts.ok}</p>
                  <p className="text-xs text-muted-foreground mt-1">Listas para crear</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Copy className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xl font-bold leading-none">{counts.duplicate}</p>
                  <p className="text-xs text-muted-foreground mt-1">Repetidas / ya existen</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="text-xl font-bold leading-none">{counts.missing}</p>
                  <p className="text-xs text-muted-foreground mt-1">Con datos faltantes</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {selected.size} de {rows.length} filas seleccionadas para importar
            </p>
            <Button variant="outline" size="sm" onClick={reset} disabled={isConfirming} className="self-start sm:self-auto">
              <X className="h-3.5 w-3.5 mr-1.5" /> Cambiar archivo
            </Button>
          </div>

          {/* Vista de tarjetas — mobile */}
          <div className="md:hidden space-y-3">
            {rows.map((row, i) => {
              const statusInfo = STATUS_LABEL[row.status] ?? { text: row.status, className: '' }
              return (
                <Card key={i} className={selected.has(i) ? '' : 'opacity-50'}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          onChange={() => toggleRow(i)}
                          disabled={isConfirming}
                        />
                        <span className="font-mono text-xs text-muted-foreground">Fila {i + 1}</span>
                      </label>
                      <span className={`text-xs whitespace-nowrap ${statusInfo.className}`}>{statusInfo.text}</span>
                    </div>
                    {row.message && <p className="text-xs text-muted-foreground -mt-2">{row.message}</p>}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Cédula</label>
                        <Input value={row.cedula} onChange={e => editField(i, 'cedula', e.target.value)} className="h-8 font-mono text-xs" disabled={isConfirming} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Correo</label>
                        <Input value={row.email} onChange={e => editField(i, 'email', e.target.value)} className="h-8 text-xs" disabled={isConfirming} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Nombre</label>
                        <Input value={row.first_name} onChange={e => editField(i, 'first_name', e.target.value)} className="h-8 text-xs" disabled={isConfirming} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Apellido</label>
                        <Input value={row.last_name} onChange={e => editField(i, 'last_name', e.target.value)} className="h-8 text-xs" disabled={isConfirming} />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[11px] text-muted-foreground">Organización</label>
                        <Input value={row.organization_name} onChange={e => editField(i, 'organization_name', e.target.value)} className="h-8 text-xs" disabled={isConfirming} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Municipio</label>
                        <Input value={row.location_municipality} onChange={e => editField(i, 'location_municipality', e.target.value)} className="h-8 text-xs" disabled={isConfirming} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Departamento</label>
                        <Input value={row.location_department} onChange={e => editField(i, 'location_department', e.target.value)} className="h-8 text-xs" disabled={isConfirming} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Vista de tabla — desktop */}
          <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-8">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selected.size === rows.length}
                      onChange={toggleAll}
                      disabled={isConfirming}
                    />
                  </TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Organización</TableHead>
                  <TableHead className="hidden lg:table-cell">Municipio</TableHead>
                  <TableHead className="hidden lg:table-cell">Departamento</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => {
                  const statusInfo = STATUS_LABEL[row.status] ?? { text: row.status, className: '' }
                  return (
                    <TableRow key={i} className={selected.has(i) ? '' : 'opacity-50'}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          onChange={() => toggleRow(i)}
                          disabled={isConfirming}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.cedula}
                          onChange={e => editField(i, 'cedula', e.target.value)}
                          className="h-8 w-28 font-mono text-xs"
                          disabled={isConfirming}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.first_name}
                          onChange={e => editField(i, 'first_name', e.target.value)}
                          className="h-8 w-28 text-xs"
                          disabled={isConfirming}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.last_name}
                          onChange={e => editField(i, 'last_name', e.target.value)}
                          className="h-8 w-28 text-xs"
                          disabled={isConfirming}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.email}
                          onChange={e => editField(i, 'email', e.target.value)}
                          className="h-8 w-40 text-xs"
                          disabled={isConfirming}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.organization_name}
                          onChange={e => editField(i, 'organization_name', e.target.value)}
                          className="h-8 w-32 text-xs"
                          disabled={isConfirming}
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Input
                          value={row.location_municipality}
                          onChange={e => editField(i, 'location_municipality', e.target.value)}
                          className="h-8 w-28 text-xs"
                          disabled={isConfirming}
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Input
                          value={row.location_department}
                          onChange={e => editField(i, 'location_department', e.target.value)}
                          className="h-8 w-32 text-xs"
                          disabled={isConfirming}
                        />
                      </TableCell>
                      <TableCell className={`text-xs whitespace-nowrap ${statusInfo.className}`}>
                        {statusInfo.text}
                        {row.message && <div className="text-muted-foreground">{row.message}</div>}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="sticky bottom-4 flex justify-center sm:justify-end px-2 sm:px-0">
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border bg-background/95 backdrop-blur px-3 py-2 shadow-lg w-full sm:w-auto">
              <Button variant="outline" onClick={reset} disabled={isConfirming}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={isConfirming || selected.size === 0}>
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
