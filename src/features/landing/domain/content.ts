// Contenido estático de la portada pública. Sin React: los íconos los asigna la UI por `id`.

export type StratumId = 'superficie' | 'como-funciona' | 'protocolos' | 'instructores'

/** Cada sección de la portada es un estrato de la mina, con su profundidad en el medidor. */
export interface Stratum {
  id: StratumId
  depth: number
  name: string
}

export const STRATA: readonly Stratum[] = [
  { id: 'superficie', depth: 0, name: 'Bocamina' },
  { id: 'como-funciona', depth: 40, name: 'Galería' },
  { id: 'protocolos', depth: 120, name: 'Frente' },
  { id: 'instructores', depth: 200, name: 'Control' },
]

export function stratum(id: StratumId): Stratum {
  const found = STRATA.find((s) => s.id === id)
  if (!found) throw new Error(`Estrato desconocido: ${id}`)
  return found
}

/** El estrato más profundo ya alcanzado a una profundidad dada (el primero si aún no se baja). */
export function currentStratum(depth: number): Stratum {
  return STRATA.reduce((current, s) => (s.depth <= depth ? s : current), stratum('superficie'))
}

export type StepId = 'vark' | 'epp' | 'riesgos' | 'seguimiento'

export interface Step {
  id: StepId
  title: string
  description: string
}

/** El recorrido de un jugador, en el orden en que lo vive dentro del juego. */
export const STEPS: readonly Step[] = [
  {
    id: 'vark',
    title: 'Diagnóstico VARK',
    description: 'Al iniciar, el juego identifica tu estilo de aprendizaje predominante —visual, auditivo o lector— y adapta la instrucción para que la información te llegue de la forma más efectiva.',
  },
  {
    id: 'epp',
    title: 'Equipamiento de protección',
    description: 'Antes de ingresar a la mina te equipas con cada elemento de protección personal. El juego valida cada prenda y te explica qué falta y por qué.',
  },
  {
    id: 'riesgos',
    title: 'Identificación de riesgos',
    description: 'Cada nivel replica riesgos reales del entorno minero —mecánicos, eléctricos, químicos y de altura— y te obliga a decidir bien bajo presión.',
  },
  {
    id: 'seguimiento',
    title: 'Seguimiento en tiempo real',
    description: 'Mientras juegas, el instructor ve tu avance, tu tiempo de reacción y el porcentaje de riesgos que lograste mitigar.',
  },
]

/** Tipo de señal de seguridad (NTC 1461 / ISO 7010) con la que se presenta cada protocolo. */
export type SignKind = 'advertencia' | 'obligacion' | 'condicion-segura'

export interface Protocol {
  code: string
  sign: SignKind
  signLabel: string
  title: string
  description: string
}

export const PROTOCOLS: readonly Protocol[] = [
  {
    code: 'Protocolo 01',
    sign: 'advertencia',
    signLabel: 'Advertencia',
    title: 'Reconocimiento de riesgos',
    description: 'Identificar visualmente los peligros de un entorno minero y clasificarlos por tipo y nivel de criticidad.',
  },
  {
    code: 'Protocolo 02',
    sign: 'obligacion',
    signLabel: 'Obligación',
    title: 'Aplicación de protocolos',
    description: 'Ejecutar correctamente el procedimiento de seguridad que corresponde a cada riesgo identificado.',
  },
  {
    code: 'Protocolo 03',
    sign: 'condicion-segura',
    signLabel: 'Condición segura',
    title: 'Toma de decisiones',
    description: 'Desarrollar criterio para actuar de forma segura y a tiempo ante una emergencia en el pozo.',
  },
]

export type CapabilityId = 'salas' | 'en-vivo' | 'excel' | 'mapa'

export interface Capability {
  id: CapabilityId
  title: string
  description: string
}

/** Lo que el panel ofrece hoy a instructores y coordinadores. */
export const CAPABILITIES: readonly Capability[] = [
  {
    id: 'salas',
    title: 'Salas con código',
    description: 'Un código de 3 dígitos o un QR basta para que todo el grupo entre a la misma sesión.',
  },
  {
    id: 'en-vivo',
    title: 'Seguimiento en vivo',
    description: 'Avance, tiempo de reacción y riesgos mitigados de cada jugador mientras la sesión está abierta.',
  },
  {
    id: 'excel',
    title: 'Informe en Excel',
    description: 'Cada sesión se exporta con el detalle por participante para el registro de la capacitación.',
  },
  {
    id: 'mapa',
    title: 'Mapa de minas',
    description: 'Analíticas por organización y localidad sobre el mapa de los departamentos del país.',
  },
]
