// Contenido estático de la portada pública, alineado con el anteproyecto ("Earthcation: Juego Serio para reforzar la
// identificación de riesgos en la labor minera"). Sin React: los íconos los asigna la UI por `id`.

export type StratumId = 'superficie' | 'como-funciona' | 'protocolos' | 'instructores'

/** Cada sección de la portada es un tramo del recorrido por la mina, con su profundidad en el medidor. */
export interface Stratum {
  id: StratumId
  depth: number
  name: string
  /** Fondo de la sección: el medidor cambia de color para seguir siendo legible. */
  tone: 'light' | 'dark'
}

export const STRATA: readonly Stratum[] = [
  { id: 'superficie', depth: 0, name: 'Superficie', tone: 'light' },
  { id: 'como-funciona', depth: 40, name: 'Inclinado', tone: 'light' },
  { id: 'protocolos', depth: 120, name: 'Frente de explotación', tone: 'dark' },
  { id: 'instructores', depth: 200, name: 'Control', tone: 'dark' },
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

export const PROJECT_TITLE = 'Juego Serio para reforzar la identificación de riesgos en la labor minera'

/** Definición de Juego Serio que usa el anteproyecto (Abt, 1970). */
export const SERIOUS_GAME_NOTE =
  'Un Juego Serio es un juego diseñado con un propósito formativo, más allá del entretenimiento. Modela situaciones reales en un entorno controlado para que se pueda practicar sin correr riesgos (Abt, 1970).'

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
    description: 'Un cuestionario corto identifica si aprendes mejor viendo, escuchando o leyendo. Con ese resultado, el juego presenta las instrucciones en el formato que más te sirve.',
  },
  {
    id: 'epp',
    title: 'Elementos de protección personal',
    description: 'Antes de entrar a la mina eliges el equipo que exige la labor. Si falta un elemento, el juego te indica cuál es y para qué sirve.',
  },
  {
    id: 'riesgos',
    title: 'Identificación de riesgos',
    description: 'Cada nivel plantea situaciones de una mina de carbón: gases, derrumbes, vibración, máquinas en movimiento y animales ponzoñosos. Reconoces el peligro y actúas antes de que se acabe el tiempo.',
  },
  {
    id: 'seguimiento',
    title: 'Seguimiento del instructor',
    description: 'Durante la sesión, el instructor ve el avance de cada jugador, cuánto tarda en reaccionar y qué riesgos logró mitigar. Así sabe qué reforzar al terminar.',
  },
]

/** Tipo de señal de seguridad (NTC 1461) con la que se presenta cada protocolo. */
export type SignKind = 'advertencia' | 'obligacion' | 'condicion-segura'

export interface Protocol {
  number: string
  sign: SignKind
  signLabel: string
  title: string
  description: string
}

export const PROTOCOLS: readonly Protocol[] = [
  {
    number: '01',
    sign: 'advertencia',
    signLabel: 'Advertencia',
    title: 'Reconocimiento de riesgos',
    description: 'Identificar los peligros presentes en la labor y clasificarlos según su tipo y su nivel de criticidad.',
  },
  {
    number: '02',
    sign: 'obligacion',
    signLabel: 'Obligación',
    title: 'Aplicación de protocolos',
    description: 'Seguir, paso por paso, el procedimiento de seguridad que corresponde a cada riesgo identificado.',
  },
  {
    number: '03',
    sign: 'condicion-segura',
    signLabel: 'Condición segura',
    title: 'Toma de decisiones',
    description: 'Actuar con criterio y a tiempo cuando la situación se complica, con la salida segura del personal como prioridad.',
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
    description: 'El grupo entra a la misma sesión con un código de tres dígitos o escaneando un QR.',
  },
  {
    id: 'en-vivo',
    title: 'Seguimiento en vivo',
    description: 'Avance, tiempo de reacción y riesgos mitigados de cada jugador mientras la sala está abierta.',
  },
  {
    id: 'excel',
    title: 'Informe en Excel',
    description: 'Cada sesión se exporta con el detalle por participante para el registro de la capacitación.',
  },
  {
    id: 'mapa',
    title: 'Mapa de minas',
    description: 'Resultados por organización y por municipio sobre el mapa de los departamentos de Colombia.',
  },
]
