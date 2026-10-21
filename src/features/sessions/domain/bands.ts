import type { PerformanceBand } from '@/shared/api/types'
import type { StatusTone } from '@/shared/lib/color'

export type { PerformanceBand }

// Una sola escala de desempeño para toda la app (tabla, matriz, análisis, informe y Excel), con los
// mismos cortes que el backend (session.service.js#performanceBand): 80% y 40%.
export const BAND_ORDER: readonly PerformanceBand[] = ['destacado', 'en_progreso', 'refuerzo', 'sin_datos']

export const BANDS: Record<PerformanceBand, { label: string, short: string, hint: string, tone: StatusTone }> = {
  destacado: { label: 'Destacado', short: 'Destacado', hint: '80% o más de riesgos mitigados', tone: 'good' },
  en_progreso: { label: 'En progreso', short: 'En progreso', hint: 'Entre 40% y 79% de riesgos mitigados', tone: 'warning' },
  refuerzo: { label: 'Necesita refuerzo', short: 'Refuerzo', hint: 'Menos del 40% de riesgos mitigados', tone: 'critical' },
  sin_datos: { label: 'Sin datos', short: 'Sin datos', hint: 'Aún no tiene resultados en esta sesión', tone: 'neutral' },
}

/** Banda de un % de riesgos mitigados. */
export function bandFor(percentage: number, hasData = true): PerformanceBand {
  if (!hasData) return 'sin_datos'
  if (percentage >= 80) return 'destacado'
  if (percentage >= 40) return 'en_progreso'
  return 'refuerzo'
}

/** Banda del promedio de un grupo (null = sin datos). */
export const bandForAverage = (avg: number | null | undefined): PerformanceBand =>
  (avg == null ? 'sin_datos' : bandFor(avg))

/** Tono de un % de dominio de riesgo (mismos cortes que las bandas). */
export const rateTone = (rate: number | null | undefined): StatusTone =>
  (rate == null ? 'neutral' : BANDS[bandFor(rate)].tone)

/** Leyenda de la matriz de riesgos: tono y texto de cada tramo. */
export const RATE_LEGEND: readonly [StatusTone, string][] = [
  ['good', '80% o más'],
  ['warning', '40–79%'],
  ['critical', 'Menos de 40%'],
]
