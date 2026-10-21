import { eventTone, type GameEvent } from './telemetry'

export interface PlottedEvent extends GameEvent { t_ms: number, health: number }
export interface StageBand { stage: string | null, from: number, to: number }

const isPlotted = (e: GameEvent): e is PlottedEvent => e.health != null && e.t_ms != null

/**
 * Repetición de un intento: puntos de vida en el tiempo, bandas por etapa (de la entrada a una etapa
 * hasta la siguiente o el último evento) y marcas en los eventos que no son informativos.
 */
export function replaySeries(events: GameEvent[]) {
  const points = events.filter(isPlotted)
  const lastT = events.at(-1)?.t_ms
  const stages: StageBand[] = events
    .filter(e => e.event_type === 'stage_enter')
    .map((e, i, arr) => ({ stage: e.stage, from: e.t_ms ?? 0, to: arr[i + 1]?.t_ms ?? lastT ?? e.t_ms ?? 0 }))
  const marks = points.filter(e => eventTone(e.event_type, e.payload) !== 'info')
  return { points, stages, marks, feed: events }
}
