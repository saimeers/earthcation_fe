/* eslint-disable react-refresh/only-export-components -- constantes/formatos del informe a propósito junto a sus componentes */
import type { CSSProperties, ReactNode } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SplitBar } from '@/shared/ui/data/Gauges'
import { HBarList } from '@/shared/ui/data/HBarList'
import { StackedBar } from '@/shared/ui/data/StackedBar'
import { formatDuration, formatPct, formatSeconds, fullName } from '@/shared/lib/format'
import type { SessionProgressDto } from '@/shared/api/types'
import { failReasonItems, sessionDuration, showsRoomQr, type Participant } from '../../../domain/sessions'
import { levelLabel, stageLabel } from '../../../domain/telemetry'
import { bandSegments, categoryIcon, outcomeSegments } from '../../meta'
import { BandPill } from '../BandPill'
import { RoomQrPrint } from '../RoomQr'

// El informe siempre se imprime en claro, sin importar el tema del panel.
export const LIGHT_VARS = {
  '--background': '#ffffff', '--foreground': '#0b0b0b', '--card': '#ffffff', '--card-foreground': '#0b0b0b',
  '--popover': '#ffffff', '--popover-foreground': '#0b0b0b', '--muted': '#f4f4f2', '--muted-foreground': '#52514e',
  '--border': '#e4e3df', '--primary': 'oklch(0.52 0.22 300)', '--accent': 'oklch(0.95 0.05 300)',
  '--status-neutral': '#a1a09a', '--chart-grid': '#e1e0d9', '--chart-1': '#2a78d6', '--chart-3': '#1baf7a',
  colorScheme: 'light',
} as CSSProperties

export const fmtLongDate = (d: string | Date | null | undefined) => (d ? format(new Date(d), "d 'de' MMMM yyyy, HH:mm", { locale: es }) : '—')

export function Section({ title, children, className = '', breakable = false }: { title: string, children: ReactNode, className?: string, breakable?: boolean }) {
  return (
    <section className={`${breakable ? '' : 'break-inside-avoid'} space-y-3 ${className}`}>
      <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[color:var(--primary)] border-b border-[color:var(--border)] pb-1.5">{title}</h2>
      {children}
    </section>
  )
}

function Kpi({ label, value, sub }: { label: string, value: ReactNode, sub?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground leading-snug">{sub}</p>}
    </div>
  )
}

export function ReportHeader({ session }: { session: SessionProgressDto['session'] }) {
  const duration = sessionDuration(session)
  return (
    <header className="flex items-start justify-between gap-6 border-b-4 border-[color:var(--primary)] pb-4">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Informe de sesión de capacitación</p>
        <h1 className="text-2xl font-bold leading-tight">{session.name}</h1>
        <p className="text-muted-foreground">
          Instructor: <b className="text-foreground">{fullName(session.instructor)}</b>
          {session.location && <> · {session.location.municipality}, {session.location.department}</>}
        </p>
        <p className="text-muted-foreground">
          Inicio: {fmtLongDate(session.started_at)} · Fin: {fmtLongDate(session.ended_at)}{duration != null && ` · ${duration} min`}
        </p>
      </div>
      <div className="text-right shrink-0">
        <img src="/logo_earthcation.svg" alt="" className="h-10 w-10 ml-auto mb-1" />
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{session.is_free_play ? 'Sesión' : 'Código de sala'}</p>
        <p className="font-mono text-2xl font-bold tracking-[0.15em] text-[color:var(--primary)]">{session.is_free_play ? 'Juego libre' : session.code}</p>
        {showsRoomQr(session) && (
          <div className="mt-1 flex justify-end"><RoomQrPrint code={session.code} size={88} /></div>
        )}
      </div>
    </header>
  )
}

export function ReportSummary({ summary }: { summary: SessionProgressDto['summary'] }) {
  return (
    <Section title="Resumen">
      <div className="grid grid-cols-4 gap-3">
        <Kpi label="Participantes" value={summary.participants} sub={`${summary.with_data} con resultados`} />
        <Kpi label="Mitigación promedio" value={formatPct(summary.avg_percentage)} sub={`${summary.risk_mitigated} de ${summary.risk_results} riesgos`} />
        <Kpi label="Niveles completados" value={formatPct(summary.completion_rate)} sub={`${summary.level_completed} de ${summary.level_attempts} intentos`} />
        <Kpi label="Reacción promedio" value={formatSeconds(summary.avg_reaction_ms)} sub="ante cada riesgo" />
      </div>
      <StackedBar segments={bandSegments(summary.bands)} />
    </Section>
  )
}

export function ReportParticipants({ participants }: { participants: Participant[] }) {
  return (
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
          {participants.map((p, i) => (
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
  )
}

export function ReportRisks({ data }: { data: SessionProgressDto }) {
  const { risks, levels, fail_reasons } = data
  return (
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
                  <StackedBar height={10} segments={outcomeSegments(l)} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold mb-2">Causas de fallo</p>
            <HBarList items={failReasonItems(fail_reasons)} />
            {fail_reasons[0]?.fail_stage && (
              <p className="text-[10px] text-muted-foreground mt-2">Etapa más crítica: {stageLabel(fail_reasons[0].fail_stage)} ({levelLabel(fail_reasons[0].level_key)})</p>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
