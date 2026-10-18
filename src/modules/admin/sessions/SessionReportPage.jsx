import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Printer, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSessionProgressAdmin } from '@/hooks/admin/useSessions'
import {
  failReasonLabel, formatDuration, formatPct, formatSeconds, fullName, levelLabel, stageLabel,
} from '@/lib/format'
import { BAND_META, BAND_ORDER, OUTCOME_META, categoryIcon } from './bands'
import { sessionInsights } from './insights'
import { BandPill, InsightCard, SplitBar } from './components/Performance'
import { HBarList, StackedBar } from './components/Bars'
import { RiskMatrix, MatrixLegend } from './components/RiskMatrix'

// El informe siempre se imprime en claro, sin importar el tema del panel.
const LIGHT_VARS = {
  '--background': '#ffffff', '--foreground': '#0b0b0b', '--card': '#ffffff', '--card-foreground': '#0b0b0b',
  '--popover': '#ffffff', '--popover-foreground': '#0b0b0b', '--muted': '#f4f4f2', '--muted-foreground': '#52514e',
  '--border': '#e4e3df', '--primary': 'oklch(0.52 0.22 300)', '--accent': 'oklch(0.95 0.05 300)',
  '--status-neutral': '#a1a09a', '--chart-grid': '#e1e0d9', '--chart-1': '#2a78d6', '--chart-3': '#1baf7a',
  colorScheme: 'light',
}

function Section({ title, children, className = '', breakable = false }) {
  return (
    <section className={`${breakable ? '' : 'break-inside-avoid'} space-y-3 ${className}`}>
      <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[color:var(--primary)] border-b border-[color:var(--border)] pb-1.5">{title}</h2>
      {children}
    </section>
  )
}

function Kpi({ label, value, sub }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground leading-snug">{sub}</p>}
    </div>
  )
}

