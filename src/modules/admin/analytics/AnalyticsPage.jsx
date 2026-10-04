import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  Users, CalendarDays, ShieldCheck, Flag, TrendingUp, Map, Skull, Layers, Brain, Building2, Search,
  ArrowRight, Gamepad2,
} from 'lucide-react'
import { useOverview, useVarkAll, useAnalyticsByOrganization } from '@/hooks/admin/useAnalytics'
import { useTelemetryOverview } from '@/hooks/admin/useTelemetry'
import { useOrganizations } from '@/hooks/admin/useOrganizations'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { failReasonLabel, formatPct, levelLabel } from '@/lib/format'
import { MinesMap } from './MinesMap'
import { OnboardingCard } from '@/modules/admin/components/OnboardingCard'
import { BAND_META, OUTCOME_META, categoryIcon, rateTone, tintBg } from '@/modules/admin/sessions/bands'
import { StatTile, BandPill } from '@/modules/admin/sessions/components/Performance'
import { HBarList, Panel, StackedBar } from '@/modules/admin/sessions/components/Bars'

// Orden fijo de la paleta categórica (validada para daltonismo) — el color sigue al estilo, no al rango
const VARK_COLORS = {
  'Visual':          'var(--chart-1)',
  'Auditivo':        'var(--chart-2)',
  'Lector/Escritor': 'var(--chart-3)',
  'Sin completar':   'var(--status-neutral)',
}

function TrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold">Semana del {format(new Date(d.week), "d 'de' MMM", { locale: es })}</p>
      <p className="text-muted-foreground mt-0.5"><span className="font-semibold text-foreground">{d.percentage}%</span> mitigado · {d.mitigated} de {d.total}</p>
    </div>
  )
}

