import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePanelBase, useCanEdit } from '@/hooks/usePanelBase'
import { formatDistanceToNowStrict, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowLeft, RefreshCw, Users, Play, Square, Download, FileSpreadsheet, FileText, Copy, Check,
  MapPin, UserRound, CalendarClock, ShieldCheck, Timer, Flag, Search, ChevronRight, Grid3x3,
  Activity, Skull, Gauge, Sparkles, ListOrdered,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useSessionProgressAdmin, useStartSession, useEndSession, useExportSessionXlsx,
} from '@/hooks/admin/useSessions'
import { useTelemetryOverview } from '@/hooks/admin/useTelemetry'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  failReasonLabel, formatDuration, formatPct, formatSeconds, fullName, initials, levelLabel, stageLabel,
} from '@/lib/format'
import { cn } from '@/lib/utils'
import { BAND_META, BAND_ORDER, OUTCOME_META, categoryIcon, tintBg } from './bands'
import { sessionInsights } from './insights'
import { RoomQrButton } from './components/RoomQr'
import { Avatar, BandPill, InsightCard, RadialGauge, StatTile, SplitBar } from './components/Performance'
import { JourneyDots } from './components/LevelJourney'
import { RiskMatrix, MatrixLegend } from './components/RiskMatrix'
import { HBarList, Panel, StackedBar } from './components/Bars'

const STATUS_INFO = {
  waiting:  { label: 'Esperando participantes', color: 'var(--status-neutral)' },
  active:   { label: 'En curso',                color: 'var(--status-good)' },
  finished: { label: 'Finalizada',              color: 'var(--primary)' },
}

const SORTS = {
  pct_desc:  { label: 'Mayor mitigación',  fn: (a, b) => b.percentage - a.percentage },
  pct_asc:   { label: 'Menor mitigación',  fn: (a, b) => (a.total_attempts ? a.percentage : 101) - (b.total_attempts ? b.percentage : 101) },
  name:      { label: 'Nombre (A–Z)',       fn: (a, b) => fullName(a.user).localeCompare(fullName(b.user)) },
  reaction:  { label: 'Reacción más rápida', fn: (a, b) => (a.avg_reaction_ms ?? 1e12) - (b.avg_reaction_ms ?? 1e12) },
  attempts:  { label: 'Más intentos',       fn: (a, b) => b.telemetry.attempts - a.telemetry.attempts },
}

function CopyCode({ code }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(String(code ?? ''))
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

function SessionHero({ session, summary, isFetching, dataUpdatedAt, onRefresh, actions }) {
  const base = usePanelBase()
  const status = STATUS_INFO[session?.status] ?? STATUS_INFO.waiting
  const duration = session?.started_at
    ? Math.round(((session.ended_at ? new Date(session.ended_at) : new Date()) - new Date(session.started_at)) / 60000)
    : null

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,var(--accent),transparent_60%)] opacity-70" />
      <div className="relative p-5 sm:p-6 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 mt-0.5" asChild>
            <Link to={`${base}/sessions`} aria-label="Volver a sesiones"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0 space-y-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: tintBg(status.color, 16) }}>
              <span className="relative flex h-2 w-2">
                {session?.status === 'active' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: status.color }} />}
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
              </span>
              {status.label}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{session?.name}</h1>
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
                  {format(new Date(session.started_at), "d MMM yyyy, HH:mm", { locale: es })}
                  {duration != null && <span className="text-foreground font-medium">· {duration} min</span>}
                </span>
              )}
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{summary?.participants ?? 0} participantes</span>
            </div>
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

