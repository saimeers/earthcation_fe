import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion, AnimatePresence } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { X, MapPin } from 'lucide-react'
import { useMinesMap } from '@/hooks/admin/useAnalytics'
import { Skeleton } from '@/components/ui/skeleton'

const GEO_URL = '/data/colombia-departamentos.geo.json'

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

function percentageColor(pct) {
  if (pct >= 80) return '#22c55e'
  if (pct >= 40) return '#f59e0b'
  return '#ef4444'
}

export function MinesMap() {
  const { data: mines, isLoading } = useMinesMap()
  const [selectedGroup, setSelectedGroup] = useState(null) // { department, municipality }
  const [geoData, setGeoData] = useState(null)

  useEffect(() => {
    fetch(GEO_URL).then(r => r.json()).then(setGeoData).catch(() => {})
  }, [])

  const geographies = useMemo(() => geoData?.features ?? [], [geoData])

  const minesByDept = useMemo(() => {
    if (!mines?.length || !geographies.length) return {}
    const geoNames = geographies.map(g => g.properties.DPTO_CNMBR)
    const grouped = {}
    mines.forEach(m => {
      const matched = matchDept(m.department, geoNames)
      if (!matched) return
      if (!grouped[matched]) grouped[matched] = []
      grouped[matched].push(m)
    })
    return grouped
  }, [mines, geographies])

  const centroidByDept = useMemo(() => {
    const map = {}
    geographies.forEach(g => {
      try {
        const bounds = L.geoJSON(g).getBounds()
        const c = bounds.getCenter()
        map[g.properties.DPTO_CNMBR] = [c.lat, c.lng]
      } catch { /* geometría inválida, se ignora */ }
    })
    return map
  }, [geographies])

  // Un marcador por municipio (no por departamento) — si un departamento tiene varias
  // organizaciones en municipios distintos, se reparten alrededor del centroide del
  // departamento (no tenemos geometría a nivel de municipio) en vez de amontonarse en un
  // solo punto, así se distinguen visualmente.
  const muniMarkers = useMemo(() => {
    const markers = []
    Object.entries(minesByDept).forEach(([deptName, orgs]) => {
      const centroid = centroidByDept[deptName]
      if (!centroid) return

      const byMuni = {}
      orgs.forEach(o => {
        const key = o.municipality || '—'
        if (!byMuni[key]) byMuni[key] = []
        byMuni[key].push(o)
      })
      const muniEntries = Object.entries(byMuni)

      muniEntries.forEach(([municipality, muniOrgs], i) => {
        let position = centroid
        if (muniEntries.length > 1) {
          const angle = (2 * Math.PI * i) / muniEntries.length
          const radiusDeg = 0.35
          const latAdjust = Math.cos((centroid[0] * Math.PI) / 180) || 1
          position = [
            centroid[0] + radiusDeg * Math.sin(angle),
            centroid[1] + (radiusDeg / latAdjust) * Math.cos(angle),
          ]
        }
        markers.push({
          key: `${deptName}|${municipality}`,
          department: deptName,
          municipality,
          orgs: muniOrgs,
          position,
        })
      })
    })
    return markers
  }, [minesByDept, centroidByDept])

  if (isLoading || !geoData) return <Skeleton className="h-[480px] w-full rounded-lg" />

  const selectedMines = selectedGroup
    ? muniMarkers.find(m => m.key === selectedGroup)?.orgs ?? []
    : []
  const selectedInfo = selectedGroup ? muniMarkers.find(m => m.key === selectedGroup) : null

  const geoJsonStyle = (feature) => {
    const hasMines = !!minesByDept[feature.properties.DPTO_CNMBR]?.length
    return {
      fillColor: hasMines ? '#7c3aed' : '#94a3b8',
      fillOpacity: hasMines ? 0.18 : 0.06,
      color: '#94a3b8',
      weight: 1,
    }
  }

  return (
    <div className="relative rounded-lg overflow-hidden border">
      <MapContainer
        center={[4.3, -73.5]}
        zoom={5.3}
        minZoom={5}
        maxZoom={9}
        scrollWheelZoom
        style={{ height: 480, width: '100%', background: 'var(--color-muted, #f1f5f9)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          data={geoData}
          style={geoJsonStyle}
          onEachFeature={(feature, layer) => {
            layer.on({
              mouseover: (e) => e.target.setStyle({ fillOpacity: 0.3 }),
              mouseout: (e) => e.target.setStyle(geoJsonStyle(feature)),
            })
          }}
        />
        {muniMarkers.map(marker => {
          const totalPlayers = marker.orgs.reduce((a, o) => a + o.player_count, 0)
          const avgPct = Math.round(marker.orgs.reduce((a, o) => a + o.percentage, 0) / marker.orgs.length)
          return (
            <CircleMarker
              key={marker.key}
              center={marker.position}
              radius={Math.min(18, 7 + totalPlayers)}
              pathOptions={{ color: 'white', weight: 2, fillColor: percentageColor(avgPct), fillOpacity: 0.9 }}
              eventHandlers={{ click: () => setSelectedGroup(marker.key) }}
            >
              <Tooltip direction="top" offset={[0, -8]} className="!font-sans">
                <span className="font-medium">{marker.municipality}</span>, {marker.department} — {marker.orgs.length} organización{marker.orgs.length !== 1 ? 'es' : ''}, {totalPlayers} jugador{totalPlayers !== 1 ? 'es' : ''}
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 bg-popover border border-border rounded-lg shadow-xl p-4 space-y-3 z-[1000]">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {selectedInfo?.municipality}, {selectedInfo?.department}
              </p>
              <button onClick={() => setSelectedGroup(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {selectedMines.map(m => (
                <div key={m.id} className="flex items-center justify-between gap-2 text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.player_count} jugador{m.player_count !== 1 ? 'es' : ''}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs" style={{ borderColor: percentageColor(m.percentage), color: percentageColor(m.percentage) }}>
                    {m.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {muniMarkers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-muted-foreground bg-background/90 px-3 py-1.5 rounded-md border">
            Sin organizaciones ubicadas todavía.
          </p>
        </div>
      )}
    </div>
  )
}
