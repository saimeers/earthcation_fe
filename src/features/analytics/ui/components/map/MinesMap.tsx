import { useMemo, useRef, useState } from 'react'
import { MapContainer, GeoJSON, CircleMarker, Tooltip, ZoomControl } from 'react-leaflet'
import L, { type Layer, type LeafletMouseEvent, type Map as LeafletMap, type PathOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Feature, Geometry } from 'geojson'
import { Skeleton } from '@/shared/ui/skeleton'
import { useIsDark } from '@/shared/lib/useIsDark'
import { boundsOf, mainlandFeatures, useColombiaDepartments, type DepartmentFeature, type DepartmentProps } from '@/shared/lib/geo'
import {
  buildMarkers, minesByDepartment, mitigationLevel, playersByDepartment, sequentialStep, type MineMarker,
} from '../../../domain/minesMap'
import { useMinesMap } from '../../../application/useAnalytics'
import { MapLegend, MineDetail, PALETTE, ResetViewButton, mitigationColor } from './MapOverlays'

// Mapa 100% vectorial a partir del GeoJSON local de departamentos (DANE/MGN): sin teselas externas
// no hay clave, cuota ni dependencia de red.
export function MinesMap({ height = 460 }: { height?: number }) {
  const { data: mines, isLoading } = useMinesMap()
  const geoData = useColombiaDepartments()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const mapRef = useRef<LeafletMap>(null)
  const dark = useIsDark()
  const pal = dark ? PALETTE.dark : PALETTE.light

  const features = useMemo(() => geoData?.features ?? [], [geoData])
  const bounds = useMemo(() => (geoData ? boundsOf(mainlandFeatures(geoData)) : null), [geoData])
  const grouped = useMemo(
    () => (mines?.length && features.length ? minesByDepartment(mines, features.map(f => f.properties.DPTO_CNMBR)) : {}),
    [mines, features],
  )
  const playersByDept = useMemo(() => playersByDepartment(grouped), [grouped])
  const markers = useMemo(
    () => buildMarkers(features.map(f => ({ name: f.properties.DPTO_CNMBR, geometry: f.geometry })), grouped),
    [features, grouped],
  )
  const featureByName = useMemo(() => new Map(features.map(f => [f.properties.DPTO_CNMBR, f])), [features])

  if (isLoading || !geoData) return <Skeleton className="w-full rounded-xl" style={{ height }} />

  const maxPlayers = Math.max(1, ...Object.values(playersByDept))
  const seqColor = (n: number) => { const step = sequentialStep(n, maxPlayers, pal.seq.length); return step == null ? pal.empty : pal.seq[step] }
  const selected = markers.find(m => m.key === selectedKey) ?? null
  const totalPlayers = Object.values(playersByDept).reduce((a, b) => a + b, 0)

  const styleFor = (feature?: Feature<Geometry, DepartmentProps>): PathOptions => ({
    fillColor: seqColor(playersByDept[feature?.properties.DPTO_CNMBR ?? ''] || 0),
    fillOpacity: 1,
    color: pal.stroke,
    weight: 0.8,
  })

  const focus = (marker: MineMarker) => {
    setSelectedKey(marker.key)
    const feature = featureByName.get(marker.department) as DepartmentFeature
    mapRef.current?.flyToBounds(L.geoJSON(feature).getBounds(), { padding: [60, 60], maxZoom: 8, duration: 0.6 })
  }
  const resetView = () => {
    setSelectedKey(null)
    if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [10, 10], duration: 0.5 })
  }

  const bindDepartment = (feature: Feature<Geometry, DepartmentProps>, layer: Layer) => {
    const name = feature.properties.DPTO_CNMBR
    const n = playersByDept[name] || 0
    layer.bindTooltip(`<b>${name}</b><br/>${n ? `${n} jugador${n !== 1 ? 'es' : ''}` : 'Sin organizaciones'}`, { sticky: true, direction: 'top', offset: [0, -6] })
    layer.on({
      mouseover: (e: LeafletMouseEvent) => (e.target as L.Path).setStyle({ weight: 2, color: pal.hover }),
      mouseout: (e: LeafletMouseEvent) => (e.target as L.Path).setStyle(styleFor(feature)),
    })
  }

  return (
    // `isolate` crea un contexto de apilamiento propio: los paneles de Leaflet (z-index 400–1000)
    // ya no se pintan encima del header fijo, el sidebar móvil ni los modales.
    <div className="relative isolate overflow-hidden rounded-xl border" style={{ background: pal.bg }}>
      <MapContainer
        ref={mapRef}
        bounds={bounds ?? undefined}
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
          onEachFeature={bindDepartment}
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
              fillColor: mitigationColor(mitigationLevel(m.pct)),
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

      <ResetViewButton onClick={resetView} />
      <MapLegend pal={pal} maxPlayers={maxPlayers} totalPlayers={totalPlayers} />
      <MineDetail selected={selected} onClose={resetView} />

      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
          <p className="text-sm text-muted-foreground bg-background/90 px-3 py-1.5 rounded-md border">Sin organizaciones ubicadas todavía.</p>
        </div>
      )}
    </div>
  )
}
