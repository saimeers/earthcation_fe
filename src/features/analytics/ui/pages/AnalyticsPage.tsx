import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Users, CalendarDays, ShieldCheck, Flag, TrendingUp, Map, Skull, Layers, Brain, Building2, ArrowRight, Gamepad2,
} from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { StatTile } from '@/shared/ui/data/StatTile'
import { Panel } from '@/shared/ui/data/Panel'
import { HBarList } from '@/shared/ui/data/HBarList'
import { StackedBar } from '@/shared/ui/data/StackedBar'
import { formatPct } from '@/shared/lib/format'
import { tintBg } from '@/shared/lib/color'
import { OnboardingCard, usePanelBase } from '@/features/auth'
import { categoryIcon, failReasonLabel, levelLabel, outcomeSegments, rateTone } from '@/features/sessions'
import { useGameTelemetry, useOverview, useVarkAll } from '../../application/useAnalytics'
import { completionTotals, levelOutcomes, topFailReasons, trendDelta, varkDistribution } from '../../domain/overview'
import { MinesMap } from '../components/map/MinesMap'
import { OrgComparator } from '../components/OrgComparator'
import { VarkTable } from '../components/VarkTable'
import { varkColor } from '../components/varkColors'

interface TrendPoint { week: string, total: number, mitigated: number, percentage: number }

function TrendTooltip({ active, payload }: { active?: boolean, payload?: { payload: TrendPoint }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold">Semana del {format(new Date(d.week), "d 'de' MMM", { locale: es })}</p>
      <p className="text-muted-foreground mt-0.5"><span className="font-semibold text-foreground">{d.percentage}%</span> mitigado · {d.mitigated} de {d.total}</p>
    </div>
  )
}

