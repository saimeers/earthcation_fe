import { useEffect, useState } from 'react'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'

// Polígonos de los departamentos de Colombia (DANE/MGN, propiedad DPTO_CNMBR), servidos desde public/.
const GEO_URL = '/data/colombia-departamentos.geo.json'

export interface DepartmentProps { DPTO_CNMBR: string }
export type DepartmentFeature = Feature<Polygon | MultiPolygon, DepartmentProps>
export type DepartmentCollection = FeatureCollection<Polygon | MultiPolygon, DepartmentProps>

/** Carga el GeoJSON de departamentos (null mientras llega o si falla). */
export function useColombiaDepartments(): DepartmentCollection | null {
  const [data, setData] = useState<DepartmentCollection | null>(null)
  useEffect(() => {
    fetch(GEO_URL).then(r => r.json() as Promise<DepartmentCollection>).then(setData).catch(() => {})
  }, [])
  return data
}

/** Departamentos sin San Andrés: está a ~700 km y encogería el encuadre de todo el país. */
export const mainlandFeatures = (geo: DepartmentCollection): DepartmentFeature[] =>
  geo.features.filter(f => !/^ARCHIPI/i.test(f.properties.DPTO_CNMBR.normalize('NFD').replace(/[̀-ͯ]/g, '')))