function ParticipantsTable({ participants, avgPct, onOpen }) {
  if (!participants.length) {
    return <p className="text-sm text-muted-foreground py-10 text-center rounded-xl border border-dashed">Ningún participante coincide con el filtro.</p>
  }
  return (
    <>
      {/* Escritorio */}
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
            {participants.map(p => {
              const hasData = p.total_attempts > 0
              const WeakIcon = categoryIcon(p.weakest_risk?.category)
              return (
                <tr key={p.user.id} onClick={() => onOpen(p.user.id)} className="group cursor-pointer hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar text={initials(p.user)} color={BAND_META[p.band].color} size={36} />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{fullName(p.user)}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          CC {p.user.cedula}{p.organization ? ` · ${p.organization}` : ''}{p.dominant_style ? ` · ${p.dominant_style}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><BandPill band={p.band} /></td>
                  <td className="px-3 py-3">
                    {hasData ? (
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-base font-bold tabular-nums">{p.percentage}%</span>
                          <span className="text-[11px] text-muted-foreground tabular-nums">{p.mitigated}/{p.total_attempts}</span>
                        </div>
                        <SplitBar good={p.mitigated} bad={p.total_attempts - p.mitigated} height={6} marker={avgPct} />
                      </div>
                    ) : <span className="text-xs text-muted-foreground">Sin resultados</span>}
                  </td>
                  <td className="px-3 py-3"><JourneyDots journeys={p.telemetry.journeys} /></td>
                  <td className="px-3 py-3 text-right">
                    <p className="font-semibold tabular-nums">{formatSeconds(p.avg_reaction_ms)}</p>
                    {p.telemetry.best_time_ms != null && <p className="text-[11px] text-muted-foreground tabular-nums">mejor nivel {formatDuration(p.telemetry.best_time_ms)}</p>}
                  </td>
                  <td className="px-3 py-3 max-w-52">
                    {p.weakest_risk ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs min-w-0" title={p.weakest_risk.risk_name}>
                        <WeakIcon className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--status-critical)' }} />
                        <span className="truncate">{p.weakest_risk.risk_name}</span>
                      </span>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="pr-3"><ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Móvil / tablet */}
      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {participants.map(p => (
          <button key={p.user.id} type="button" onClick={() => onOpen(p.user.id)} className="text-left rounded-xl border bg-card p-4 space-y-3 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar text={initials(p.user)} color={BAND_META[p.band].color} size={40} />
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
    </>
  )
}

function TelemetryTab({ data, sessionId }) {
  const { data: overview, isLoading } = useTelemetryOverview({ session_id: sessionId })
  const levels = data.levels ?? []

  const stageItems = levels.flatMap(l =>
    Object.entries(l.fail_stages ?? {}).map(([stage, count]) => ({
      key: `${l.level_key}-${stage}`, label: `${levelLabel(l.level_key)} · ${stageLabel(stage)}`, value: count,
    })),
  ).sort((a, b) => b.value - a.value).slice(0, 8)

  const reasonTotals = {}
  data.fail_reasons.forEach(f => { reasonTotals[f.fail_reason] = (reasonTotals[f.fail_reason] || 0) + f.count })
  const reasonItems = Object.entries(reasonTotals).map(([k, v]) => ({ key: k, label: failReasonLabel(k), value: v })).sort((a, b) => b.value - a.value)

  const eventLabels = {
    device_opened: 'Abrió el detector', fatigue_injury: 'Lesiones por fatiga', risk_info_shown: 'Paneles informativos abiertos',
    gas_alarm: 'Alarmas de gas', biohazard_contact: 'Contactos con riesgo biológico', lantern_warning: 'Advertencias de linterna',
    support_placed: 'Sostenimientos colocados a tiempo', collapse: 'Derrumbes', methane_evacuated: 'Evacuaciones por metano',
    player_death: 'Muertes',
  }
  const eventItems = (overview?.event_counts ?? []).filter(e => eventLabels[e.event_type]).map(e => ({ key: e.event_type, label: eventLabels[e.event_type], value: e.count })).slice(0, 8)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel icon={Flag} title="Resultados por nivel" description="Cómo terminó cada intento de nivel en esta sesión." className="lg:col-span-2">
        {levels.length === 0 ? <p className="text-sm text-muted-foreground">Sin intentos de nivel todavía.</p> : (
          <div className="grid gap-5 md:grid-cols-2">
            {levels.map(l => (
              <div key={l.level_key} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold">{levelLabel(l.level_key)}</p>
                  <p className="text-xs text-muted-foreground">{l.attempts} intentos · mejor {formatDuration(l.best_time_ms)}</p>
                </div>
                <StackedBar segments={['completed', 'failed', 'abandoned'].map(k => ({ key: k, label: OUTCOME_META[k].label, value: l[k], color: OUTCOME_META[k].color, icon: OUTCOME_META[k].icon }))} />
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Panel icon={Skull} title="Causas de fallo" description="De qué pierden los participantes." accent="var(--status-critical)">
        <HBarList items={reasonItems} format={v => `${v}`} empty="Nadie ha perdido un nivel todavía." />
      </Panel>
      <Panel icon={ListOrdered} title="Dónde se quedan" description="Etapas en las que más intentos terminan (fallo o abandono).">
        <HBarList items={stageItems} format={v => `${v}`} empty="Sin fallos registrados por etapa." />
      </Panel>
      <Panel icon={Gauge} title="Detector de gases (Nivel 2)" description="Marca elegida y cuántos intentos lo calibraron.">
        {isLoading ? <Skeleton className="h-24" /> : (
          <HBarList
            items={(overview?.gas_brands ?? []).map(b => ({ key: b.gas_brand, label: b.gas_brand, value: b.attempts ? Math.round((b.calibrated / b.attempts) * 100) : 0, sub: `${b.calibrated}/${b.attempts} calibrados` }))}
            max={100} format={v => `${v}%`} color="var(--chart-3)" empty="Nadie ha jugado el Nivel 2 todavía."
          />
        )}
      </Panel>
      <Panel icon={Activity} title="Lo que más pasa en el juego" description="Eventos registrados durante la sesión.">
        {isLoading ? <Skeleton className="h-24" /> : <HBarList items={eventItems} format={v => v.toLocaleString('es-CO')} color="var(--chart-1)" />}
      </Panel>
    </div>
  )
}

export function SessionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const base = usePanelBase()
  const canEdit = useCanEdit()
  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = useSessionProgressAdmin(id)
  const startSession = useStartSession()
  const endSession = useEndSession()
  const exportXlsx = useExportSessionXlsx()

  const [search, setSearch] = useState('')
  const [band, setBand] = useState(null)
  const [sort, setSort] = useState('pct_desc')

  const session = data?.session
  const summary = data?.summary
  const participants = useMemo(() => data?.participants ?? [], [data])
  const insights = useMemo(() => sessionInsights(data), [data])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return participants
      .filter(p => !band || p.band === band)
      .filter(p => !q || `${fullName(p.user)} ${p.user.cedula} ${p.organization ?? ''}`.toLowerCase().includes(q))
      .sort(SORTS[sort].fn)
  }, [participants, search, band, sort])

  const openParticipant = (userId) => navigate(`${base}/sessions/${id}/participants/${userId}`)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        <Skeleton className="h-44 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  const actions = (
    <>
      {canEdit && !session?.is_free_play && session?.status === 'waiting' && (
        <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => startSession.mutate(id)} disabled={startSession.isPending}>
          <Play className="h-3.5 w-3.5 mr-1.5" /> Iniciar sesión
        </Button>
      )}
      {canEdit && !session?.is_free_play && session?.status === 'active' && (
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
          <DropdownMenuItem className="gap-2.5 py-2 cursor-pointer" onClick={() => exportXlsx.mutate({ id, code: session?.code ?? 'juego-libre' })}>
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span><span className="block text-sm font-medium">Excel (.xlsx)</span><span className="block text-[11px] text-muted-foreground">Participantes, riesgos e intentos en hojas</span></span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2.5 py-2 cursor-pointer" onClick={() => window.open(`${base}/sessions/${id}/report`, '_blank', 'noopener')}>
            <FileText className="h-4 w-4 text-red-600" />
            <span><span className="block text-sm font-medium">Informe PDF</span><span className="block text-[11px] text-muted-foreground">Informe visual listo para imprimir</span></span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  const hasResults = summary?.with_data > 0 || summary?.level_attempts > 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <SessionHero session={session} summary={summary} isFetching={isFetching} dataUpdatedAt={dataUpdatedAt} onRefresh={() => refetch()} actions={actions} />

      {participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-2xl bg-card">
          <div className="bg-primary/10 p-4 rounded-full mb-4"><Users className="h-8 w-8 text-primary" /></div>
          <h3 className="text-lg font-semibold">Aún no hay participantes</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            Comparte el código <span className="font-mono font-bold text-foreground">{session?.code}</span> para que los jugadores se unan desde el juego. Los datos aparecerán aquí en tiempo real.
          </p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-2 lg:col-span-1 rounded-xl border bg-card p-4 flex items-center gap-4">
              <RadialGauge value={summary.avg_percentage} color={BAND_META[summary.avg_percentage == null ? 'sin_datos' : summary.avg_percentage >= 80 ? 'destacado' : summary.avg_percentage >= 40 ? 'en_progreso' : 'refuerzo'].color} size={96} stroke={10} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Mitigación promedio</p>
                <p className="text-sm mt-1 leading-snug">{summary.risk_mitigated} de {summary.risk_results} riesgos enfrentados fueron mitigados</p>
              </div>
            </div>
            <StatTile label="Niveles completados" icon={Flag} accent="var(--status-good)"
              value={formatPct(summary.completion_rate)}
              sub={`${summary.level_completed} de ${summary.level_attempts} intentos terminaron el nivel`} />
            <StatTile label="Reacción promedio" icon={Timer} accent="var(--chart-1)"
              value={formatSeconds(summary.avg_reaction_ms)}
              sub="Tiempo para responder ante un riesgo" />
            <StatTile label="Participantes con datos" icon={Users} accent="var(--primary)"
              value={`${summary.with_data}/${summary.participants}`}
              sub={summary.bands.refuerzo ? `${summary.bands.refuerzo} necesitan refuerzo` : 'Ninguno necesita refuerzo'} />
          </div>

          {/* Conclusiones */}
          {insights.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Lo más importante de la sesión</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {insights.map((ins, i) => <InsightCard key={i} icon={ins.icon} tone={ins.tone} title={ins.title}>{ins.body}</InsightCard>)}
              </div>
            </section>
          )}

          {/* Distribución por desempeño */}
          <Panel icon={ShieldCheck} title="Distribución del grupo" description="Haz clic en una banda para filtrar los participantes.">
            <StackedBar
              height={18}
              active={band}
              onSegmentClick={(k) => setBand(b => (b === k ? null : k))}
              segments={BAND_ORDER.map(k => ({ key: k, label: BAND_META[k].label, value: summary.bands[k], color: BAND_META[k].color, icon: BAND_META[k].icon }))}
            />
          </Panel>

          <Tabs defaultValue="participants" className="flex-col gap-4">
            <TabsList className="h-10 w-full sm:w-fit">
              <TabsTrigger value="participants" className="px-4 text-sm"><Users className="h-4 w-4" /> Participantes</TabsTrigger>
              <TabsTrigger value="risks" className="px-4 text-sm"><Grid3x3 className="h-4 w-4" /> Riesgos</TabsTrigger>
              <TabsTrigger value="telemetry" className="px-4 text-sm"><Activity className="h-4 w-4" /> Telemetría</TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="relative sm:max-w-xs w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, cédula u organización" className="h-9 pl-8 text-sm bg-card" />
                </div>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-9 w-full sm:w-52 bg-card text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper" className="bg-popover border shadow-lg z-[200]">
                    {Object.entries(SORTS).map(([k, s]) => <SelectItem key={k} value={k} className="text-sm">{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {band && (
                  <Button variant="ghost" size="sm" className="h-9 self-start sm:self-auto" onClick={() => setBand(null)}>
                    <BandPill band={band} /> <span className="ml-1 text-muted-foreground">Quitar filtro ×</span>
                  </Button>
                )}
                <p className="text-xs text-muted-foreground sm:ml-auto">{filtered.length} de {participants.length} · la línea negra marca el promedio del grupo</p>
              </div>
              <ParticipantsTable participants={filtered} avgPct={summary.avg_percentage} onOpen={openParticipant} />
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              {!hasResults ? (
                <p className="text-sm text-muted-foreground py-10 text-center rounded-xl border border-dashed">Los riesgos aparecerán cuando haya resultados.</p>
              ) : (
                <>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <Panel icon={Skull} title="Tasa de fallo por riesgo" description="Del más difícil al más dominado por el grupo." className="lg:col-span-1 self-start" accent="var(--status-critical)">
                      <HBarList
                        items={data.risks.map(r => ({ key: r.risk_id, label: `${r.risk_id} · ${r.risk_name}`, icon: categoryIcon(r.category), value: r.fail_rate ?? 0, sub: `${r.failed}/${r.results}`, title: r.risk_name }))}
                        max={100} format={v => `${Math.round(v)}%`} color="var(--status-critical)"
                      />
                    </Panel>
                    <div className="lg:col-span-2 space-y-3 min-w-0">
                      <MatrixLegend />
                      <RiskMatrix participants={filtered} risks={data.risks} onOpen={openParticipant} />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="telemetry">
              <TelemetryTab data={data} sessionId={id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
