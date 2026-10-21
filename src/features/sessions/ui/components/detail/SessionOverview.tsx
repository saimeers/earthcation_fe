import { Flag, ShieldCheck, Sparkles, Timer, Users } from 'lucide-react'
import { RadialGauge } from '@/shared/ui/data/Gauges'
import { StatTile } from '@/shared/ui/data/StatTile'
import { Panel } from '@/shared/ui/data/Panel'
import { StackedBar } from '@/shared/ui/data/StackedBar'
import { formatPct, formatSeconds } from '@/shared/lib/format'
import type { SessionSummaryDto } from '@/shared/api/types'
import { bandForAverage, type PerformanceBand } from '../../../domain/bands'
import type { Insight } from '../../../domain/insights'
import { bandMeta, bandSegments } from '../../meta'
import { InsightCards } from '../InsightGrid'

export function SessionKpis({ summary }: { summary: SessionSummaryDto }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="col-span-2 lg:col-span-1 rounded-xl border bg-card p-4 flex items-center gap-4">
        <RadialGauge value={summary.avg_percentage} color={bandMeta(bandForAverage(summary.avg_percentage)).color} size={96} stroke={10} />
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
  )
}

export function SessionInsights({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Lo más importante de la sesión</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCards insights={insights} />
      </div>
    </section>
  )
}

interface BandDistributionProps {
  bands: Record<PerformanceBand, number>
  active: PerformanceBand | null
  onToggle: (band: PerformanceBand) => void
}

/** Distribución por desempeño: un clic en una banda filtra la tabla de participantes. */
export function BandDistribution({ bands, active, onToggle }: BandDistributionProps) {
  return (
    <Panel icon={ShieldCheck} title="Distribución del grupo" description="Haz clic en una banda para filtrar los participantes.">
      <StackedBar height={18} active={active} onSegmentClick={onToggle} segments={bandSegments(bands)} />
    </Panel>
  )
}

export function NoParticipants({ code }: { code: string | null | undefined }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-2xl bg-card">
      <div className="bg-primary/10 p-4 rounded-full mb-4"><Users className="h-8 w-8 text-primary" /></div>
      <h3 className="text-lg font-semibold">Aún no hay participantes</h3>
      <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
        Comparte el código <span className="font-mono font-bold text-foreground">{code}</span> para que los jugadores se unan desde el juego. Los datos aparecerán aquí en tiempo real.
      </p>
    </div>
  )
}
