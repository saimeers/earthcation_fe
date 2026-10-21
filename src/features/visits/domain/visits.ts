import type { PlaceCountDto, VisitStatsDto } from '@/shared/api/types'

export type Visits = VisitStatsDto
export type DailyVisits = VisitStatsDto['per_day'][number]

export const DEVICE_LABEL: Record<string, string> = { mobile: 'Celular', tablet: 'Tableta', desktop: 'Computador' }
export const ROLE_LABEL: Record<string, string> = { player: 'Jugadores', instructor: 'Instructores', admin: 'Administradores', developer: 'Soporte' }

const countryNames = new Intl.DisplayNames(['es'], { type: 'region' })

/** Nombre del país en español ("CO" → "Colombia"); si el código no es válido se devuelve tal cual. */
export function countryName(code: string): string {
  try {
    return countryNames.of(code) ?? code
  } catch {
    return code
  }
}

/** "Norte de Santander (Venezuela)" — el país solo se muestra si no es Colombia. */
export const placeLabel = (p: PlaceCountDto): string => `${p.region}${p.country && p.country !== 'CO' ? ` (${countryName(p.country)})` : ''}`

export const pct = (n: number, total: number): string => (total ? `${Math.round((n / total) * 100)}%` : '')

export const sumCount = (list: { count: number }[]): number => list.reduce((s, i) => s + i.count, 0)

/**
 * Serie de días sin huecos (los días sin visitas no vienen de la API). `since` es el primer día
 * del rango; se agrupa en la zona horaria de Colombia, igual que la API.
 */
export function fillDays(data: DailyVisits[], days: number, since: string): DailyVisits[] {
  const byDay = new Map(data.map(d => [d.day, d]))
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(new Date(since).getTime() + (i + 1) * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
    return byDay.get(day) ?? { day, visits: 0, unique: 0 }
  })
}
