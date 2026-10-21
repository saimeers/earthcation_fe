import { useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertTriangle, CheckCircle2, CloudUpload, ExternalLink, FileArchive, Loader2, Play, RotateCcw,
  Rocket, Trash2, XCircle, Clock,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Progress } from '@/shared/ui/progress'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Panel } from '@/shared/ui/data/Panel'
import { apiErrorMessage } from '@/shared/api/client'
import { formatBytes } from '@/shared/lib/format'
import { useDeployActions, useDeployStatus, useVersions } from '../../application/useDeploy'
import { checkBuild, compressionLabel, COMPRESSION_LABEL, type BuildCheck, type GameVersion } from '../../domain/deploy'

const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—')
const errorOf = (err: unknown) => apiErrorMessage(err, 'Error desconocido')

const STATUS: Record<GameVersion['status'], { label: string, icon: typeof Clock, color: string, spin?: boolean }> = {
  uploading: { label: 'Esperando ZIP', icon: Clock, color: 'var(--status-neutral)' },
  processing: { label: 'Publicando…', icon: Loader2, color: 'var(--status-warning)', spin: true },
  ready: { label: 'Lista', icon: CheckCircle2, color: 'var(--status-good)' },
  failed: { label: 'Falló', icon: XCircle, color: 'var(--status-critical)' },
}

function StatusBadge({ status }: { status: GameVersion['status'] }) {
  const s = STATUS[status] ?? STATUS.uploading
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: s.color }}>
      <s.icon className={`h-3.5 w-3.5 ${s.spin ? 'animate-spin' : ''}`} /> {s.label}
    </span>
  )
}

function Warnings({ items, tone = 'var(--status-warning)' }: { items: readonly string[] | undefined, tone?: string }) {
  if (!items?.length) return null
  return (
    <ul className="space-y-1">
      {items.map(w => (
        <li key={w} className="flex gap-1.5 text-xs" style={{ color: tone }}>
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" /> <span>{w}</span>
        </li>
      ))}
    </ul>
  )
}

// ── Subir una versión ──────────────────────────────────────────────────────

function UploadPanel({ maxMb }: { maxMb: number | null | undefined }) {
  const { upload } = useDeployActions()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [check, setCheck] = useState<BuildCheck | null>(null)
  const [checking, setChecking] = useState(false)
  const [label, setLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)

  const pick = async (f: File | null | undefined) => {
    if (!f) return
    setFile(f); setCheck(null); setChecking(true); setProgress(0)
    if (maxMb && f.size > maxMb * 1048576) {
      setCheck({ errors: [`El ZIP pesa ${formatBytes(f.size)} y el máximo es ${maxMb} MB`], warnings: [], files: 0 })
    } else {
      const result = await checkBuild(f)
      setCheck(result)
      if (result.productVersion && !label) setLabel(result.productVersion)
    }
    setChecking(false)
  }

  const reset = () => {
    setFile(null); setCheck(null); setLabel(''); setNotes(''); setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const submit = () => {
    if (!file) return
    upload.mutate({ file, label: label.trim(), notes: notes.trim(), onProgress: setProgress }, {
      onSuccess: () => { toast.success(`Versión ${label.trim()} subida`, { description: 'Se está publicando; quedará lista en unos segundos.' }); reset() },
      onError: (err) => toast.error('No se pudo subir la versión', { description: errorOf(err) }),
    })
  }

  const canSubmit = !!(file && check && !check.errors.length && label.trim() && !upload.isPending)

  return (
    <Panel title="Subir una versión" description="ZIP de la carpeta del build WebGL (Unity → Build). Se valida aquí antes de subirlo." icon={CloudUpload}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !upload.isPending && inputRef.current?.click()}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); if (!upload.isPending) void pick(e.dataTransfer.files?.[0]) }}
        className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
      >
        <input ref={inputRef} type="file" accept=".zip,application/zip" className="hidden" onChange={e => void pick(e.target.files?.[0])} />
        <FileArchive className="h-8 w-8 mx-auto text-muted-foreground" />
        {file
          ? <p className="mt-2 text-sm font-medium break-all">{file.name} <span className="text-muted-foreground font-normal">· {formatBytes(file.size)}</span></p>
          : <p className="mt-2 text-sm text-muted-foreground">Arrastra el ZIP aquí o haz clic para elegirlo{maxMb ? ` (máx. ${maxMb} MB)` : ''}</p>}
      </div>

      {checking && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Revisando el build…</p>}
      {check && (
        <div className="space-y-2">
          {!check.errors.length && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--status-good)' }}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Build WebGL válido · {check.files} archivos · {check.compression ? COMPRESSION_LABEL[check.compression] : '—'}
              {check.productVersion ? ` · versión del proyecto ${check.productVersion}` : ''}
            </p>
          )}
          <Warnings items={check.errors} tone="var(--status-critical)" />
          <Warnings items={check.warnings} />
        </div>
      )}

      {file && check && !check.errors.length && (
        <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
          <label className="space-y-1">
            <span className="text-xs font-medium">Versión</span>
            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="1.4.0" maxLength={40} disabled={upload.isPending} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium">Notas (qué cambió)</span>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={2000} disabled={upload.isPending}
              placeholder="Corrige el sonido del vagón, nueva infografía del casco…"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
            />
          </label>
        </div>
      )}

      {upload.isPending && (
        <div className="space-y-1">
          <Progress value={progress * 100} className="h-2" />
          <p className="text-xs text-muted-foreground tabular-nums">
            {progress < 1 ? `Subiendo… ${Math.round(progress * 100)} %` : 'Iniciando la publicación…'}
          </p>
        </div>
      )}

      {file && (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={reset} disabled={upload.isPending}>Cancelar</Button>
          <Button size="sm" onClick={submit} disabled={!canSubmit}>
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
            Subir y publicar
          </Button>
        </div>
      )}
    </Panel>
  )
}

