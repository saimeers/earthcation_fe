import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { ArrowLeft, RefreshCw, Users, Copy, Check, MapPin, UserRound, CalendarClock } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { tintBg } from '@/shared/lib/color'
import { fullName } from '@/shared/lib/format'
import type { SessionSummaryDto } from '@/shared/api/types'
import { usePanelBase } from '@/features/auth'
import { sessionDuration, type Session } from '../../../domain/sessions'
import { SESSION_STATUS } from '../../meta'
import { RoomQrButton } from '../RoomQr'

function CopyCode({ code }: { code: string | null | undefined }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(String(code ?? ''))
        setCopied(true)
        toast.success('Código copiado')
        setTimeout(() => setCopied(false), 1500)
      }}
      className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-5 py-3 hover:bg-primary/10 transition-colors"
      title="Copiar código de sala">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Código de sala</span>
      <span className="font-mono text-4xl font-bold tracking-[0.2em] text-primary leading-tight pl-[0.2em]">{code ?? '—'}</span>
      <span className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-foreground">
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? 'Copiado' : 'Copiar'}
      </span>
    </button>
  )
}

function StatusBadge({ session }: { session: Session | undefined }) {
  const status = (session && SESSION_STATUS[session.status]) || SESSION_STATUS.waiting
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: tintBg(status.color, 16) }}>
      <span className="relative flex h-2 w-2">
        {session?.status === 'active' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: status.color }} />}
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
      </span>
      {status.label}
    </span>
  )
}

function SessionFacts({ session, summary }: { session: Session | undefined, summary: SessionSummaryDto | undefined }) {
  const duration = sessionDuration(session, new Date())
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
      {session?.instructor && (
        <span className="flex items-center gap-1.5"><UserRound className="h-4 w-4" />{fullName(session.instructor)}</span>
      )}
      {session?.location && (
        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{session.location.municipality}, {session.location.department}</span>
      )}
      {session?.started_at && (
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-4 w-4" />
          {format(new Date(session.started_at), 'd MMM yyyy, HH:mm', { locale: es })}
          {duration != null && <span className="text-foreground font-medium">· {duration} min</span>}
        </span>
      )}
      <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{summary?.participants ?? 0} participantes</span>
    </div>
  )
}

interface SessionHeroProps {
  session: Session | undefined
  summary: SessionSummaryDto | undefined
  isFetching: boolean
  dataUpdatedAt: number
  onRefresh: () => void
  actions: ReactNode
}

export function SessionHero({ session, summary, isFetching, dataUpdatedAt, onRefresh, actions }: SessionHeroProps) {
  const base = usePanelBase()
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,var(--accent),transparent_60%)] opacity-70" />
      <div className="relative p-5 sm:p-6 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 mt-0.5" asChild>
            <Link to={`${base}/sessions`} aria-label="Volver a sesiones"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0 space-y-2">
            <StatusBadge session={session} />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{session?.name}</h1>
            <SessionFacts session={session} summary={summary} />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {actions}
              <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={onRefresh} disabled={isFetching}>
                <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isFetching && 'animate-spin')} />
                {dataUpdatedAt ? `Actualizado hace ${formatDistanceToNowStrict(dataUpdatedAt, { locale: es })}` : 'Actualizar'}
              </Button>
            </div>
          </div>
        </div>
        {!session?.is_free_play && (
          <div className="flex flex-col items-stretch gap-2">
            <CopyCode code={session?.code} />
            <RoomQrButton code={session?.code} name={session?.name} />
          </div>
        )}
      </div>
    </div>
  )
}
