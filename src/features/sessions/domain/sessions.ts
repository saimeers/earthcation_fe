import type {
  FailReasonDto, SessionDto, SessionLevelDto, SessionParticipantDto, SessionStatus, TelemetryOverviewDto,
} from '@/shared/api/types'
import { fullName, minutesBetween } from '@/shared/lib/format'
import type { PerformanceBand } from './bands'
import { failReasonLabel, levelLabel, stageLabel, type Attempt } from './telemetry'

export type Session = SessionDto
export type Participant = SessionParticipantDto
export type { SessionStatus }

// ── Lista de sesiones ───────────────────────────────────────────────────────

export type StatusFilter = 'all' | SessionStatus

export interface SessionFilters {
  search: string
  status: StatusFilter
  locationId: string
}

/** Búsqueda por nombre, código o instructor + estado + localidad ('all' = sin filtro). */
export const filterSessions = (sessions: Session[], { search, status, locationId }: SessionFilters): Session[] =>
  sessions.filter(s => {
    const text = `${s.name} ${s.code} ${s.instructor?.first_name ?? ''} ${s.instructor?.last_name ?? ''}`.toLowerCase()
    const location = s.location_id || s.location?.id
    return text.includes(search.toLowerCase())
      && (status === 'all' || s.status === status)
      && (locationId === 'all' || location === locationId)
  })

/** Minutos que duró (o lleva) la sesión. `now` solo cuenta si la sesión sigue abierta. */
export const sessionDuration = (s: Session | null | undefined, now?: Date): number | null =>
  (s?.started_at ? minutesBetween(s.started_at, s.ended_at ?? now ?? null) : null)

/** Iniciar/finalizar solo aplica a salas con código (el "Juego libre" está siempre abierto). */
export const canStart = (s: Session | null | undefined): boolean => !!s && !s.is_free_play && s.status === 'waiting'
export const canEnd = (s: Session | null | undefined): boolean => !!s && !s.is_free_play && s.status === 'active'
/** El QR de la sala se ofrece mientras la sala con código no haya terminado. */
export const showsRoomQr = (s: Session): boolean => !s.is_free_play && s.status !== 'finished'

/** Nombre del Excel exportado: sesion-<código>-<AAAA-MM-DD>.xlsx */
export const exportFileName = (codeOrId: string, today: Date): string =>
  `sesion-${codeOrId}-${today.toISOString().slice(0, 10)}.xlsx`

// ── Participantes ───────────────────────────────────────────────────────────

const NO_DATA = 101
export const PARTICIPANT_SORTS = {
  pct_desc: { label: 'Mayor mitigación', compare: (a: Participant, b: Participant) => b.percentage - a.percentage },
  pct_asc: { label: 'Menor mitigación', compare: (a: Participant, b: Participant) => (a.total_attempts ? a.percentage : NO_DATA) - (b.total_attempts ? b.percentage : NO_DATA) },
  name: { label: 'Nombre (A–Z)', compare: (a: Participant, b: Participant) => fullName(a.user).localeCompare(fullName(b.user)) },
  reaction: { label: 'Reacción más rápida', compare: (a: Participant, b: Participant) => (a.avg_reaction_ms ?? 1e12) - (b.avg_reaction_ms ?? 1e12) },
  attempts: { label: 'Más intentos', compare: (a: Participant, b: Participant) => b.telemetry.attempts - a.telemetry.attempts },
} as const

export type ParticipantSort = keyof typeof PARTICIPANT_SORTS

export interface ParticipantFilters {
  search: string
  band: PerformanceBand | null
  sort: ParticipantSort
}

/** Filtra por banda y por nombre, cédula u organización, y ordena. */
export function filterParticipants(list: Participant[], { search, band, sort }: ParticipantFilters): Participant[] {
  const q = search.trim().toLowerCase()
  return list
    .filter(p => !band || p.band === band)
    .filter(p => !q || `${fullName(p.user)} ${p.user.cedula} ${p.organization ?? ''}`.toLowerCase().includes(q))
    .sort(PARTICIPANT_SORTS[sort].compare)
}

