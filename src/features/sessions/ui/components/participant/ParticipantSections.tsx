import type { ReactNode } from 'react'
import {
  Sparkles, Scale, Route, ShieldHalf, Gamepad2, Puzzle, Pickaxe, Activity, Lightbulb, Gauge, Flame, Bug, BookOpen,
  CheckCircle2, XCircle, type LucideIcon,
} from 'lucide-react'
import { DeltaChip, SplitBar } from '@/shared/ui/data/Gauges'
import { tintBg } from '@/shared/lib/color'
import { formatNumber, formatPct, formatSeconds } from '@/shared/lib/format'
import type { ParticipantAnalysisDto } from '@/shared/api/types'
import type { Insight } from '../../../domain/insights'
import { challengeSummary } from '../../../domain/sessions'
import { levelLabel, presentCounters, type Attempt } from '../../../domain/telemetry'
import { categoryIcon } from '../../meta'
import { InsightCards } from '../InsightGrid'
import { LevelJourneyCard } from '../LevelJourney'
import { SectionTitle } from './ParticipantHeader'

const Empty = ({ children }: { children: string }) =>
  <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed">{children}</p>

const seconds = (v: number) => `${v.toLocaleString('es-CO', { maximumFractionDigits: 1 })} s`

export function InsightsSection({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null
  return (
    <section className="space-y-3">
      <SectionTitle icon={Sparkles} hint="Generado a partir de sus resultados en esta sesión">En pocas palabras</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><InsightCards insights={insights} /></div>
    </section>
  )
}

function CompareTile({ label, value, delta, hint }: { label: string, value: ReactNode, delta?: ReactNode, hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-1.5 min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
      {delta}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function CompareSection({ data }: { data: ParticipantAnalysisDto }) {
  const { participant: p, group, reading } = data
  const hasData = p.total_attempts > 0
  const mistakesPerResult = hasData ? p.mistakes_total / p.total_attempts : null
  return (
    <section className="space-y-3">
      <SectionTitle icon={Scale} hint="Verde = mejor que el promedio del grupo">Comparado con el grupo</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CompareTile label="Riesgos mitigados" value={hasData ? `${p.percentage}%` : '—'}
          delta={hasData && <DeltaChip value={p.percentage - (group.avg_percentage ?? p.percentage)} format={v => `${Math.round(v)} pts`} />} />
        <CompareTile label="Tiempo de reacción" value={formatSeconds(p.avg_reaction_ms)}
          delta={!!p.avg_reaction_ms && !!group.avg_reaction_ms && <DeltaChip value={(p.avg_reaction_ms - group.avg_reaction_ms) / 1000} format={seconds} higherIsBetter={false} />} />
        <CompareTile label="Errores por riesgo" value={mistakesPerResult != null ? formatNumber(mistakesPerResult, 1) : '—'}
          delta={mistakesPerResult != null && group.avg_mistakes_per_result != null && <DeltaChip value={mistakesPerResult - group.avg_mistakes_per_result} format={v => formatNumber(v, 1)} higherIsBetter={false} />} />
        <CompareTile label="Tiempo leyendo paneles" value={formatSeconds(reading.avg_read_ms)}
          delta={!!reading.avg_read_ms && !!reading.group_avg_read_ms && <DeltaChip value={(reading.avg_read_ms - reading.group_avg_read_ms) / 1000} format={seconds} />}
          hint={`${reading.panels} paneles informativos leídos`} />
      </div>
    </section>
  )
}

interface LevelsSectionProps {
  data: ParticipantAnalysisDto
  levelKeys: string[]
  byLevel: Record<string, Attempt[]>
  selectedAttempt: string | null
  onSelect: (id: string) => void
}

export function LevelsSection({ data, levelKeys, byLevel, selectedAttempt, onSelect }: LevelsSectionProps) {
  return (
    <section className="space-y-3">
      <SectionTitle icon={Route} hint="Haz clic en un intento para ver su repetición">Recorrido por nivel</SectionTitle>
      {levelKeys.length === 0 ? <Empty>No ha jugado ningún nivel en esta sesión.</Empty> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {levelKeys.map(k => (
            <LevelJourneyCard
              key={k} levelKey={k} attempts={byLevel[k]}
              level={data.participant.telemetry.levels.find(l => l.level_key === k)}
              group={data.group.levels?.[k]}
              selectedAttemptId={selectedAttempt}
              onSelectAttempt={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// Retos de transición (GC-05 memoria, GC-07 reacción): intentos propios, no cuentan en el % de los niveles
export function ChallengesSection({ keys, byLevel, selectedAttempt, onSelect }: Omit<LevelsSectionProps, 'data' | 'levelKeys'> & { keys: string[] }) {
  if (!keys.length) return null
  return (
    <section className="space-y-3">
      <SectionTitle icon={Puzzle} hint="Memoria y reacción · haz clic para ver sus rondas">Retos de transición</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-3">
        {keys.map(k => {
          const { passed, total, last, lastText } = challengeSummary(byLevel[k])
          const ok = last?.outcome === 'completed'
          return (
            <button key={k} type="button" onClick={() => onSelect(last.id)}
              className={`rounded-xl border bg-card p-4 text-left space-y-2 hover:bg-muted/50 transition-colors ${selectedAttempt === last?.id ? 'ring-2 ring-primary' : ''}`}>
              <p className="text-sm font-semibold">{levelLabel(k)}</p>
              <p className="text-2xl font-bold leading-none">{passed}<span className="text-sm font-normal text-muted-foreground"> / {total} superados</span></p>
              <p className={`flex items-center gap-1.5 text-xs ${ok ? 'text-[var(--status-good)]' : 'text-[var(--status-critical)]'}`}>
                {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                Último: {lastText}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function RiskMasterySection({ data }: { data: ParticipantAnalysisDto }) {
  const { participant: p, group } = data
  return (
    <section className="space-y-3">
      <SectionTitle icon={ShieldHalf} hint="Del más débil al más dominado · la línea marca al grupo">Dominio de cada riesgo</SectionTitle>
      {p.risks.length === 0 ? <Empty>Sin resultados por riesgo todavía.</Empty> : (
        <div className="rounded-xl border bg-card divide-y">
          {p.risks.map(r => {
            const Icon = categoryIcon(r.category)
            const g = group.risks?.[r.risk_id]
            const lastOk = r.last_result === 'mitigated'
            return (
              <div key={r.risk_id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0"><Icon className="h-5 w-5 text-muted-foreground" /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{r.risk_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.risk_id} · {r.category} · {r.level_name}</p>
                  </div>
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-baseline justify-between text-xs">
                    <span><span className="text-base font-bold tabular-nums">{formatPct(r.mitigation_rate)}</span> <span className="text-muted-foreground">({r.mitigated} de {r.results})</span></span>
                    {g?.mitigation_rate != null && <span className="text-muted-foreground tabular-nums">grupo {formatPct(g.mitigation_rate)}</span>}
                  </div>
                  <SplitBar good={r.mitigated} bad={r.failed} height={8} marker={g?.mitigation_rate} />
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end text-xs">
                  <span className="rounded-md bg-muted px-2 py-1 tabular-nums">{r.mistakes_total} {r.mistakes_total === 1 ? 'error' : 'errores'}</span>
                  <span className="rounded-md bg-muted px-2 py-1 tabular-nums" title={g?.avg_reaction_ms ? `Grupo: ${formatSeconds(g.avg_reaction_ms)}` : undefined}>{formatSeconds(r.avg_reaction_ms)}</span>
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-1" style={{ backgroundColor: tintBg(lastOk ? 'var(--status-good)' : 'var(--status-critical)', 16) }}>
                    {lastOk ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: 'var(--status-good)' }} /> : <XCircle className="h-3.5 w-3.5" style={{ color: 'var(--status-critical)' }} />}
                    Último: {lastOk ? 'mitigado' : 'fallido'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

const COUNTER_ICONS: Record<string, LucideIcon> = {
  coal_collected: Pickaxe, fatigue_injuries: Activity, lantern_warnings: Lightbulb, device_opened: Gauge,
  calibrations_valid: CheckCircle2, calibrations_invalid: XCircle, exits_uncalibrated: XCircle,
  damage_methane: Flame, damage_biohazard: Bug,
}
const COUNTER_TONE: Record<string, string> = {
  coal_collected: 'var(--chart-1)', fatigue_injuries: 'var(--status-critical)', lantern_warnings: 'var(--status-warning)',
  device_opened: 'var(--chart-1)', calibrations_valid: 'var(--status-good)', calibrations_invalid: 'var(--status-critical)',
  exits_uncalibrated: 'var(--status-critical)', damage_methane: 'var(--status-critical)', damage_biohazard: 'var(--status-critical)',
}

function CounterTile({ icon: Icon, color, value, suffix, label }: { icon: LucideIcon, color: string, value: ReactNode, suffix?: ReactNode, label: string }) {
  return (
    <div className="rounded-xl border bg-card p-3.5 flex flex-col gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: tintBg(color, 14) }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </span>
      <p className="text-xl font-bold tabular-nums leading-none">{value}{suffix}</p>
      <p className="text-[11px] text-muted-foreground leading-snug">{label}</p>
    </div>
  )
}

export function BehaviourSection({ data }: { data: ParticipantAnalysisDto }) {
  const { summary_counters: counters, reading } = data
  const entries = presentCounters(counters)
  if (!entries.length) return null
  return (
    <section className="space-y-3">
      <SectionTitle icon={Gamepad2} hint="Suma de todos sus intentos en esta sesión">Comportamiento en el juego</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {entries.map(([k, label]) => (
          <CounterTile
            key={k} label={label} icon={COUNTER_ICONS[k] ?? Activity} color={COUNTER_TONE[k] ?? 'var(--chart-1)'}
            value={formatNumber(counters?.[k])}
            suffix={k.startsWith('damage_') ? <span className="text-xs font-normal text-muted-foreground"> pts</span> : null}
          />
        ))}
        {reading.panels > 0 && <CounterTile icon={BookOpen} color="var(--chart-3)" value={reading.panels} label="Paneles informativos leídos" />}
      </div>
    </section>
  )
}