export function AnalyticsPage() {
  const base = usePanelBase()
  const { data: overview, isLoading } = useOverview()
  const { data: telemetry } = useGameTelemetry()
  const { data: varkData } = useVarkAll()

  const outcomes = useMemo(() => levelOutcomes(telemetry?.levels), [telemetry])
  const { completed, finished } = completionTotals(outcomes)
  const failReasons = useMemo(
    () => topFailReasons(telemetry?.fail_reasons).map(f => ({ ...f, label: failReasonLabel(f.key) })),
    [telemetry],
  )

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
        <div className="grid lg:grid-cols-3 gap-4"><Skeleton className="h-72 rounded-xl lg:col-span-2" /><Skeleton className="h-72 rounded-xl" /></div>
      </div>
    )
  }

  const pct = overview?.progress?.global_percentage ?? 0
  const trend = overview?.tendencia_temporal ?? []
  const delta = trendDelta(trend)
  const { styles: vark, total: varkTotal } = varkDistribution(overview?.vark_distribution)

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <OnboardingCard
        storageKey="dashboard"
        title="Analíticas"
        description="Aquí ves el estado general del entrenamiento."
        tips={[
          'Los riesgos con más fallos te dicen qué reforzar primero.',
          'El mapa ubica cada organización — haz clic en un punto para ver su detalle.',
          'Abajo puedes comparar los jugadores de una organización específica.',
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de analíticas</h1>
          <p className="text-sm text-muted-foreground">Cómo va la capacitación en seguridad minera en todas las organizaciones.</p>
        </div>
        <p className="text-xs text-muted-foreground">{(() => { const d = format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es }); return d[0].toUpperCase() + d.slice(1) })()}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Jugadores" icon={Users} accent="var(--chart-1)" value={overview?.users?.players ?? 0}
          sub={`${overview?.users?.instructors ?? 0} instructores · ${overview?.users?.total ?? 0} usuarios`} />
        <StatTile label="Sesiones" icon={CalendarDays} accent="var(--primary)" value={overview?.sessions?.total ?? 0}
          sub={overview?.sessions?.active ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: 'var(--status-good)' }} /><span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'var(--status-good)' }} /></span>
              {overview.sessions.active} en curso ahora
            </span>
          ) : 'Ninguna en curso'} />
        <StatTile label="Tasa de mitigación" icon={ShieldCheck} accent={rateTone(pct)} value={`${pct}%`}
          sub={`${overview?.progress?.total_mitigated ?? 0} de ${overview?.progress?.total_attempts ?? 0} riesgos (último intento de cada jugador)`}>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: rateTone(pct) }} /></div>
        </StatTile>
        <StatTile label="Niveles completados" icon={Flag} accent="var(--status-good)"
          value={finished ? formatPct((completed / finished) * 100) : '—'}
          sub={finished ? `${completed} de ${finished} intentos de nivel` : 'Sin intentos de nivel todavía'} />
      </div>

      {/* Tendencia + VARK */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel icon={TrendingUp} title="Mitigación semana a semana" className="lg:col-span-2"
          description="Porcentaje de riesgos mitigados por semana (últimas 8 con datos)."
          action={delta != null && (
            <span className="text-xs rounded-md px-2 py-1 font-medium" style={{ background: tintBg(delta >= 0 ? 'var(--status-good)' : 'var(--status-critical)', 16) }}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts vs. semana anterior
            </span>
          )}>
          {trend.length === 0 ? <p className="text-sm text-muted-foreground py-10 text-center">Sin resultados todavía.</p> : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="week" tickFormatter={w => format(new Date(w as string), 'd MMM', { locale: es })} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="percentage" stroke="var(--chart-1)" strokeWidth={2} fill="url(#trendFill)" dot={{ r: 4, fill: 'var(--chart-1)', stroke: 'var(--card)', strokeWidth: 2 }} activeDot={{ r: 6, stroke: 'var(--card)', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel icon={Brain} title="Estilos de aprendizaje" description={`Resultado del test VARK de ${varkTotal} jugadores.`}>
          {vark.length === 0 ? <p className="text-sm text-muted-foreground">Nadie ha completado el test todavía.</p> : (
            <div className="space-y-4">
              <StackedBar height={16} showLegend={false} segments={vark.map(v => ({ key: v.style, label: v.style, value: v.count, color: varkColor(v.style) }))} />
              <ul className="space-y-2.5">
                {[...vark].sort((a, b) => b.count - a.count).map(v => (
                  <li key={v.style} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm"><span className="h-3 w-3 rounded" style={{ background: varkColor(v.style) }} />{v.style}</span>
                    <span className="text-sm tabular-nums"><span className="font-semibold">{v.count}</span> <span className="text-muted-foreground text-xs">({Math.round((v.count / varkTotal) * 100)}%)</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      </div>

      {/* Mapa + riesgos */}
      <div className="grid gap-4 xl:grid-cols-3 items-start">
        <Panel icon={Map} title="Mapa de unidades mineras" className="xl:col-span-2"
          description="Color del departamento = cantidad de jugadores. Cada punto es un municipio con minas, coloreado por su % de mitigación. Haz clic en un punto para ver sus organizaciones.">
          <MinesMap />
        </Panel>
        <Panel icon={Skull} title="Riesgos con más fallos" accent="var(--status-critical)" description="Qué riesgo se está mitigando peor — empieza a reforzar por arriba.">
          <HBarList
            items={(overview?.riesgos_mas_fallados ?? []).map(r => ({ key: r.risk_id, label: r.name, icon: categoryIcon(r.category), value: r.fail_rate, sub: `${r.failed}/${r.total_attempts}`, title: `${r.risk_id} · ${r.avg_mistakes} errores promedio` }))}
            max={100} format={v => `${v}%`} color="var(--status-critical)" empty="Sin resultados todavía."
          />
        </Panel>
      </div>

      {/* Niveles */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel icon={Layers} title="Mitigación por nivel" description="Riesgos mitigados sobre los enfrentados en cada nivel.">
          <HBarList
            items={(overview?.progress_by_level ?? []).map(l => ({ key: l.level, label: l.level, value: l.percentage, sub: `${l.mitigated}/${l.total}`, color: rateTone(l.percentage) }))}
            max={100} format={v => `${v}%`} empty="Sin resultados todavía."
          />
        </Panel>
        <Panel icon={Gamepad2} title="Cómo terminan los intentos" description="Resultado de cada intento de nivel en el juego.">
          {outcomes.length === 0 ? <p className="text-sm text-muted-foreground">Sin intentos de nivel todavía.</p> : (
            <div className="space-y-4">
              {outcomes.map(l => (
                <div key={l.level_key} className="space-y-1.5">
                  <p className="text-xs font-semibold">{levelLabel(l.level_key)}</p>
                  <StackedBar height={10} segments={outcomeSegments(l)} />
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel icon={Skull} title="Causas de fallo" accent="var(--status-critical)" description="De qué pierden los jugadores en el juego.">
          <HBarList items={failReasons} empty="Nadie ha perdido un nivel todavía." />
        </Panel>
      </div>

      {/* Detalle */}
      <Panel icon={Building2} title="Detalle por organización y jugador" description="Compara una organización o revisa el estilo de aprendizaje de cada jugador."
        action={<Link to={`${base}/users`} className="text-xs text-primary hover:underline hidden sm:inline-flex items-center gap-1">Ver usuarios <ArrowRight className="h-3 w-3" /></Link>}>
        <Tabs defaultValue="orgs" className="flex-col gap-4">
          <TabsList className="h-9 w-full sm:w-fit">
            <TabsTrigger value="orgs" className="px-3 text-sm"><Building2 className="h-4 w-4" /> Comparar organización</TabsTrigger>
            <TabsTrigger value="vark" className="px-3 text-sm"><Brain className="h-4 w-4" /> Jugadores y VARK</TabsTrigger>
          </TabsList>
          <TabsContent value="orgs"><OrgComparator /></TabsContent>
          <TabsContent value="vark"><VarkTable data={varkData} /></TabsContent>
        </Tabs>
      </Panel>
    </div>
  )
}
