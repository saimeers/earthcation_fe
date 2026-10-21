import type { AnalyticsOverviewDto, OrganizationPlayerDto, TelemetryOverviewDto, VarkEntryDto } from '@/shared/api/types'

export type Overview = AnalyticsOverviewDto
export type TelemetryOverview = TelemetryOverviewDto
export type VarkEntry = VarkEntryDto
export type OrganizationPlayer = OrganizationPlayerDto

export interface LevelOutcomes { level_key: string, completed: number, failed: number, abandoned: number, in_progress: number }

/** Intentos de nivel agrupados por nivel y resultado, ordenados por nivel. */
export function levelOutcomes(levels: TelemetryOverview['levels'] = []): LevelOutcomes[] {
  const by: Record<string, LevelOutcomes> = {}
  levels.forEach(r => {
    const l = by[r.level_key] ||= { level_key: r.level_key, completed: 0, failed: 0, abandoned: 0, in_progress: 0 }
    l[r.outcome] = (l[r.outcome] || 0) + r.count
  })
  return Object.values(by).sort((a, b) => a.level_key.localeCompare(b.level_key))
}

/** Completados sobre terminados (completados + fallidos + abandonados). */
export const completionTotals = (outcomes: LevelOutcomes[]): { completed: number, finished: number } =>
  outcomes.reduce((a, l) => ({ completed: a.completed + l.completed, finished: a.finished + l.completed + l.failed + l.abandoned }), { completed: 0, finished: 0 })

/** Las 6 causas de fallo más frecuentes (sin causa = 'desconocido'). */
export function topFailReasons(failReasons: TelemetryOverview['fail_reasons'] = []): { key: string, value: number }[] {
  const by: Record<string, number> = {}
  failReasons.forEach(f => { const k = f.fail_reason || 'desconocido'; by[k] = (by[k] || 0) + f.count })
  return Object.entries(by).map(([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value).slice(0, 6)
}

/** Diferencia en puntos entre las dos últimas semanas con datos (null si hay menos de dos). */
export function trendDelta(trend: Overview['tendencia_temporal'] = []): number | null {
  const lastTwo = trend.slice(-2)
  return lastTwo.length === 2 ? lastTwo[1].percentage - lastTwo[0].percentage : null
}

/** Estilos con al menos un jugador y el total. */
export function varkDistribution(distribution: Overview['vark_distribution'] = []) {
  const styles = distribution.filter(v => v.count > 0)
  return { styles, total: styles.reduce((a, v) => a + v.count, 0) }
}

/** Jugadores de una organización del mejor al peor, con el promedio del grupo. */
export function organizationRanking(players: OrganizationPlayer[] = []) {
  const rows = [...players].sort((a, b) => b.percentage - a.percentage)
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.percentage, 0) / rows.length) : null
  return { rows, avg }
}

/** Búsqueda en la tabla VARK por nombre, cédula u organización. */
export const searchVark = (entries: VarkEntry[] = [], q: string): VarkEntry[] =>
  entries.filter(i => `${i.user?.first_name} ${i.user?.last_name} ${i.user?.cedula} ${i.user?.profile?.organization?.name ?? ''}`.toLowerCase().includes(q.toLowerCase()))

export const VARK_STYLES = ['Visual', 'Auditivo', 'Lector/Escritor'] as const

/** Puntajes V · A · L de un jugador y su suma (al menos 1, para repartir la barra). */
export function varkScores(entry: VarkEntry) {
  const scores: [string, number | null][] = [['Visual', entry.visual_score], ['Auditivo', entry.auditory_score], ['Lector/Escritor', entry.reading_score]]
  const total = scores.reduce((a, [, v]) => a + (v ?? 0), 0) || 1
  return { scores, total }
}
