import {
  Trophy, TrendingUp, LifeBuoy, CircleDashed, CheckCircle2, XCircle, Undo2, Loader,
  FlaskConical, Mountain, PersonStanding, Lightbulb, Bug, Zap, ShieldAlert,
} from 'lucide-react'

// Una sola escala de desempeño para toda la app (tabla, matriz, análisis, informe y Excel).
// El color nunca va solo: siempre ícono + texto.
export const BAND_META = {
  destacado:   { label: 'Destacado',         short: 'Destacado',  icon: Trophy,       color: 'var(--status-good)',     hint: '80% o más de riesgos mitigados' },
  en_progreso: { label: 'En progreso',       short: 'En progreso', icon: TrendingUp,  color: 'var(--status-warning)',  hint: 'Entre 40% y 79% de riesgos mitigados' },
  refuerzo:    { label: 'Necesita refuerzo', short: 'Refuerzo',   icon: LifeBuoy,     color: 'var(--status-critical)', hint: 'Menos del 40% de riesgos mitigados' },
  sin_datos:   { label: 'Sin datos',         short: 'Sin datos',  icon: CircleDashed, color: 'var(--status-neutral)',  hint: 'Aún no tiene resultados en esta sesión' },
}
export const BAND_ORDER = ['destacado', 'en_progreso', 'refuerzo', 'sin_datos']

export const OUTCOME_META = {
  completed:   { label: 'Completado', icon: CheckCircle2, color: 'var(--status-good)' },
  failed:      { label: 'Fallido',    icon: XCircle,      color: 'var(--status-critical)' },
  abandoned:   { label: 'Abandonado', icon: Undo2,        color: 'var(--status-warning)' },
  in_progress: { label: 'En curso',   icon: Loader,       color: 'var(--status-neutral)' },
}

// Tono de un % de dominio de riesgo (mismos cortes que las bandas)
export function rateTone(rate) {
  if (rate == null) return 'var(--status-neutral)'
  if (rate >= 80) return 'var(--status-good)'
  if (rate >= 40) return 'var(--status-warning)'
  return 'var(--status-critical)'
}

// Fondo suave a partir de un color de estado
export const tintBg = (color, pct = 14) => `color-mix(in oklab, ${color} ${pct}%, transparent)`

const CATEGORY_ICONS = {
  'químico': FlaskConical, 'mecánico': Mountain, 'geomecánico': Mountain, 'ergonómico': PersonStanding,
  'físico': Lightbulb, 'biológico': Bug, 'eléctrico': Zap,
}
export const categoryIcon = (category) => CATEGORY_ICONS[String(category ?? '').toLowerCase()] ?? ShieldAlert