export function SessionReportPage() {
  const { id } = useParams()
  const { data, isLoading } = useSessionProgressAdmin(id)
  const insights = useMemo(() => sessionInsights(data), [data])

  useEffect(() => {
    if (data?.session) document.title = `Informe — ${data.session.name}`
  }, [data])

  if (isLoading || !data) {
    return <div className="min-h-svh flex items-center justify-center bg-white text-zinc-600"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Preparando informe…</div>
  }

  const { session, summary, participants, risks, levels, fail_reasons } = data
  const sorted = [...participants].sort((a, b) => b.percentage - a.percentage)
  const duration = session.started_at && session.ended_at
    ? Math.round((new Date(session.ended_at) - new Date(session.started_at)) / 60000) : null
  const fmtDate = (d) => (d ? format(new Date(d), "d 'de' MMMM yyyy, HH:mm", { locale: es }) : '—')

  const reasonTotals = {}
  fail_reasons.forEach(f => { reasonTotals[f.fail_reason] = (reasonTotals[f.fail_reason] || 0) + f.count })

  return (
    <div style={LIGHT_VARS} className="min-h-svh bg-[#f4f4f2] print:bg-white text-[color:var(--foreground)]">
      {/* Barra de acciones — no se imprime */}
      <div className="print:hidden sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-[210mm] flex items-center justify-between gap-3 px-4 py-2.5">
          <Button variant="ghost" size="sm" className="h-8" asChild>
            <Link to={`/admin/sessions/${id}`}><ArrowLeft className="h-4 w-4 mr-1" /> Volver a la sesión</Link>
          </Button>
          <div className="flex items-center gap-3">
            <p className="text-xs text-zinc-500 hidden sm:block">En el diálogo de impresión elige «Guardar como PDF».</p>
            <Button size="sm" className="h-8" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> Imprimir / Guardar PDF</Button>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white my-6 print:my-0 shadow-xl print:shadow-none rounded-sm print:rounded-none px-[14mm] py-[12mm] print:p-0 space-y-6 text-[12px]">
        {/* Encabezado */}
        <header className="flex items-start justify-between gap-6 border-b-4 border-[color:var(--primary)] pb-4">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Informe de sesión de capacitación</p>
            <h1 className="text-2xl font-bold leading-tight">{session.name}</h1>
            <p className="text-muted-foreground">
              Instructor: <b className="text-foreground">{fullName(session.instructor)}</b>
              {session.location && <> · {session.location.municipality}, {session.location.department}</>}
            </p>
            <p className="text-muted-foreground">
              Inicio: {fmtDate(session.started_at)} · Fin: {fmtDate(session.ended_at)}{duration != null && ` · ${duration} min`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <img src="/logo_earthcation.svg" alt="" className="h-10 w-10 ml-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{session.is_free_play ? 'Sesión' : 'Código de sala'}</p>
            <p className="font-mono text-2xl font-bold tracking-[0.15em] text-[color:var(--primary)]">{session.is_free_play ? 'Juego libre' : session.code}</p>
          </div>
        </header>

        <Section title="Resumen">
          <div className="grid grid-cols-4 gap-3">
            <Kpi label="Participantes" value={summary.participants} sub={`${summary.with_data} con resultados`} />
            <Kpi label="Mitigación promedio" value={formatPct(summary.avg_percentage)} sub={`${summary.risk_mitigated} de ${summary.risk_results} riesgos`} />
            <Kpi label="Niveles completados" value={formatPct(summary.completion_rate)} sub={`${summary.level_completed} de ${summary.level_attempts} intentos`} />
            <Kpi label="Reacción promedio" value={formatSeconds(summary.avg_reaction_ms)} sub="ante cada riesgo" />
          </div>
          <StackedBar segments={BAND_ORDER.map(k => ({ key: k, label: BAND_META[k].label, value: summary.bands[k], color: BAND_META[k].color, icon: BAND_META[k].icon }))} />
        </Section>

        {insights.length > 0 && (
          <Section title="Conclusiones">
            <div className="grid grid-cols-2 gap-2.5">
              {insights.map((ins, i) => <InsightCard key={i} icon={ins.icon} tone={ins.tone} title={ins.title}>{ins.body}</InsightCard>)}
            </div>
          </Section>
        )}

        <Section title="Participantes" breakable>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-1.5 pr-2 font-semibold">#</th>
                <th className="py-1.5 pr-2 font-semibold">Participante</th>
                <th className="py-1.5 pr-2 font-semibold">Desempeño</th>
                <th className="py-1.5 pr-2 font-semibold w-36">Riesgos mitigados</th>
                <th className="py-1.5 pr-2 font-semibold text-center"><span title="Completados / Fallidos / Abandonados">Niveles C/F/A</span></th>
                <th className="py-1.5 pr-2 font-semibold text-right">Reacción</th>
                <th className="py-1.5 font-semibold">Punto débil</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr key={p.user.id} className="border-b border-[color:var(--border)] break-inside-avoid">
                  <td className="py-1.5 pr-2 tabular-nums text-muted-foreground">{i + 1}</td>
                  <td className="py-1.5 pr-2">
                    <p className="font-semibold leading-tight">{fullName(p.user)}</p>
                    <p className="text-[10px] text-muted-foreground">CC {p.user.cedula}{p.organization ? ` · ${p.organization}` : ''}</p>
                  </td>
                  <td className="py-1.5 pr-2"><BandPill band={p.band} /></td>
                  <td className="py-1.5 pr-2">
                    {p.total_attempts ? (
                      <div className="space-y-1">
                        <p className="tabular-nums"><b>{p.percentage}%</b> <span className="text-muted-foreground">({p.mitigated}/{p.total_attempts})</span></p>
                        <SplitBar good={p.mitigated} bad={p.total_attempts - p.mitigated} height={5} />
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-1.5 pr-2 text-center tabular-nums">{p.telemetry.completed}/{p.telemetry.failed}/{p.telemetry.abandoned}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">{formatSeconds(p.avg_reaction_ms)}</td>
                  <td className="py-1.5 text-[11px]">{p.weakest_risk?.risk_name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {risks.length > 0 && (
          <Section title="Riesgos">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-semibold mb-2">Tasa de fallo por riesgo</p>
                <HBarList
                  items={risks.map(r => ({ key: r.risk_id, label: `${r.risk_id} · ${r.risk_name}`, icon: categoryIcon(r.category), value: r.fail_rate ?? 0, sub: `${r.failed}/${r.results}` }))}
                  max={100} format={v => `${Math.round(v)}%`} color="var(--status-critical)"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold mb-2">Resultados por nivel</p>
                  <div className="space-y-3">
                    {levels.map(l => (
                      <div key={l.level_key}>
                        <p className="text-[11px] mb-1">{levelLabel(l.level_key)} · {l.attempts} intentos · mejor {formatDuration(l.best_time_ms)}</p>
                        <StackedBar height={10} segments={['completed', 'failed', 'abandoned'].map(k => ({ key: k, label: OUTCOME_META[k].label, value: l[k], color: OUTCOME_META[k].color, icon: OUTCOME_META[k].icon }))} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold mb-2">Causas de fallo</p>
                  <HBarList items={Object.entries(reasonTotals).map(([k, v]) => ({ key: k, label: failReasonLabel(k), value: v })).sort((a, b) => b.value - a.value)} />
                  {fail_reasons[0]?.fail_stage && (
                    <p className="text-[10px] text-muted-foreground mt-2">Etapa más crítica: {stageLabel(fail_reasons[0].fail_stage)} ({levelLabel(fail_reasons[0].level_key)})</p>
                  )}
                </div>
              </div>
            </div>
          </Section>
        )}

        {risks.length > 0 && (
          <Section title="Matriz de dominio por participante" breakable>
            <MatrixLegend />
            <div className="[&_.overflow-x-auto]:overflow-visible">
              <RiskMatrix participants={sorted} risks={risks} onOpen={() => {}} />
            </div>
          </Section>
        )}

        <footer className="pt-3 border-t text-[10px] text-muted-foreground flex justify-between">
          <span>Earthcation · Plataforma de capacitación en seguridad minera</span>
          <span>Generado el {format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</span>
        </footer>
      </article>
    </div>
  )
}
