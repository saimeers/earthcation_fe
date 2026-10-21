// Etiquetas en español de los datos de telemetría del juego (catálogo en earthcation_be/docs/TELEMETRY.md).
// Nunca mostrar claves crudas como "Methane1" en la UI.
import type { AttemptOutcome, AttemptSummaryDto, GameEventDto } from '@/shared/api/types'
import { formatDuration, formatSeconds } from '@/shared/lib/format'

export type Attempt = AttemptSummaryDto
export type GameEvent = GameEventDto
export type { AttemptOutcome }

// Retos de transición (GC-05 memoria, GC-07 reacción): intentos propios, sin número de nivel
export const CHALLENGES: Record<string, string> = {
  reto_reaccion: 'Reto de reacción',
  reto_memoria: 'Reto de memoria',
}
export const isChallenge = (key: string | null | undefined): boolean => String(key ?? '').startsWith('reto_')

export function levelLabel(key: string | null | undefined): string {
  if (key && CHALLENGES[key]) return CHALLENGES[key]
  const n = String(key ?? '').replace(/\D/g, '')
  return n ? `Nivel ${n}` : (key ?? '—')
}

/** "level2" → "2" (columna compacta de la tabla de participantes). */
export const levelNumber = (key: string): string => levelLabel(key).replace(/\D/g, '')

export const FAIL_REASONS: Record<string, string> = {
  derrumbe: 'Derrumbe',
  intoxicacion_metano: 'Intoxicación por metano',
  mordedura_ofidio: 'Mordedura de serpiente',
  infeccion_por_hongos: 'Infección por hongos',
  lesion_por_fatiga: 'Lesión por fatiga',
  impacto_proyeccion: 'Impacto por proyección de fragmentos',
  fatiga: 'Lesión por fatiga',
  desconocido: 'Causa desconocida',
}
export const failReasonLabel = (r: string | null | undefined): string => (r ? FAIL_REASONS[r] ?? r : '—')

export const OUTCOMES: Record<AttemptOutcome, string> = {
  completed: 'Completado',
  failed: 'Fallido',
  abandoned: 'Abandonado',
  in_progress: 'En curso',
}
/** Resultados que se dibujan en las barras de "cómo terminan los intentos". */
export const FINISHED_OUTCOMES = ['completed', 'failed', 'abandoned'] as const satisfies readonly AttemptOutcome[]
export const outcomeLabel = (o: string | null | undefined): string => OUTCOMES[o as AttemptOutcome] ?? OUTCOMES.in_progress

const STAGE_PREFIXES: [string, string][] = [
  ['PickingMuro', 'Picando muro'],
  ['WagonToSurface', 'Vagón a superficie'],
  ['PlacingSupport', 'Colocando sostenimiento'],
  ['WagonReturning', 'Vagón de regreso'],
  ['Support', 'Sostenimiento'],
  ['Methane', 'Metano'],
  ['Hazard', 'Riesgo biológico'],
]
export function stageLabel(stage: string | null | undefined): string {
  if (!stage) return '—'
  for (const [prefix, label] of STAGE_PREFIXES) {
    if (stage.startsWith(prefix)) return `${label} ${stage.slice(prefix.length)}`.trim()
  }
  return stage
}

// Etapas en orden, para dibujar el recorrido de cada nivel
export const LEVEL_STAGES: Record<string, string[]> = {
  level1: ['PickingMuro1', 'WagonToSurface1', 'PlacingSupport1', 'WagonReturning1', 'PickingMuro2',
    'WagonToSurface2', 'PlacingSupport2', 'WagonReturning2', 'PickingMuro3', 'WagonToSurface3'],
  level2: ['PickingMuro1', 'WagonToSurface1', 'Support1', 'Methane1', 'Hazard1', 'WagonReturning1',
    'PickingMuro2', 'WagonToSurface2', 'Support2', 'Methane2', 'Hazard2', 'WagonReturning2',
    'PickingMuro3', 'WagonToSurface3'],
}

