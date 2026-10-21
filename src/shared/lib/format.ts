// Formatos en español (Colombia) sin reglas de negocio. Lo que no hay se muestra como '—'.

const isMissing = (v: number | null | undefined): v is null | undefined => v == null || Number.isNaN(v)

/** 154321 → "2:34" */
export function formatDuration(ms: number | null | undefined): string {
  if (isMissing(ms)) return '—'
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

/** 8123 → "8,1 s" */
export function formatSeconds(ms: number | null | undefined, digits = 1): string {
  if (isMissing(ms)) return '—'
  return `${(ms / 1000).toLocaleString('es-CO', { maximumFractionDigits: digits, minimumFractionDigits: digits })} s`
}

export const formatPct = (v: number | null | undefined): string => (isMissing(v) ? '—' : `${Math.round(v)}%`)

export const formatNumber = (v: number | null | undefined, digits = 0): string =>
  isMissing(v) ? '—' : Number(v).toLocaleString('es-CO', { maximumFractionDigits: digits })

export const ordinal = (n: number): string => `${n}.º`

/** 3 → "3 veces", 1 → "1 vez" */
export const times = (n: number): string => `${n} ${n === 1 ? 'vez' : 'veces'}`

export interface NamedPerson {
  first_name?: string | null
  last_name?: string | null
  username?: string | null
}

export const fullName = (u: NamedPerson | null | undefined): string =>
  [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.username || '—'

export const initials = (u: NamedPerson | null | undefined, empty = '?'): string =>
  [u?.first_name?.[0], u?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || empty

/** Texto sin tildes, en minúsculas y sin espacios en los extremos (búsquedas). */
export const normalizeText = (t: unknown): string =>
  String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** "lunes 20 de octubre" → "Lunes 20 de octubre" */
export const capitalize = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s)

/** Minutos entre dos fechas (redondeado), o null si falta alguna. */
export function minutesBetween(from: string | null | undefined, to: string | Date | null | undefined): number | null {
  if (!from || !to) return null
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000)
}

/** 1572864 → "1.5 MB", 300 → "1 KB" */
export const formatBytes = (b: number | null | undefined): string =>
  (b == null || Number.isNaN(b) ? '—' : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
