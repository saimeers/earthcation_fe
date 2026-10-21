import { MapContainer, GeoJSON, CircleMarker, Tooltip, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Skeleton } from '@/shared/ui/skeleton'
import { useIsDark } from '@/shared/lib/useIsDark'
import { boundsOf, mainlandFeatures, useColombiaDepartments } from '@/shared/lib/geo'
import type { CityCountDto } from '@/shared/api/types'

const PALETTE = {
  light: { land: '#eceae4', stroke: '#c3c2b7', bg: '#f7f7f4', ring: '#ffffff' },
  dark: { land: '#2a2a28', stroke: '#45443f', bg: '#141413', ring: '#1a1a19' },
}

interface VisitsMapProps {
  cities: CityCountDto[]
  height?: number
}

/** Ciudades desde donde se abrió el juego (coordenadas de Cloudflare), sobre los departamentos de Colombia. */
export function VisitsMap({ cities, height = 380 }: VisitsMapProps) {
  const dark = useIsDark()
  const pal = dark ? PALETTE.dark : PALETTE.light
  const geoData = useColombiaDepartments()

  if (!geoData) return <Skeleton className="w-full rounded-xl" style={{ height }} />

  // Leaflet pinta atributos SVG: ahí var(--x) no funciona, se lee el valor del token.
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--chart-1').trim() || '#3987e5'
  const points = cities.filter(c => c.lat != null && c.lng != null)
  const max = Math.max(1, ...points.map(c => c.count))
  const bounds = boundsOf(mainlandFeatures(geoData))

  return (
    // `isolate`: los paneles de Leaflet (z-index 400–1000) no se pintan sobre el header ni los modales.
    <div className="relative isolate overflow-hidden rounded-xl border" style={{ background: pal.bg }}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [10, 10] }}
        zoomSnap={0.25}
        minZoom={3}
        maxZoom={10}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
        style={{ height, width: '100%', background: 'transparent' }}
      >
        <GeoJSON key={String(dark)} data={geoData} style={{ fillColor: pal.land, fillOpacity: 1, color: pal.stroke, weight: 0.8 }} />
        {points.map(c => (
          <CircleMarker
            key={`${c.country}-${c.region}-${c.city}`}
            center={[c.lat as number, c.lng as number]}
            radius={5 + Math.sqrt(c.count / max) * 14}
            pathOptions={{ color: pal.ring, weight: 1.5, fillColor: accent, fillOpacity: 0.75 }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <b>{c.city}</b>{c.region ? `, ${c.region}` : ''}{c.country && c.country !== 'CO' ? ` (${c.country})` : ''}
              <br />{c.count} visita{c.count !== 1 ? 's' : ''}
            </Tooltip>
          </CircleMarker>
        ))}
        <ZoomControl position="bottomright" />
      </MapContainer>
      {!points.length && (
        <p className="absolute inset-x-0 bottom-3 text-center text-xs text-muted-foreground pointer-events-none">Sin visitas con ubicación en este periodo.</p>
      )}
    </div>
  )
}
