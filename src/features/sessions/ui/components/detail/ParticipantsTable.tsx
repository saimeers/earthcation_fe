import { ChevronRight } from 'lucide-react'
import { Avatar, SplitBar } from '@/shared/ui/data/Gauges'
import { formatDuration, formatSeconds, fullName, initials } from '@/shared/lib/format'
import type { Participant } from '../../../domain/sessions'
import { bandMeta, categoryIcon } from '../../meta'
import { BandPill } from '../BandPill'
import { JourneyDots } from '../LevelJourney'

interface ParticipantsProps {
  participants: Participant[]
  avgPct: number | null
  onOpen: (userId: string) => void
}

function MitigationCell({ p, avgPct }: { p: Participant, avgPct: number | null }) {
  if (!(p.total_attempts > 0)) return <span className="text-xs text-muted-foreground">Sin resultados</span>
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-base font-bold tabular-nums">{p.percentage}%</span>
        <span className="text-[11px] text-muted-foreground tabular-nums">{p.mitigated}/{p.total_attempts}</span>
      </div>
      <SplitBar good={p.mitigated} bad={p.total_attempts - p.mitigated} height={6} marker={avgPct} />
    </div>
  )
}

function WeakestRisk({ p }: { p: Participant }) {
  if (!p.weakest_risk) return <span className="text-xs text-muted-foreground">—</span>
  const WeakIcon = categoryIcon(p.weakest_risk.category)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs min-w-0" title={p.weakest_risk.risk_name}>
      <WeakIcon className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--status-critical)' }} />
      <span className="truncate">{p.weakest_risk.risk_name}</span>
    </span>
  )
}

function DesktopTable({ participants, avgPct, onOpen }: ParticipantsProps) {
  return (
    <div className="hidden lg:block rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            <th className="px-4 py-2.5 text-left font-medium">Participante</th>
            <th className="px-3 py-2.5 text-left font-medium">Desempeño</th>
            <th className="px-3 py-2.5 text-left font-medium w-56">Riesgos mitigados</th>
            <th className="px-3 py-2.5 text-left font-medium">Intentos por nivel</th>
            <th className="px-3 py-2.5 text-right font-medium">Reacción</th>
            <th className="px-3 py-2.5 text-left font-medium">Punto débil</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {participants.map(p => (
            <tr key={p.user.id} onClick={() => onOpen(p.user.id)} className="group cursor-pointer hover:bg-muted/40 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar text={initials(p.user)} color={bandMeta(p.band).color} size={36} />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{fullName(p.user)}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      CC {p.user.cedula}{p.organization ? ` · ${p.organization}` : ''}{p.dominant_style ? ` · ${p.dominant_style}` : ''}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3"><BandPill band={p.band} /></td>
              <td className="px-3 py-3"><MitigationCell p={p} avgPct={avgPct} /></td>
              <td className="px-3 py-3"><JourneyDots journeys={p.telemetry.journeys} /></td>
              <td className="px-3 py-3 text-right">
                <p className="font-semibold tabular-nums">{formatSeconds(p.avg_reaction_ms)}</p>
                {p.telemetry.best_time_ms != null && <p className="text-[11px] text-muted-foreground tabular-nums">mejor nivel {formatDuration(p.telemetry.best_time_ms)}</p>}
              </td>
              <td className="px-3 py-3 max-w-52"><WeakestRisk p={p} /></td>
              <td className="pr-3"><ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MobileCards({ participants, avgPct, onOpen }: ParticipantsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
      {participants.map(p => (
        <button key={p.user.id} type="button" onClick={() => onOpen(p.user.id)} className="text-left rounded-xl border bg-card p-4 space-y-3 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3">
            <Avatar text={initials(p.user)} color={bandMeta(p.band).color} size={40} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{fullName(p.user)}</p>
              <p className="text-xs text-muted-foreground">CC {p.user.cedula}</p>
            </div>
            <BandPill band={p.band} />
          </div>
          {p.total_attempts > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Riesgos mitigados</span><span className="font-semibold tabular-nums">{p.percentage}% · {p.mitigated}/{p.total_attempts}</span></div>
              <SplitBar good={p.mitigated} bad={p.total_attempts - p.mitigated} height={6} marker={avgPct} />
            </div>
          )}
          <div className="flex items-end justify-between gap-2">
            <JourneyDots journeys={p.telemetry.journeys} />
            <span className="text-xs text-muted-foreground">{formatSeconds(p.avg_reaction_ms)} reacción</span>
          </div>
        </button>
      ))}
    </div>
  )
}

/** Tabla en escritorio, tarjetas en móvil/tableta. */
export function ParticipantsTable(props: ParticipantsProps) {
  if (!props.participants.length) {
    return <p className="text-sm text-muted-foreground py-10 text-center rounded-xl border border-dashed">Ningún participante coincide con el filtro.</p>
  }
  return (
    <>
      <DesktopTable {...props} />
      <MobileCards {...props} />
    </>
  )
}