// ── Lista de versiones ─────────────────────────────────────────────────────

type Confirm = { type: 'activate' | 'remove', v: GameVersion }

function VersionRow({ v, onConfirm }: { v: GameVersion, onConfirm: (c: Confirm) => void }) {
  const { retry, preview } = useDeployActions()
  const m = v.manifest
  const uploader = v.uploader ? `${v.uploader.first_name ?? ''} ${v.uploader.last_name ?? ''}`.trim() : null

  const openPreview = () => {
    // La pestaña se abre antes de la petición: si se abre después, el navegador la bloquea
    const tab = window.open('', '_blank')
    preview.mutate(v.id, {
      onSuccess: (url) => { if (tab) tab.location.href = url; else window.open(url, '_blank') },
      onError: (err) => { tab?.close(); toast.error('No se pudo abrir la vista previa', { description: errorOf(err) }) },
    })
  }

  return (
    <li className="py-4 first:pt-0 last:pb-0 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold tabular-nums">{v.label}</span>
          {v.is_active
            ? <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ background: 'var(--status-good)' }}><Rocket className="h-3 w-3" /> En línea</span>
            : <StatusBadge status={v.status} />}
        </div>
        <p className="text-xs text-muted-foreground">
          {fmtDate(v.created_at)}{uploader ? ` · ${uploader}` : ''} · ZIP {formatBytes(Number(v.size_bytes))}
          {m && ` · ${m.files?.length ?? 0} archivos, ${formatBytes(m.total_bytes)} · ${compressionLabel(m.compression)}`}
          {v.activated_at && !v.is_active && ` · estuvo en línea el ${fmtDate(v.activated_at)}`}
        </p>
        {v.notes && <p className="text-sm whitespace-pre-line">{v.notes}</p>}
        {v.error && <Warnings items={[v.error]} tone="var(--status-critical)" />}
        <Warnings items={m?.warnings} />
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        {v.status === 'ready' && (
          <Button variant="outline" size="sm" onClick={openPreview} disabled={preview.isPending}>
            <ExternalLink className="h-4 w-4" /> Probar
          </Button>
        )}
        {v.status === 'ready' && !v.is_active && (
          <Button size="sm" onClick={() => onConfirm({ type: 'activate', v })}>
            <Play className="h-4 w-4" /> Poner en línea
          </Button>
        )}
        {v.status === 'failed' && (
          <Button variant="outline" size="sm" disabled={retry.isPending}
            onClick={() => retry.mutate(v.id, { onError: (err) => toast.error('No se pudo reintentar', { description: errorOf(err) }) })}>
            <RotateCcw className="h-4 w-4" /> Reintentar
          </Button>
        )}
        {!v.is_active && v.status !== 'processing' && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onConfirm({ type: 'remove', v })}>
            <Trash2 className="h-4 w-4" /> Borrar
          </Button>
        )}
      </div>
    </li>
  )
}

