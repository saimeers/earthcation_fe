import type { IsoDate, Uuid } from './common'

export interface PlaceCountDto { country: string | null, region: string, count: number }
export interface CityCountDto extends PlaceCountDto { city: string, lat?: number | null, lng?: number | null }
export interface KeyCountDto { key: string, count: number }

/** GET /api/v1/visits/stats?days= */
export interface VisitStatsDto {
  days: number
  since: IsoDate
  totals: { visits: number, unique: number, visitors: number, via_qr: number, bots?: number }
  per_day: { day: string, visits: number, unique: number }[]
  regions: PlaceCountDto[]
  cities: CityCountDto[]
  countries: KeyCountDto[]
  devices: KeyCountDto[]
  os: KeyCountDto[]
  browsers: KeyCountDto[]
  versions: { id: Uuid, label: string, count: number }[]
  logins: {
    by_role: { role: string, count: number, users: number }[]
    regions: PlaceCountDto[]
    devices: KeyCountDto[]
  }
}
