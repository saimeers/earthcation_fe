import {
  Trophy, TrendingUp, LifeBuoy, CircleDashed, CheckCircle2, XCircle, Undo2, Loader, FlaskConical, Mountain,
  PersonStanding, Lightbulb, Bug, Zap, ShieldAlert, AlertTriangle, Skull, ShieldCheck, Users, Target, Repeat,
  Timer, Gauge, BookOpen, type LucideIcon,
} from 'lucide-react'
import { STATUS_COLOR } from '@/shared/lib/color'
import type { Segment } from '@/shared/ui/data/StackedBar'
import { BANDS, BAND_ORDER, type PerformanceBand } from '../domain/bands'
import { FINISHED_OUTCOMES, OUTCOMES, type AttemptOutcome } from '../domain/telemetry'
import type { InsightIcon } from '../domain/insights'
import type { SessionStatus } from '../domain/sessions'

// Íconos y colores de las escalas del dominio. El color nunca va solo: siempre ícono + texto.

const BAND_ICONS: Record<PerformanceBand, LucideIcon> = {
  destacado: Trophy, en_progreso: TrendingUp, refuerzo: LifeBuoy, sin_datos: CircleDashed,
}

export const bandMeta = (band: PerformanceBand | null | undefined) => {
  const key = band && BANDS[band] ? band : 'sin_datos'
  return { ...BANDS[key], icon: BAND_ICONS[key], color: STATUS_COLOR[BANDS[key].tone] }
}

export const bandSegments = (counts: Record<PerformanceBand, number>): Segment<PerformanceBand>[] =>
  BAND_ORDER.map(k => ({ key: k, label: BANDS[k].label, value: counts[k], color: bandMeta(k).color, icon: BAND_ICONS[k] }))

const OUTCOME_STYLE: Record<AttemptOutcome, { icon: LucideIcon, color: string }> = {
  completed: { icon: CheckCircle2, color: STATUS_COLOR.good },
  failed: { icon: XCircle, color: STATUS_COLOR.critical },
  abandoned: { icon: Undo2, color: STATUS_COLOR.warning },
  in_progress: { icon: Loader, color: STATUS_COLOR.neutral },
}

export const outcomeMeta = (outcome: string | null | undefined) => {
  const key: AttemptOutcome = outcome && outcome in OUTCOME_STYLE ? outcome as AttemptOutcome : 'in_progress'
  return { label: OUTCOMES[key], ...OUTCOME_STYLE[key] }
}

/** Segmentos completados / fallidos / abandonados de un nivel. */
export const outcomeSegments = (counts: Partial<Record<AttemptOutcome, number>>): Segment<AttemptOutcome>[] =>
  FINISHED_OUTCOMES.map(k => ({ key: k, label: OUTCOMES[k], value: counts[k] ?? 0, color: OUTCOME_STYLE[k].color, icon: OUTCOME_STYLE[k].icon }))

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'químico': FlaskConical, 'mecánico': Mountain, 'geomecánico': Mountain, 'ergonómico': PersonStanding,
  'físico': Lightbulb, 'biológico': Bug, 'eléctrico': Zap,
}
export const categoryIcon = (category: string | null | undefined): LucideIcon =>
  CATEGORY_ICONS[String(category ?? '').toLowerCase()] ?? ShieldAlert

export const INSIGHT_ICONS: Record<InsightIcon, LucideIcon> = {
  hardest_risk: AlertTriangle, fail_cause: Skull, needs_help: LifeBuoy, nobody_behind: ShieldCheck, best: Trophy,
  waiting: Users, strength: ShieldCheck, weakness: Target, retries: Repeat, reaction: Timer, detector: Gauge, reading: BookOpen,
}

export const SESSION_STATUS: Record<SessionStatus, { label: string, color: string }> = {
  waiting: { label: 'Esperando participantes', color: STATUS_COLOR.neutral },
  active: { label: 'En curso', color: STATUS_COLOR.good },
  finished: { label: 'Finalizada', color: 'var(--primary)' },
}

export const SESSION_BADGE: Record<SessionStatus, { label: string, variant: 'secondary' | 'default' | 'outline' }> = {
  waiting: { label: 'En espera', variant: 'secondary' },
  active: { label: 'Activa', variant: 'default' },
  finished: { label: 'Finalizada', variant: 'outline' },
}
