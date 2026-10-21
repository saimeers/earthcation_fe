// Único acceso a import.meta.env: las variables VITE_* se validan aquí una vez, al arrancar.
const DEFAULT_PLAY_URL = 'https://play.earthcation.saimers.dev'

function url(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Falta la variable de entorno ${name}`)
  try {
    new URL(value)
  } catch {
    throw new Error(`${name} no es una URL válida: ${value}`)
  }
  return value.replace(/\/$/, '')
}

export const env = {
  /** Origen de la API v1 (sin /api): las rutas de los adaptadores empiezan por /api/... */
  apiUrl: url('VITE_API_URL', import.meta.env.VITE_API_URL),
  /** Dominio del juego: el QR de una sala apunta a `${playUrl}/?sala=<código>` */
  playUrl: url('VITE_PLAY_URL', import.meta.env.VITE_PLAY_URL || DEFAULT_PLAY_URL),
} as const
