import type { MultiPolygon, Polygon, Position } from 'geojson'
import type { MineDto } from '@/shared/api/types'

// Geometría y emparejamiento del mapa de unidades mineras. Sin teselas: solo los polígonos de los
// departamentos (DANE/MGN) y un punto por municipio con minas.

export type Mine = MineDto
export type LatLng = [number, number]
type Ring = Position[]

// Nombre de departamento normalizado: sin tildes, en mayúsculas y con espacios simples
export const normalizeDept = (text: unknown): string =>
  String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim()

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array<number>(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

// Variantes reales que trae la BD (typos históricos incluidos, ver CLAUDE.md del backend)
const DEPT_ALIASES: Record<string, string> = {
  [normalizeDept('Bogota D.C.')]: normalizeDept('BOGOTA, D.C.'),
  [normalizeDept('Bogota')]: normalizeDept('BOGOTA, D.C.'),
  [normalizeDept('San Andres y Providencia')]: normalizeDept('ARCHIPIELAGO DE SAN ANDRES, PROVIDENCIA Y SANTA CATALINA'),
}

/** Departamento del GeoJSON que corresponde al de la BD (tolerancia de 3 letras para typos). */
export function matchDept(orgDept: string, geoDeptNames: string[]): string | null {
  const norm = DEPT_ALIASES[normalizeDept(orgDept)] ?? normalizeDept(orgDept)
  let best: string | null = null, bestDist = Infinity
  for (const geoName of geoDeptNames) {
    const geoNorm = normalizeDept(geoName)
    if (geoNorm === norm) return geoName
    const dist = levenshtein(norm, geoNorm)
    if (dist < bestDist) { bestDist = dist; best = geoName }
  }
  return bestDist <= 3 ? best : null
}

function ringArea(ring: Ring): number {
  let a = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
  return a / 2
}

/** Anillo exterior más grande del departamento (las islas/enclaves no deben mover el ancla). */
export function largestRing(geometry: Polygon | MultiPolygon): Ring | null {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  let best: Ring | null = null, bestArea = -1
  polys.forEach(poly => {
    const a = Math.abs(ringArea(poly[0]))
    if (a > bestArea) { bestArea = a; best = poly[0] }
  })
  return best
}

function ringCentroid(ring: Ring): LatLng {
  let x = 0, y = 0, a = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
    x += (ring[j][0] + ring[i][0]) * f
    y += (ring[j][1] + ring[i][1]) * f
    a += f
  }
  a /= 2
  return [y / (6 * a), x / (6 * a)]
}

export function insideRing([lat, lng]: LatLng, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j]
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** Centroide por área; si cae fuera (departamentos cóncavos), el punto interior más cercano a él. */
export function anchorFor(geometry: Polygon | MultiPolygon): LatLng | null {
  const ring = largestRing(geometry)
  if (!ring) return null
  const c = ringCentroid(ring)
  if (insideRing(c, ring)) return c
  const lngs = ring.map(p => p[0]), lats = ring.map(p => p[1])
  const [minX, maxX, minY, maxY] = [Math.min(...lngs), Math.max(...lngs), Math.min(...lats), Math.max(...lats)]
  let best: LatLng | null = null, bestD = Infinity
  for (let i = 1; i < 24; i++) for (let j = 1; j < 24; j++) {
    const p: LatLng = [minY + ((maxY - minY) * i) / 24, minX + ((maxX - minX) * j) / 24]
    if (!insideRing(p, ring)) continue
    const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2
    if (d < bestD) { bestD = d; best = p }
  }
  return best ?? c
}

// Bogotá D.C. incluye Sumapaz (rural) — su centroide queda lejos de la ciudad
const ANCHOR_OVERRIDES: Record<string, LatLng> = { [normalizeDept('BOGOTÁ, D.C.')]: [4.65, -74.1] }

export interface Department { name: string, geometry: Polygon | MultiPolygon }