// Contadores del `summary` de cada intento
export const SUMMARY_COUNTERS: Record<string, string> = {
  coal_collected: 'Carbón recolectado',
  fatigue_injuries: 'Lesiones por fatiga',
  hose_dodged: 'Manguera esquivada',
  hose_hit: 'Impactos de la manguera',
  challenge_passed: 'Rondas superadas',
  challenge_failed: 'Rondas no superadas',
  lantern_warnings: 'Advertencias de linterna',
  device_opened: 'Veces que abrió el detector',
  device_closed: 'Veces que cerró el detector',
  device_powered_on: 'Veces que encendió el detector',
  device_powered_off: 'Veces que apagó el detector',
  lantern_switched_on: 'Veces que encendió la linterna',
  lantern_switched_off: 'Veces que apagó la linterna',
  calibrations_valid: 'Calibraciones válidas',
  calibrations_invalid: 'Calibraciones fuera de zona segura',
  exits_uncalibrated: 'Avanzó sin calibrar',
  damage_methane: 'Vida perdida por metano',
  damage_biohazard: 'Vida perdida por riesgo biológico',
}

/** Contadores presentes en el resumen de un participante, en el orden del catálogo. */
export const presentCounters = (counters: Record<string, number | null> | null | undefined): [string, string][] =>
  Object.entries(SUMMARY_COUNTERS).filter(([k]) => counters?.[k] != null)

const kindLabel = (k: unknown): string => ({ ofidio: 'una serpiente', hongo: 'hongos' } as Record<string, string>)[String(k)] ?? 'un riesgo biológico'

const num = (v: unknown): number | null => (typeof v === 'number' ? v : null)

type Payload = Record<string, unknown>

// Resumen de una ronda de reto según su tipo (stage = Reaccion / Memoria)
export function describeChallengeRound(kind: string | null | undefined, p: Payload = {}): string {
  const res = p.passed ? 'superada' : 'no superada'
  if (kind === 'Reaccion')
    return `Ronda ${res}: reacción media ${p.avg_ms ?? '?'} ms (mejor ${p.best_ms ?? '?'} ms), ${p.false_alarms ?? 0} falsas alarmas, ${p.misses ?? 0} omisiones`
  if (kind === 'Memoria')
    return `Ronda ${res}: secuencia máxima de ${p.max_length ?? 0}, precisión ${p.precision ?? 0} %, ${p.errors ?? 0} errores`
  return `Ronda de reto ${res}`
}

type EventDescriber = (e: GameEvent, p: Payload) => string

