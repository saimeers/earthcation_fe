import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Scale, Route, ShieldHalf, Gamepad2, PlayCircle,
  Building2, MapPin, IdCard, Brain, ExternalLink, Pickaxe, Activity, Lightbulb, Gauge, Flame, Bug, BookOpen,
  CheckCircle2, XCircle, Puzzle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useParticipantAnalysis } from '@/hooks/admin/useSessions'
import { formatNumber, formatPct, formatSeconds, fullName, initials, isChallenge, levelLabel, SUMMARY_COUNTERS } from '@/lib/format'
import { BAND_META, categoryIcon, tintBg } from './bands'
import { participantInsights } from './insights'
import { Avatar, BandPill, DeltaChip, InsightCard, RadialGauge, SplitBar } from './components/Performance'
import { LevelJourneyCard } from './components/LevelJourney'
import { AttemptReplay } from './components/AttemptReplay'

const COUNTER_ICONS = {
  coal_collected: Pickaxe, fatigue_injuries: Activity, lantern_warnings: Lightbulb, device_opened: Gauge,
  calibrations_valid: CheckCircle2, calibrations_invalid: XCircle, exits_uncalibrated: XCircle,
  damage_methane: Flame, damage_biohazard: Bug,
}
const COUNTER_TONE = {
  coal_collected: 'var(--chart-1)', fatigue_injuries: 'var(--status-critical)', lantern_warnings: 'var(--status-warning)',
  device_opened: 'var(--chart-1)', calibrations_valid: 'var(--status-good)', calibrations_invalid: 'var(--status-critical)',
  exits_uncalibrated: 'var(--status-critical)', damage_methane: 'var(--status-critical)', damage_biohazard: 'var(--status-critical)',
}

function SectionTitle({ icon: Icon, children, hint }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-base font-semibold flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{children}</h2>
      {hint && <p className="text-xs text-muted-foreground hidden sm:block">{hint}</p>}
    </div>
  )
}

