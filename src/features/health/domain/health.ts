import type { HealthDto, MinuteTrafficDto } from '@/shared/api/types'

export type Health = HealthDto

/** 93784 → "1 d 2 h", 3661 → "1 h 1 min", 90 → "1 min", null → "—" */
export function formatUptime(seconds: number | null | undefined): string {
  if (seconds == null) return '—'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return d ? `${d} d ${h} h` : h ? `${h} h ${m} min` : `${m} min`
}

/** Semáforo de latencia: verde < 300 ms, amarillo < 1 s, rojo de ahí para arriba. */
export function latencyTone(ms: number | null | undefined): string {
  if (ms == null) return 'var(--status-neutral)'
  if (ms < 300) return 'var(--status-good)'
  if (ms < 1000) return 'var(--status-warning)'
  return 'var(--status-critical)'
}

export const errorRatePct = (requests: number | undefined, errors: number | undefined): number =>
  (requests ? ((errors ?? 0) / requests) * 100 : 0)

/**
 * Serie de minutos sin huecos: la API solo manda los minutos con tráfico. `until` es el instante
 * de referencia (dataUpdatedAt); el minuto final se trunca a su propio minuto.
 */
export function fillMinutes(data: MinuteTrafficDto[], minutes: number, until: number): MinuteTrafficDto[] {
  const byMinute = new Map(data.map(d => [new Date(d.minute).getTime(), d]))
  const last = Math.floor(until / 60000) * 60000
  return Array.from({ length: minutes }, (_, i) => {
    const t = last - (minutes - 1 - i) * 60000
    return byMinute.get(t) ?? { minute: new Date(t).toISOString(), requests: 0, errors: 0 }
  })
}