/** Minas agrupadas por el nombre del departamento del GeoJSON (las que no casan se descartan). */
export function minesByDepartment(mines: Mine[], departmentNames: string[]): Record<string, Mine[]> {
  const grouped: Record<string, Mine[]> = {}
  mines.forEach(m => {
    const matched = matchDept(m.department, departmentNames)
    if (matched) (grouped[matched] ||= []).push(m)
  })
  return grouped
}

export const playersByDepartment = (grouped: Record<string, Mine[]>): Record<string, number> =>
  Object.fromEntries(Object.entries(grouped).map(([d, orgs]) => [d, orgs.reduce((a, o) => a + o.player_count, 0)]))

/** Índice 0..steps-1 de la escala secuencial para `n` jugadores (null = departamento vacío). */
export const sequentialStep = (n: number, max: number, steps: number): number | null =>
  (n ? Math.min(steps - 1, Math.floor((n / max) * steps - 1e-9)) : null)

export type MitigationLevel = 'high' | 'mid' | 'low'
/** Mitigación de un municipio: 80% o más, 40–79%, menos de 40%. */
export const mitigationLevel = (pct: number): MitigationLevel => (pct >= 80 ? 'high' : pct >= 40 ? 'mid' : 'low')

export interface MineMarker {
  key: string
  department: string
  municipality: string
  orgs: Mine[]
  position: LatLng
  players: number
  pct: number
}

// Un marcador por municipio. No hay geometría municipal: si un departamento tiene varios municipios
// con minas se reparten alrededor de su ancla, encogiendo el radio hasta que todos los puntos queden
// DENTRO del departamento. Si el backend trae coordenadas reales (DIVIPOLA), se usan esas.
function fanOut(anchor: LatLng, count: number, ring: Ring | null): LatLng[] {
  let radius = count > 1 ? 0.3 : 0
  let positions: LatLng[] = []
  for (let attempt = 0; attempt < 6; attempt++) {
    positions = Array.from({ length: count }, (_, i) => {
      if (!radius) return anchor
      const angle = (2 * Math.PI * i) / count - Math.PI / 2
      const latAdjust = Math.cos((anchor[0] * Math.PI) / 180) || 1
      return [anchor[0] + radius * Math.sin(angle), anchor[1] + (radius / latAdjust) * Math.cos(angle)] as LatLng
    })
    if (!radius || !ring || positions.every(p => insideRing(p, ring))) break
    radius *= 0.65
  }
  return positions
}

/** % ponderado por resultados (o jugadores) de las minas de un municipio. */
function municipalityPct(orgs: Mine[]): number {
  const weight = (o: Mine) => o.results ?? o.player_count ?? 1
  const totalWeight = orgs.reduce((a, o) => a + weight(o), 0)
  return totalWeight
    ? Math.round(orgs.reduce((a, o) => a + o.percentage * weight(o), 0) / totalWeight)
    : Math.round(orgs.reduce((a, o) => a + o.percentage, 0) / orgs.length)
}

export function buildMarkers(departments: Department[], grouped: Record<string, Mine[]>): MineMarker[] {
  const out: MineMarker[] = []
  departments.forEach(({ name, geometry }) => {
    const orgs = grouped[name]
    if (!orgs?.length) return
    const anchor = ANCHOR_OVERRIDES[normalizeDept(name)] ?? anchorFor(geometry)
    if (!anchor) return
    const byMuni: Record<string, Mine[]> = {}
    orgs.forEach(o => { (byMuni[o.municipality || '—'] ||= []).push(o) })
    const entries = Object.entries(byMuni)
    const positions = fanOut(anchor, entries.length, largestRing(geometry))
    entries.forEach(([municipality, muniOrgs], i) => {
      const located = muniOrgs.find(o => o.lat != null && o.lng != null)
      out.push({
        key: `${name}|${municipality}`,
        department: name,
        municipality,
        orgs: muniOrgs,
        position: located ? [located.lat as number, located.lng as number] : positions[i],
        players: muniOrgs.reduce((a, o) => a + o.player_count, 0),
        pct: municipalityPct(muniOrgs),
      })
    })
  })
  return out
}