const EVENT_TEXT: Record<string, EventDescriber> = {
  level_start: (_, p) => `Inicia el nivel${p.gas_brand ? ` con detector ${String(p.gas_brand)}` : ''}`,
  stage_enter: (e) => `Entra a la etapa «${stageLabel(e.stage)}»`,
  risk_info_shown: (e) => `Abre el panel informativo ${e.risk_id ? `de ${e.risk_id}` : ''}`.trim(),
  risk_info_closed: (_, p) => `Cierra el panel tras leerlo ${formatSeconds(num(p.read_ms))}${p.audio_finished ? ' (escuchó el audio completo)' : ''}`,
  risk_mitigated: (e, p) => `Mitiga ${e.risk_id ?? 'el riesgo'}${p.reaction_ms ? ` en ${formatSeconds(num(p.reaction_ms))}` : ''}`,
  risk_failed: (e, p) => `Falla ${e.risk_id ?? 'el riesgo'}${p.mistakes ? ` (${String(p.mistakes)} errores)` : ''}`,
  wall_broken: () => 'Termina de picar el muro',
  stone_broken: () => 'Rompe la roca',
  coal_collected: () => 'Recoge el carbón',
  wagon_sent: (_, p) => (p.to_surface === false ? 'Envía el vagón de regreso' : 'Envía el vagón a superficie'),
  wagon_arrived: () => 'Llega el vagón',
  fatigue_injury: () => 'Se lesiona por fatiga al picar sin descanso',
  qte_hose_dodged: (_, p) => `Se aparta de la manguera suelta a tiempo${p.reaction_ms ? ` (${formatSeconds(num(p.reaction_ms))})` : ''}`,
  challenge_round: (e, p) => describeChallengeRound(e.stage, p),
  qte_hose_hit: () => 'No se aparta: lo alcanzan los fragmentos de la manguera suelta',
  support_prompt: (_, p) => `Aparece la orden de sostenimiento (${String(p.timeout_s ?? '?')} s para reaccionar)`,
  support_placed: (_, p) => `Coloca el sostenimiento a tiempo${p.reaction_ms ? ` (${formatSeconds(num(p.reaction_ms))})` : ''}`,
  collapse: () => 'Se acaba el tiempo: derrumbe',
  player_death: (_, p) => `Muere: ${failReasonLabel(p.cause as string | null)}`,
  level_complete: () => 'Completa el nivel',
  level_failed: (_, p) => `Pierde el nivel${p.fail_reason ? `: ${failReasonLabel(String(p.fail_reason))}` : ''}`,
  level_abandoned: () => 'Abandona el nivel',
  lantern_warning: () => 'Avanza con la linterna apagada (advertencia)',
  lantern_on: (_, p) => (p.after_warning ? 'Enciende la linterna después de la advertencia' : 'Enciende la linterna a tiempo'),
  device_opened: () => 'Abre el detector de gases',
  device_closed: () => 'Cierra el detector de gases',
  device_powered_off: () => 'Apaga el detector',
  lantern_toggled: (_, p) => (p.on ? 'Enciende la linterna' : 'Apaga la linterna'),
  device_powered_on: (_, p) => `Enciende el detector${p.in_safe_zone === false ? ' fuera de la zona segura' : ''}`,
  device_calibrated: (_, p) => (p.valid === false ? 'Calibra el detector fuera de la zona segura' : 'Calibra el detector correctamente'),
  safe_zone_enter: () => 'Entra a la zona segura',
  safe_zone_exit: (_, p) => `Sale de la zona segura${p.calibrated === false ? ' sin calibrar' : ''}`,
  methane_start: () => 'Empieza a subir el metano',
  gas_alarm: (_, p) => `Suena la alarma de gas (${String(p.reading_lel ?? '?')}% LEL)`,
  methane_evacuated: (_, p) => `Evacúa a la zona segura${p.reaction_ms ? ` en ${formatSeconds(num(p.reaction_ms))}` : ''}`,
  biohazard_warned: (_, p) => `Detecta ${kindLabel(p.kind)} en la vía`,
  biohazard_contact: (_, p) => `Contacto con ${kindLabel(p.kind)}`,
  biohazard_reported: (_, p) => `Reporta ${kindLabel(p.kind)} sin contacto`,
  biohazard_treated: (_, p) => `Recibe tratamiento tras contacto con ${kindLabel(p.kind)}`,
}

/** Texto legible para cada evento del juego (línea de tiempo de un intento). */
export function describeEvent(e: GameEvent): string {
  const describe = EVENT_TEXT[e.event_type]
  return describe ? describe(e, e.payload ?? {}) : e.event_type
}

export type EventTone = 'good' | 'bad' | 'warn' | 'info'

const GOOD_EVENTS = ['level_complete', 'support_placed', 'methane_evacuated', 'biohazard_reported', 'lantern_on', 'risk_mitigated', 'coal_collected', 'qte_hose_dodged']
const BAD_EVENTS = ['player_death', 'collapse', 'level_failed', 'risk_failed', 'biohazard_contact', 'fatigue_injury', 'qte_hose_hit']
const WARN_EVENTS = ['gas_alarm', 'methane_start', 'lantern_warning', 'support_prompt', 'biohazard_warned', 'level_abandoned']

/** Tono de cada evento: acción correcta, error o daño, alerta o informativo. */
export function eventTone(type: string, payload?: Payload | null): EventTone {
  if (GOOD_EVENTS.includes(type)) return 'good'
  if (type === 'challenge_round') return payload?.passed ? 'good' : 'bad'
  if (BAD_EVENTS.includes(type)) return 'bad'
  if (WARN_EVENTS.includes(type)) return 'warn'
  return 'info'
}

/** Resumen de un intento para el tooltip de la tabla: "Intento 2: Fallido · Derrumbe en «…» · 1:30". */
export function attemptText(a: Attempt): string {
  const parts = [`Intento ${a.attempt_number}: ${outcomeLabel(a.outcome)}`]
  if (a.outcome === 'failed') parts.push(`${failReasonLabel(a.fail_reason)} en «${stageLabel(a.fail_stage)}»`)
  if (a.outcome === 'abandoned' && a.fail_stage) parts.push(`en «${stageLabel(a.fail_stage)}»`)
  if (a.duration_ms) parts.push(formatDuration(a.duration_ms))
  return parts.join(' · ')
}