/** Para el informe: del mayor al menor % mitigado. */
export const rankParticipants = (list: Participant[]): Participant[] => [...list].sort((a, b) => b.percentage - a.percentage)

// ── Telemetría de la sesión ────────────────────────────────────────────────

export interface CountItem { key: string, label: string, value: number }

/** Etapas donde más intentos terminan (fallo o abandono), las 8 primeras. */
export const stageFailItems = (levels: SessionLevelDto[]): CountItem[] =>
  levels.flatMap(l => Object.entries(l.fail_stages ?? {}).map(([stage, count]) => ({
    key: `${l.level_key}-${stage}`, label: `${levelLabel(l.level_key)} · ${stageLabel(stage)}`, value: count,
  }))).sort((a, b) => b.value - a.value).slice(0, 8)

/** Total de intentos perdidos por cada causa, de la más a la menos frecuente. */
export function failReasonItems(failReasons: Pick<FailReasonDto, 'fail_reason' | 'count'>[]): CountItem[] {
  const totals: Record<string, number> = {}
  failReasons.forEach(f => { totals[f.fail_reason] = (totals[f.fail_reason] || 0) + f.count })
  return Object.entries(totals).map(([k, v]) => ({ key: k, label: failReasonLabel(k), value: v })).sort((a, b) => b.value - a.value)
}

const EVENT_LABELS: Record<string, string> = {
  device_opened: 'Abrió el detector', fatigue_injury: 'Lesiones por fatiga', risk_info_shown: 'Paneles informativos abiertos',
  gas_alarm: 'Alarmas de gas', biohazard_contact: 'Contactos con riesgo biológico', lantern_warning: 'Advertencias de linterna',
  support_placed: 'Sostenimientos colocados a tiempo', collapse: 'Derrumbes', methane_evacuated: 'Evacuaciones por metano',
  player_death: 'Muertes',
}

/** Eventos más frecuentes de la sesión (solo los que tienen etiqueta), los 8 primeros. */
export const eventCountItems = (overview: Pick<TelemetryOverviewDto, 'event_counts'> | undefined): CountItem[] =>
  (overview?.event_counts ?? [])
    .filter(e => EVENT_LABELS[e.event_type])
    .map(e => ({ key: e.event_type, label: EVENT_LABELS[e.event_type], value: e.count }))
    .slice(0, 8)

/** % de intentos que calibraron el detector, por marca. */
export const gasBrandItems = (overview: Pick<TelemetryOverviewDto, 'gas_brands'> | undefined) =>
  (overview?.gas_brands ?? []).map(b => ({
    key: b.gas_brand, label: b.gas_brand, value: b.attempts ? Math.round((b.calibrated / b.attempts) * 100) : 0, sub: `${b.calibrated}/${b.attempts} calibrados`,
  }))

// ── Análisis de un participante ────────────────────────────────────────────

/** Intentos agrupados por nivel o reto, en el orden en que llegaron. */
export function attemptsByLevel(attempts: Attempt[]): Record<string, Attempt[]> {
  const out: Record<string, Attempt[]> = {}
  attempts.forEach(a => { (out[a.level_key] ||= []).push(a) })
  return out
}

/** Intento a repetir: el elegido si sigue existiendo, si no el último. */
export const selectedAttemptId = (attempts: Attempt[], chosen: string | null): string | null =>
  (chosen && attempts.some(a => a.id === chosen) ? chosen : attempts.at(-1)?.id ?? null)

/** Cuántas veces terminó un intento en cada etapa (sin contar los completados). */
export function failCountsByStage(attempts: Attempt[]): Record<string, number> {
  const counts: Record<string, number> = {}
  attempts.forEach(a => { if (a.fail_stage && a.outcome !== 'completed') counts[a.fail_stage] = (counts[a.fail_stage] || 0) + 1 })
  return counts
}

/** Resumen de un reto de transición: superados y el último intento. */
export function challengeSummary(list: Attempt[]) {
  const last = list[list.length - 1]
  return {
    passed: list.filter(a => a.outcome === 'completed').length,
    total: list.length,
    last,
    lastText: last?.outcome === 'completed' ? 'superado' : last?.outcome === 'failed' ? 'no superado' : 'sin terminar',
  }
}
