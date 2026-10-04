import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, GeoJSON, CircleMarker, Tooltip, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion, AnimatePresence } from 'motion/react'
import { X, MapPin, Users, Maximize2 } from 'lucide-react'
import { useMinesMap } from '@/hooks/admin/useAnalytics'
import { Skeleton } from '@/components/ui/skeleton'

const GEO_URL = '/data/colombia-departamentos.geo.json'

// Mapa 100% vectorial a partir del GeoJSON local de departamentos (DANE/MGN). Antes usaba
// teselas de CARTO (basemaps.cartocdn.com), que en producción pedían clave/atribución y se veían
// rotas — sin teselas externas no hay clave, cuota ni dependencia de red.

// Alias entre el nombre de departamento del GeoJSON (DIVIPOLA, en mayúsculas) y variantes reales
// que trae la BD (typos históricos incluidos, ver CLAUDE.md del backend) — normalizado sin
// tildes/mayúsculas antes de comparar, con tolerancia a distancia de edición corta para typos.
function normalize(text) {
  return String(text ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/\s+/g, ' ').trim()
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

const DEPT_ALIASES = {
  [normalize('Bogota D.C.')]: normalize('BOGOTA, D.C.'),
  [normalize('Bogota')]: normalize('BOGOTA, D.C.'),
  [normalize('San Andres y Providencia')]: normalize('ARCHIPIELAGO DE SAN ANDRES, PROVIDENCIA Y SANTA CATALINA'),
}

function matchDept(orgDept, geoDeptNames) {
  const norm = DEPT_ALIASES[normalize(orgDept)] ?? normalize(orgDept)
  let best = null, bestDist = Infinity
  for (const geoName of geoDeptNames) {
    const geoNorm = normalize(geoName)
    if (geoNorm === norm) return geoName
    const dist = levenshtein(norm, geoNorm)
    if (dist < bestDist) { bestDist = dist; best = geoName }
  }
  return bestDist <= 3 ? best : null
}

// ── Geometría ────────────────────────────────────────────────────────────────
// Anillo exterior más grande del departamento (las islas/enclaves no deben mover el ancla)
function largestRing(geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  let best = null, bestArea = -1
  polys.forEach(poly => {
    const a = Math.abs(ringArea(poly[0]))
    if (a > bestArea) { bestArea = a; best = poly[0] }
  })
  return best
}
function ringArea(ring) {
  let a = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
  return a / 2
}
function ringCentroid(ring) {
  let x = 0, y = 0, a = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
    x += (ring[j][0] + ring[i][0]) * f
    y += (ring[j][1] + ring[i][1]) * f
    a += f
  }
  a /= 2
  return [y / (6 * a), x / (6 * a)] // [lat, lng]
}
function insideRing([lat, lng], ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j]
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
// Centroide por área; si cae fuera (departamentos cóncavos), el punto interior más cercano a él
function anchorFor(feature) {
  const ring = largestRing(feature.geometry)
  if (!ring) return null
  const c = ringCentroid(ring)
  if (insideRing(c, ring)) return c
  const lngs = ring.map(p => p[0]), lats = ring.map(p => p[1])
  const [minX, maxX, minY, maxY] = [Math.min(...lngs), Math.max(...lngs), Math.min(...lats), Math.max(...lats)]
  let best = null, bestD = Infinity
  for (let i = 1; i < 24; i++) for (let j = 1; j < 24; j++) {
    const p = [minY + ((maxY - minY) * i) / 24, minX + ((maxX - minX) * j) / 24]
    if (!insideRing(p, ring)) continue
    const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2
    if (d < bestD) { bestD = d; best = p }
  }
  return best ?? c
}
// Bogotá D.C. incluye Sumapaz (rural) — su centroide queda lejos de la ciudad
const ANCHOR_OVERRIDES = { [normalize('BOGOTÁ, D.C.')]: [4.65, -74.1] }