export function VersionsPage() {
  const { data: status } = useDeployStatus()
  const { data: versions, isLoading } = useVersions()
  const { activate, remove } = useDeployActions()
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const active = versions?.find(v => v.is_active)

  const handleConfirm = () => {
    if (!confirm) return
    const { type, v } = confirm
    if (type === 'activate') {
      activate.mutate(v.id, {
        onSuccess: () => toast.success(`Versión ${v.label} en línea`, { description: 'Los jugadores la reciben al recargar el juego (hasta 30 s).' }),
        onError: (err) => toast.error('No se pudo poner en línea', { description: errorOf(err) }),
      })
    } else {
      remove.mutate(v.id, {
        onSuccess: () => toast.success(`Versión ${v.label} borrada`),
        onError: (err) => toast.error('No se pudo borrar', { description: errorOf(err) }),
      })
    }
    setConfirm(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Versiones del juego</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sube el build WebGL, pruébalo y ponlo en línea. Para volver atrás, pon en línea una versión anterior.
          </p>
        </div>
        {status?.play_url && (
          <a href={status.play_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            {status.play_url.replace(/^https?:\/\//, '')} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {status && (status.storage.originals === 'local' || status.storage.published === 'local') && (
        <div className="rounded-lg border px-4 py-3 text-xs flex gap-2" style={{ borderColor: 'var(--status-warning)' }}>
          <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'var(--status-warning)' }} />
          <span>
            Modo desarrollo: la API guarda los builds en disco ({status.storage.originals === 'local' ? 'sin S3' : 'S3'} · {status.storage.published === 'local' ? 'sin R2' : 'R2'}).
            Configura AWS_S3_BUCKET y R2_BUCKET para publicar en play.earthcation.saimers.dev.
          </span>
        </div>
      )}

      <UploadPanel maxMb={status?.max_mb} />

      <Panel
        title="Versiones"
        description={active ? `En línea: ${active.label} desde el ${fmtDate(active.activated_at)}` : 'Ninguna versión en línea todavía.'}
        icon={Rocket}
      >
        {isLoading
          ? <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          : versions?.length
            ? <ul className="divide-y">{versions.map(v => <VersionRow key={v.id} v={v} onConfirm={setConfirm} />)}</ul>
            : <p className="text-sm text-muted-foreground py-6 text-center">Aún no hay versiones. Sube la primera arriba.</p>}
      </Panel>

      <AlertDialog open={!!confirm} onOpenChange={o => !o && setConfirm(null)}>
        <AlertDialogContent className="bg-background border border-border shadow-2xl z-300 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.type === 'activate' ? `Poner en línea la ${confirm.v.label}` : `Borrar la versión ${confirm?.v.label}`}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {confirm?.type === 'activate'
                ? `Reemplaza a ${active ? `la ${active.label}` : 'la actual'} para todos los jugadores. Quien ya tenga el juego abierto sigue con su versión hasta recargar. ¿La probaste antes?`
                : 'Se borran el ZIP original y los archivos publicados. No se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className={confirm?.type === 'remove' ? 'bg-destructive hover:bg-destructive/90 text-white' : ''}>
              {confirm?.type === 'activate' ? 'Poner en línea' : 'Borrar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
