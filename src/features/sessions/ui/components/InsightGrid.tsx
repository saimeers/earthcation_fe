import { InsightCard } from '@/shared/ui/data/InsightCard'
import type { Insight } from '../../domain/insights'
import { INSIGHT_ICONS } from '../meta'

/** Tarjetas de conclusiones (ya en una grilla definida por quien la usa). */
export function InsightCards({ insights }: { insights: Insight[] }) {
  return insights.map((ins, i) => (
    <InsightCard key={i} icon={INSIGHT_ICONS[ins.icon]} tone={ins.tone} title={ins.title}>{ins.body}</InsightCard>
  ))
}