// ── Colores ─────────────────────────────────────────────────────────────────
const PALETTE = {
  light: { empty: '#eceae4', stroke: '#c3c2b7', hover: '#52514e', seq: ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf'], ring: '#ffffff', bg: '#f7f7f4' },
  dark:  { empty: '#2a2a28', stroke: '#45443f', hover: '#c3c2b7', seq: ['#0d366b', '#184f95', '#256abf', '#3987e5', '#6da7ec'], ring: '#1a1a19', bg: '#141413' },
}
const MITIGATION = [
  { min: 80, color: '#0ca30c', label: '80% o más' },
  { min: 40, color: '#fab219', label: '40–79%' },
  { min: 0,  color: '#d03b3b', label: 'Menos de 40%' },
]
const mitigationColor = (pct) => MITIGATION.find(m => pct >= m.min).color

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

export function MinesMap({ height = 460 }) {
  const { data: mines, isLoading } = useMinesMap()
  const [selectedKey, setSelectedKey] = useState(null)
  const [geoData, setGeoData] = useState(null)
  const mapRef = useRef(null)
  const dark = useIsDark()
  const pal = dark ? PALETTE.dark : PALETTE.light

  useEffect(() => {
    fetch(GEO_URL).then(r => r.json()).then(setGeoData).catch(() => {})
  }, [])

  const features = useMemo(() => geoData?.features ?? [], [geoData])
  // Encuadre del territorio continental: San Andrés está a ~700 km y encogería todo el país
  const bounds = useMemo(() => {
    if (!geoData) return null
    const mainland = geoData.features.filter(f => !normalize(f.properties.DPTO_CNMBR).startsWith('ARCHIPIELAGO'))
    return L.geoJSON({ type: 'FeatureCollection', features: mainland }).getBounds()
  }, [geoData])

  const minesByDept = useMemo(() => {
    if (!mines?.length || !features.length) return {}
    const geoNames = features.map(g => g.properties.DPTO_CNMBR)
    const grouped = {}
    mines.forEach(m => {
      const matched = matchDept(m.department, geoNames)
      if (!matched) return
      ;(grouped[matched] ||= []).push(m)
    })
    return grouped
  }, [mines, features])

  const playersByDept = useMemo(() => Object.fromEntries(
    Object.entries(minesByDept).map(([d, orgs]) => [d, orgs.reduce((a, o) => a + o.player_count, 0)]),
  ), [minesByDept])
  const maxPlayers = Math.max(1, ...Object.values(playersByDept))
  const seqColor = (n) => (n ? pal.seq[Math.min(pal.seq.length - 1, Math.floor((n / maxPlayers) * pal.seq.length - 1e-9))] : pal.empty)

  // Un marcador por municipio. No hay geometría municipal: si un departamento tiene varios
  // municipios con minas se reparten alrededor de su ancla, encogiendo el radio hasta que
  // todos los puntos queden DENTRO del departamento.
  const markers = useMemo(() => {
    const out = []
    features.forEach(f => {
      const deptName = f.properties.DPTO_CNMBR
      const orgs = minesByDept[deptName]
      if (!orgs?.length) return
      const anchor = ANCHOR_OVERRIDES[normalize(deptName)] ?? anchorFor(f)
      if (!anchor) return
      const ring = largestRing(f.geometry)
      const byMuni = {}
      orgs.forEach(o => { (byMuni[o.municipality || '—'] ||= []).push(o) })
      const entries = Object.entries(byMuni)
      let radius = entries.length > 1 ? 0.3 : 0
      let positions = []
      for (let attempt = 0; attempt < 6; attempt++) {
        positions = entries.map((_, i) => {
          if (!radius) return anchor
          const angle = (2 * Math.PI * i) / entries.length - Math.PI / 2
          const latAdjust = Math.cos((anchor[0] * Math.PI) / 180) || 1
          return [anchor[0] + radius * Math.sin(angle), anchor[1] + (radius / latAdjust) * Math.cos(angle)]
        })
        if (!radius || positions.every(p => insideRing(p, ring))) break
        radius *= 0.65
      }
      entries.forEach(([municipality, muniOrgs], i) => {
        const players = muniOrgs.reduce((a, o) => a + o.player_count, 0)
        const pct = Math.round(muniOrgs.reduce((a, o) => a + o.percentage * (o.player_count || 1), 0) / muniOrgs.reduce((a, o) => a + (o.player_count || 1), 0))
        out.push({ key: `${deptName}|${municipality}`, department: deptName, municipality, orgs: muniOrgs, position: positions[i], players, pct, feature: f })
      })
    })
    return out
  }, [features, minesByDept])

  if (isLoading || !geoData) return <Skeleton className="w-full rounded-xl" style={{ height }} />

  const selected = markers.find(m => m.key === selectedKey) ?? null
  const totalPlayers = Object.values(playersByDept).reduce((a, b) => a + b, 0)

  const styleFor = (feature) => ({
    fillColor: seqColor(playersByDept[feature.properties.DPTO_CNMBR] || 0),
    fillOpacity: 1,
    color: pal.stroke,
    weight: 0.8,
  })

  const focus = (marker) => {
    setSelectedKey(marker.key)
    const b = L.geoJSON(marker.feature).getBounds()
    mapRef.current?.flyToBounds(b, { padding: [60, 60], maxZoom: 8, duration: 0.6 })
  }
  const resetView = () => {
    setSelectedKey(null)
    if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [10, 10], duration: 0.5 })
  }

  return (
    // `isolate` crea un contexto de apilamiento propio: los paneles de Leaflet (z-index 400–1000)
    // ya no se pintan encima del header fijo, el sidebar móvil ni los modales.
    <div className="relative isolate overflow-hidden rounded-xl border" style={{ background: pal.bg }}>
      <MapContainer
        ref={mapRef}
        bounds={bounds}
        boundsOptions={{ padding: [10, 10] }}
        maxBounds={bounds?.pad(0.4)}
        maxBoundsViscosity={0.8}
        zoomSnap={0.25}
        minZoom={4}
        maxZoom={9}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
        style={{ height, width: '100%', background: 'transparent' }}
      >
        <GeoJSON
          key={`${dark}-${Object.keys(playersByDept).join(',')}-${maxPlayers}`}
          data={geoData}
          style={styleFor}
          onEachFeature={(feature, layer) => {
            const name = feature.properties.DPTO_CNMBR
            const n = playersByDept[name] || 0
            layer.bindTooltip(`<b>${name}</b><br/>${n ? `${n} jugador${n !== 1 ? 'es' : ''}` : 'Sin organizaciones'}`, { sticky: true, direction: 'top', offset: [0, -6] })
            layer.on({
              mouseover: (e) => e.target.setStyle({ weight: 2, color: pal.hover }),
              mouseout: (e) => e.target.setStyle(styleFor(feature)),
            })
          }}
        />
        <ZoomControl position="topright" />
        {markers.map(m => (
          <CircleMarker
            key={m.key}
            center={m.position}
            radius={Math.min(16, 6 + Math.sqrt(m.players) * 2)}
            pathOptions={{
              color: m.key === selectedKey ? (dark ? '#ffffff' : '#0b0b0b') : pal.ring,
              weight: m.key === selectedKey ? 3 : 2,
              fillColor: mitigationColor(m.pct),
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => focus(m) }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <div className="text-xs leading-snug">
                <p className="font-semibold">{m.municipality}, {m.department}</p>
                <p>{m.orgs.length} organización{m.orgs.length !== 1 ? 'es' : ''} · {m.players} jugador{m.players !== 1 ? 'es' : ''}</p>
                <p>Mitigación: <b>{m.pct}%</b></p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Controles y leyenda */}
      <button
        type="button"
        onClick={resetView}
        title="Ver todo el país"
        className="absolute top-[84px] right-[10px] z-[1000] flex h-[30px] w-[30px] items-center justify-center rounded-lg border bg-popover/95 shadow-sm hover:bg-muted">
        <Maximize2 className="h-4 w-4" />
      </button>

      <div className="absolute top-3 left-3 z-[1000] rounded-lg border bg-popover/95 backdrop-blur px-3 py-2.5 shadow-sm space-y-2.5 text-[11px] w-[190px]">
        <div>
          <p className="font-semibold mb-1">Jugadores por departamento</p>
          <div className="flex items-center gap-[2px]">
            {pal.seq.map(c => <span key={c} className="h-2.5 flex-1 rounded-sm" style={{ background: c }} />)}
          </div>
          <div className="flex justify-between text-muted-foreground mt-0.5"><span>1</span><span>{maxPlayers}</span></div>
        </div>
        <div>
          <p className="font-semibold mb-1">Mitigación (punto = municipio)</p>
          <div className="space-y-0.5">
            {MITIGATION.map(m => (
              <p key={m.label} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full ring-2 ring-background" style={{ background: m.color }} />{m.label}
              </p>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">Fuente: DANE – MGN · {totalPlayers} jugadores ubicados</p>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 bg-popover border border-border rounded-xl shadow-xl p-4 space-y-3 z-[1001]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{selected.municipality}</p>
                <p className="text-xs text-muted-foreground">{selected.department} · <Users className="inline h-3 w-3" /> {selected.players} jugadores</p>
              </div>
              <button onClick={resetView} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {selected.orgs.map(o => (
                <div key={o.id} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <p className="font-medium truncate">{o.name}</p>
                    <p className="text-xs font-semibold tabular-nums shrink-0">{o.percentage}%</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${o.percentage}%`, background: mitigationColor(o.percentage) }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{o.player_count} jugador{o.player_count !== 1 ? 'es' : ''}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
          <p className="text-sm text-muted-foreground bg-background/90 px-3 py-1.5 rounded-md border">Sin organizaciones ubicadas todavía.</p>
        </div>
      )}
    </div>
  )
}
