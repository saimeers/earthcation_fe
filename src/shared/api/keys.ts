// La API v1 habla camelCase y el panel conserva los nombres en snake_case de sus tipos (`shared/api/types`). Estas dos
// funciones traducen las claves en la frontera HTTP; los valores no se tocan.

// Contenido libre del juego: se deja como llega
const OPAQUE_KEYS: ReadonlySet<string> = new Set(['payload', 'changes'])

const toSnake = (key: string): string => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
const toCamel = (key: string): string => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())

function mapKeys(value: unknown, convert: (key: string) => string): unknown {
  if (Array.isArray(value)) return value.map((item) => mapKeys(item, convert))
  if (value === null || typeof value !== 'object' || value instanceof Blob || value instanceof FormData) return value
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [convert(key), OPAQUE_KEYS.has(key) ? item : mapKeys(item, convert)]))
}

/** Respuesta de v1 (camelCase) con las claves que usa el panel (snake_case). */
export const snakeKeys = <T>(value: unknown): T => mapKeys(value, toSnake) as T

/** Cuerpo o parámetros del panel (snake_case) con las claves que espera v1 (camelCase). */
export const camelKeys = <T>(value: unknown): T => mapKeys(value, toCamel) as T
