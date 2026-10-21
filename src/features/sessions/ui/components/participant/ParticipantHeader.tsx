import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Building2, MapPin, IdCard, Brain, ExternalLink, type LucideIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Avatar, RadialGauge } from '@/shared/ui/data/Gauges'
import { tintBg } from '@/shared/lib/color'
import { formatPct, fullName, initials } from '@/shared/lib/format'
import type { ParticipantAnalysisDto } from '@/shared/api/types'
import { usePanelBase } from '@/features/auth'
import { bandMeta } from '../../meta'
import { BandPill } from '../BandPill'

export function SectionTitle({ icon: Icon, children, hint }: { icon: LucideIcon, children: ReactNode, hint?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-base font-semibold flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{children}</h2>
      {hint && <p className="text-xs text-muted-foreground hidden sm:block">{hint}</p>}
    </div>
  )
}

function NavArrow({ to, label, children }: { to: string | null, label: string, children: ReactNode }) {
  return (
    <Button variant="outline" size="icon" className="h-8 w-8" disabled={!to} asChild={!!to}>
      {to ? <Link to={to} aria-label={label}>{children}</Link> : <span>{children}</span>}
    </Button>
  )
}

/** Volver a la sesión y pasar al participante anterior/siguiente. */
export function ParticipantNav({ data, sessionId }: { data: ParticipantAnalysisDto, sessionId: string }) {
  const base = usePanelBase()
  const { session, navigation } = data
  const link = (userId: string | null) => (userId ? `${base}/sessions/${sessionId}/participants/${userId}` : null)
  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" size="sm" className="h-8 -ml-2 text-muted-foreground min-w-0 shrink" asChild>
        <Link to={`${base}/sessions/${sessionId}`}><ArrowLeft className="h-4 w-4 mr-1 shrink-0" /> <span className="truncate">{session.name}</span></Link>
      </Button>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-muted-foreground tabular-nums mr-1 whitespace-nowrap">{navigation.index + 1} de {navigation.total}</span>
        <NavArrow to={link(navigation.prev)} label="Participante anterior"><ChevronLeft className="h-4 w-4" /></NavArrow>
        <NavArrow to={link(navigation.next)} label="Participante siguiente"><ChevronRight className="h-4 w-4" /></NavArrow>
      </div>
    </div>
  )
}

/** Identidad del participante, su banda y el medidor contra el promedio del grupo. */
export function ParticipantHero({ data }: { data: ParticipantAnalysisDto }) {
  const base = usePanelBase()
  const { user, participant: p, group } = data
  const band = bandMeta(p.band)
  const hasData = p.total_attempts > 0
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top left, ${tintBg(band.color, 18)}, transparent 55%)` }} />
      <div className="relative p-5 sm:p-7 flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="flex items-start gap-4 sm:gap-5 min-w-0">
          <Avatar text={initials(user)} color={band.color} size={72} />
          <div className="min-w-0 space-y-2">
            <BandPill band={p.band} size="lg" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{fullName(user)}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><IdCard className="h-4 w-4" />CC {user.cedula}</span>
              {user.profile?.organization && <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />{user.profile.organization.name}</span>}
              {user.profile?.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{user.profile.location.municipality}</span>}
              {user.varkProfile?.dominant_style && <span className="flex items-center gap-1.5"><Brain className="h-4 w-4" />Aprende mejor: {user.varkProfile.dominant_style}</span>}
            </div>
            {base !== '/instructor' && (
              <Link to={`${base}/users/${user.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Ver perfil completo <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-5 self-center md:self-auto">
          <RadialGauge value={hasData ? p.percentage : null} groupValue={group.avg_percentage} color={band.color} size={140} label="riesgos mitigados" />
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Posición en la sesión</p>
              <p className="text-xl font-bold">{hasData ? `#${group.rank}` : '—'}<span className="text-sm font-normal text-muted-foreground"> de {group.participants}</span></p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-3.5 w-[3px] rounded-full bg-foreground" /> Promedio del grupo: <span className="font-semibold text-foreground">{formatPct(group.avg_percentage)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