function CompareTile({ label, value, delta, hint }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-1.5 min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
      {delta}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function ParticipantAnalysisPage() {
  const { id: sessionId, userId } = useParams()
  const { data, isLoading, isFetching } = useParticipantAnalysis(sessionId, userId)
  const [attemptId, setAttemptId] = useState(null)
  const replayRef = useRef(null)

  const insights = useMemo(() => participantInsights(data), [data])
  const attemptsByLevel = useMemo(() => {
    const out = {}
    ;(data?.attempts ?? []).forEach(a => { (out[a.level_key] ||= []).push(a) })
    return out
  }, [data])

  if (isLoading || !data) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto w-full">
        <Skeleton className="h-52 rounded-2xl" />
        <div className="grid sm:grid-cols-2 gap-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const { session, user, participant: p, group, navigation, reading, summary_counters: counters } = data
  const band = BAND_META[p.band]
  const hasData = p.total_attempts > 0
  const levelKeys = Object.keys(attemptsByLevel).filter(k => !isChallenge(k)).sort()
  const challengeKeys = Object.keys(attemptsByLevel).filter(isChallenge).sort()
  const selectedAttempt = attemptId && data.attempts.some(a => a.id === attemptId) ? attemptId : data.attempts.at(-1)?.id ?? null
  const mistakesPerResult = hasData ? p.mistakes_total / p.total_attempts : null

  const selectAttempt = (id) => {
    setAttemptId(id)
    replayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const counterEntries = Object.entries(SUMMARY_COUNTERS).filter(([k]) => counters?.[k] != null)

  return (
    <div className={`space-y-8 max-w-6xl mx-auto w-full transition-opacity ${isFetching ? 'opacity-80' : ''}`}>
      {/* Navegación */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="h-8 -ml-2 text-muted-foreground min-w-0 shrink" asChild>
          <Link to={`/admin/sessions/${sessionId}`}><ArrowLeft className="h-4 w-4 mr-1 shrink-0" /> <span className="truncate">{session.name}</span></Link>
        </Button>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums mr-1 whitespace-nowrap">{navigation.index + 1} de {navigation.total}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={!navigation.prev} asChild={!!navigation.prev}>
            {navigation.prev ? <Link to={`/admin/sessions/${sessionId}/participants/${navigation.prev}`} aria-label="Participante anterior"><ChevronLeft className="h-4 w-4" /></Link> : <span><ChevronLeft className="h-4 w-4" /></span>}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={!navigation.next} asChild={!!navigation.next}>
            {navigation.next ? <Link to={`/admin/sessions/${sessionId}/participants/${navigation.next}`} aria-label="Participante siguiente"><ChevronRight className="h-4 w-4" /></Link> : <span><ChevronRight className="h-4 w-4" /></span>}
          </Button>
        </div>
      </div>

      {/* Hero */}
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
              <Link to={`/admin/users/${user.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Ver perfil completo <ExternalLink className="h-3 w-3" />
              </Link>
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

      {/* Resumen en palabras */}
      {insights.length > 0 && (
        <section className="space-y-3">
          <SectionTitle icon={Sparkles} hint="Generado a partir de sus resultados en esta sesión">En pocas palabras</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((ins, i) => <InsightCard key={i} icon={ins.icon} tone={ins.tone} title={ins.title}>{ins.body}</InsightCard>)}
          </div>
        </section>
      )}

      {/* Comparativa */}
      <section className="space-y-3">
        <SectionTitle icon={Scale} hint="Verde = mejor que el promedio del grupo">Comparado con el grupo</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <CompareTile label="Riesgos mitigados" value={hasData ? `${p.percentage}%` : '—'}
            delta={hasData && <DeltaChip value={p.percentage - (group.avg_percentage ?? p.percentage)} format={v => `${Math.round(v)} pts`} />} />
          <CompareTile label="Tiempo de reacción" value={formatSeconds(p.avg_reaction_ms)}
            delta={p.avg_reaction_ms && group.avg_reaction_ms && <DeltaChip value={(p.avg_reaction_ms - group.avg_reaction_ms) / 1000} format={v => `${v.toLocaleString('es-CO', { maximumFractionDigits: 1 })} s`} higherIsBetter={false} />} />
          <CompareTile label="Errores por riesgo" value={mistakesPerResult != null ? formatNumber(mistakesPerResult, 1) : '—'}
            delta={mistakesPerResult != null && group.avg_mistakes_per_result != null && <DeltaChip value={mistakesPerResult - group.avg_mistakes_per_result} format={v => formatNumber(v, 1)} higherIsBetter={false} />} />
          <CompareTile label="Tiempo leyendo paneles" value={formatSeconds(reading.avg_read_ms)}
            delta={reading.avg_read_ms && reading.group_avg_read_ms && <DeltaChip value={(reading.avg_read_ms - reading.group_avg_read_ms) / 1000} format={v => `${v.toLocaleString('es-CO', { maximumFractionDigits: 1 })} s`} />}
            hint={`${reading.panels} paneles informativos leídos`} />
        </div>
      </section>

      {/* Recorrido por nivel */}
      <section className="space-y-3">
        <SectionTitle icon={Route} hint="Haz clic en un intento para ver su repetición">Recorrido por nivel</SectionTitle>
        {levelKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed">No ha jugado ningún nivel en esta sesión.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {levelKeys.map(k => (
              <LevelJourneyCard
                key={k} levelKey={k} attempts={attemptsByLevel[k]}
                level={p.telemetry.levels.find(l => l.level_key === k)}
                group={group.levels?.[k]}
                selectedAttemptId={selectedAttempt}
                onSelectAttempt={selectAttempt}
              />
            ))}
          </div>
        )}
      </section>

      {/* Retos de transición (GC-05 memoria, GC-07 reacción): intentos propios, no cuentan en el % de los niveles */}
      {challengeKeys.length > 0 && (
        <section className="space-y-3">
          <SectionTitle icon={Puzzle} hint="Memoria y reacción · haz clic para ver sus rondas">Retos de transición</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            {challengeKeys.map(k => {
              const list = attemptsByLevel[k]
              const passed = list.filter(a => a.outcome === 'completed').length
              const last = list[list.length - 1]
              const ok = last?.outcome === 'completed'
              return (
                <button key={k} type="button" onClick={() => selectAttempt(last.id)}
                  className={`rounded-xl border bg-card p-4 text-left space-y-2 hover:bg-muted/50 transition-colors ${selectedAttempt === last?.id ? 'ring-2 ring-primary' : ''}`}>
                  <p className="text-sm font-semibold">{levelLabel(k)}</p>
                  <p className="text-2xl font-bold leading-none">{passed}<span className="text-sm font-normal text-muted-foreground"> / {list.length} superados</span></p>
                  <p className={`flex items-center gap-1.5 text-xs ${ok ? 'text-[var(--status-good)]' : 'text-[var(--status-critical)]'}`}>
                    {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    Último: {ok ? 'superado' : last?.outcome === 'failed' ? 'no superado' : 'sin terminar'}
                  </p>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Dominio de riesgos */}
      <section className="space-y-3">
        <SectionTitle icon={ShieldHalf} hint="Del más débil al más dominado · la línea marca al grupo">Dominio de cada riesgo</SectionTitle>
        {p.risks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed">Sin resultados por riesgo todavía.</p>
        ) : (
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
                    <span className="rounded-md bg-muted px-2 py-1 tabular-nums">{r.mistakes_total} {r.mistakes_total === 1 ? "error" : "errores"}</span>
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

      {/* Comportamiento */}
      {counterEntries.length > 0 && (
        <section className="space-y-3">
          <SectionTitle icon={Gamepad2} hint="Suma de todos sus intentos en esta sesión">Comportamiento en el juego</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {counterEntries.map(([k, label]) => {
              const Icon = COUNTER_ICONS[k] ?? Activity
              const color = COUNTER_TONE[k] ?? 'var(--chart-1)'
              const isDamage = k.startsWith('damage_')
              return (
                <div key={k} className="rounded-xl border bg-card p-3.5 flex flex-col gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: tintBg(color, 14) }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </span>
                  <p className="text-xl font-bold tabular-nums leading-none">{formatNumber(counters[k])}{isDamage ? <span className="text-xs font-normal text-muted-foreground"> pts</span> : null}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{label}</p>
                </div>
              )
            })}
            {reading.panels > 0 && (
              <div className="rounded-xl border bg-card p-3.5 flex flex-col gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: tintBg('var(--chart-3)', 14) }}>
                  <BookOpen className="h-4 w-4" style={{ color: 'var(--chart-3)' }} />
                </span>
                <p className="text-xl font-bold tabular-nums leading-none">{reading.panels}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">Paneles informativos leídos</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Repetición */}
      <section className="space-y-3 scroll-mt-20" ref={replayRef}>
        <SectionTitle icon={PlayCircle} hint="Pasa el cursor por la curva para ver cada momento">Repetición de un intento</SectionTitle>
        {data.attempts.length === 0
          ? <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed">Sin intentos para mostrar.</p>
          : <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5"><AttemptReplay attempts={data.attempts} selectedId={selectedAttempt} onSelect={setAttemptId} /></div>}
      </section>
    </div>
  )
}