function OrgComparator() {
  const { orgs } = useOrganizations()
  const [orgId, setOrgId] = useState('')
  const { data, isLoading } = useAnalyticsByOrganization(orgId)
  const rows = useMemo(() => [...(data ?? [])].sort((a, b) => b.percentage - a.percentage), [data])
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.percentage, 0) / rows.length) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <Select value={orgId} onValueChange={setOrgId}>
          <SelectTrigger className="h-9 w-full sm:w-80 bg-background text-sm"><SelectValue placeholder="Selecciona una organización" /></SelectTrigger>
          <SelectContent position="popper" className="max-h-72 bg-popover border shadow-lg z-[200]">
            {(orgs ?? []).map(o => <SelectItem key={o.id} value={o.id} className="text-sm">{o.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {avg != null && <p className="text-sm text-muted-foreground">{rows.length} jugadores · promedio <span className="font-semibold text-foreground">{avg}%</span></p>}
      </div>
      {!orgId ? (
        <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed">Elige una organización para ver el desempeño de sus jugadores.</p>
      ) : isLoading ? <Skeleton className="h-40 rounded-xl" /> : !rows.length ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Sin jugadores registrados en esta organización.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {rows.map(r => {
            const band = r.total_attempts ? (r.percentage >= 80 ? 'destacado' : r.percentage >= 40 ? 'en_progreso' : 'refuerzo') : 'sin_datos'
            return (
              <Link key={r.user?.id} to={`/admin/users/${r.user?.id}`} className="rounded-lg border p-3 hover:bg-muted/40 transition-colors space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.user?.first_name} {r.user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">CC {r.user?.cedula}{r.dominant_style ? ` · ${r.dominant_style}` : ''}</p>
                  </div>
                  <BandPill band={band} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.percentage}%`, background: BAND_META[band].color }} />
                  </div>
                  <span className="text-xs font-semibold tabular-nums w-16 text-right">{r.percentage}% <span className="text-muted-foreground font-normal">({r.mitigated}/{r.total_attempts})</span></span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function VarkTable({ data }) {
  const [q, setQ] = useState('')
  const rows = (data ?? []).filter(i => `${i.user?.first_name} ${i.user?.last_name} ${i.user?.cedula} ${i.user?.profile?.organization?.name ?? ''}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-3">
      <div className="relative sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar jugador u organización" className="h-9 pl-8 text-sm" />
      </div>
      <div className="overflow-x-auto rounded-xl border max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
            <tr className="text-xs text-muted-foreground">
              <th className="px-4 py-2.5 text-left font-medium">Jugador</th>
              <th className="px-4 py-2.5 text-left font-medium">Organización</th>
              <th className="px-4 py-2.5 text-left font-medium">Estilo</th>
              <th className="px-4 py-2.5 text-left font-medium w-48">Puntajes V · A · L</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(item => {
              const scores = [['Visual', item.visual_score], ['Auditivo', item.auditory_score], ['Lector/Escritor', item.reading_score]]
              const total = scores.reduce((a, [, v]) => a + (v ?? 0), 0) || 1
              return (
                <tr key={item.user_id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <p className="font-medium">{item.user?.first_name} {item.user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{item.user?.cedula}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{item.user?.profile?.organization?.name ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: VARK_COLORS[item.dominant_style] ?? 'var(--status-neutral)' }} />
                      {item.dominant_style ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex h-2 gap-[2px]" title={scores.map(([k, v]) => `${k}: ${v ?? 0}`).join(' · ')}>
                      {scores.map(([k, v]) => v ? <span key={k} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(v / total) * 100}%`, background: VARK_COLORS[k] }} /> : null)}
                    </div>
                    <p className="text-[11px] text-muted-foreground tabular-nums mt-1">{item.visual_score ?? 0} · {item.auditory_score ?? 0} · {item.reading_score ?? 0}</p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AnalyticsPage() {
  const { data: overview, isLoading } = useOverview()
  const { data: telemetry } = useTelemetryOverview()
  const { data: varkData } = useVarkAll()

  const levelOutcomes = useMemo(() => {
    const by = {}
    ;(telemetry?.levels ?? []).forEach(r => {
      const l = by[r.level_key] ||= { level_key: r.level_key, completed: 0, failed: 0, abandoned: 0, in_progress: 0 }
      l[r.outcome] = (l[r.outcome] || 0) + r.count
    })
    return Object.values(by).sort((a, b) => a.level_key.localeCompare(b.level_key))
  }, [telemetry])
  const levelTotals = levelOutcomes.reduce((a, l) => ({ c: a.c + l.completed, t: a.t + l.completed + l.failed + l.abandoned }), { c: 0, t: 0 })

  const failReasons = useMemo(() => {
    const by = {}
    ;(telemetry?.fail_reasons ?? []).forEach(f => { by[f.fail_reason || 'desconocido'] = (by[f.fail_reason || 'desconocido'] || 0) + f.count })
    return Object.entries(by).map(([k, v]) => ({ key: k, label: failReasonLabel(k), value: v })).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [telemetry])

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
  const lastTwo = trend.slice(-2)
  const trendDelta = lastTwo.length === 2 ? lastTwo[1].percentage - lastTwo[0].percentage : null
  const vark = (overview?.vark_distribution ?? []).filter(v => v.count > 0)
  const varkTotal = vark.reduce((a, v) => a + v.count, 0)

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
          value={levelTotals.t ? formatPct((levelTotals.c / levelTotals.t) * 100) : '—'}
          sub={levelTotals.t ? `${levelTotals.c} de ${levelTotals.t} intentos de nivel` : 'Sin intentos de nivel todavía'} />
      </div>

      {/* Tendencia + VARK */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel icon={TrendingUp} title="Mitigación semana a semana" className="lg:col-span-2"
          description="Porcentaje de riesgos mitigados por semana (últimas 8 con datos)."
          action={trendDelta != null && (
            <span className="text-xs rounded-md px-2 py-1 font-medium" style={{ background: tintBg(trendDelta >= 0 ? 'var(--status-good)' : 'var(--status-critical)', 16) }}>
              {trendDelta >= 0 ? '▲' : '▼'} {Math.abs(trendDelta)} pts vs. semana anterior
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
                  <XAxis dataKey="week" tickFormatter={w => format(new Date(w), 'd MMM', { locale: es })} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
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
              <StackedBar height={16} showLegend={false} segments={vark.map(v => ({ key: v.style, label: v.style, value: v.count, color: VARK_COLORS[v.style] ?? 'var(--status-neutral)' }))} />
              <ul className="space-y-2.5">
                {[...vark].sort((a, b) => b.count - a.count).map(v => (
                  <li key={v.style} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm"><span className="h-3 w-3 rounded" style={{ background: VARK_COLORS[v.style] ?? 'var(--status-neutral)' }} />{v.style}</span>
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
          {levelOutcomes.length === 0 ? <p className="text-sm text-muted-foreground">Sin intentos de nivel todavía.</p> : (
            <div className="space-y-4">
              {levelOutcomes.map(l => (
                <div key={l.level_key} className="space-y-1.5">
                  <p className="text-xs font-semibold">{levelLabel(l.level_key)}</p>
                  <StackedBar height={10} segments={['completed', 'failed', 'abandoned'].map(k => ({ key: k, label: OUTCOME_META[k].label, value: l[k], color: OUTCOME_META[k].color, icon: OUTCOME_META[k].icon }))} />
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
        action={<Link to="/admin/users" className="text-xs text-primary hover:underline hidden sm:inline-flex items-center gap-1">Ver usuarios <ArrowRight className="h-3 w-3" /></Link>}>
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
