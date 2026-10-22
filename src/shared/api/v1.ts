import { camelKeys, snakeKeys } from './keys'
import { http, type QueryParams } from './client'

// Cliente de la API v1 (`/api/v1`): sobre `{ data, meta }`, camelCase y listas con página. Quien lo usa recibe y manda
// los tipos de `shared/api/types` tal como los conoce el panel.
const BASE = '/api/v1'
const PAGE_SIZE = 100

interface PageMeta { page: number, limit: number, total: number, total_pages: number }

interface Envelope<T> { data: T, meta?: { page: number, limit: number, total: number, totalPages: number } }

const queryOf = (params?: Record<string, unknown>): QueryParams | undefined =>
  (params ? camelKeys<QueryParams>(params) : undefined)

const unwrap = <T>(body: Envelope<unknown> | undefined): T => snakeKeys<T>(body?.data)

async function pagesOf<T>(path: string, params: QueryParams): Promise<T[]> {
  const first = await http.get<Envelope<unknown[]>>(`${BASE}${path}`, { ...params, page: 1, limit: PAGE_SIZE })
  const rest = Array.from({ length: Math.max(0, (first.meta?.totalPages ?? 1) - 1) }, (_, i) =>
    http.get<Envelope<unknown[]>>(`${BASE}${path}`, { ...params, page: i + 2, limit: PAGE_SIZE }))
  const all = [first, ...(await Promise.all(rest))].flatMap((page) => page.data)
  return snakeKeys<T[]>(all)
}

export const v1 = {
  get: <T>(path: string, params?: Record<string, unknown>) => http.get<Envelope<unknown>>(`${BASE}${path}`, queryOf(params)).then((b) => unwrap<T>(b)),
  /** Una lista completa: pide todas las páginas (los listados del panel no paginan en pantalla). */
  list: <T>(path: string, params?: Record<string, unknown>) => pagesOf<T>(path, queryOf(params) ?? {}),
  /** Una página de una lista, con su `meta` (para paginar en pantalla). */
  page: <T>(path: string, params?: Record<string, unknown>) =>
    http.get<Envelope<unknown[]>>(`${BASE}${path}`, queryOf(params)).then((b) => ({ items: snakeKeys<T[]>(b.data), meta: snakeKeys<PageMeta>(b.meta) })),
  getBlob: (path: string, params?: Record<string, unknown>) => http.getBlob(`${BASE}${path}`, queryOf(params)),
  post: <T = undefined>(path: string, body?: unknown) =>
    http.post<Envelope<unknown> | undefined>(`${BASE}${path}`, body instanceof FormData ? body : camelKeys(body)).then((b) => unwrap<T>(b)),
  put: <T = undefined>(path: string, body?: unknown) => http.put<Envelope<unknown> | undefined>(`${BASE}${path}`, camelKeys(body)).then((b) => unwrap<T>(b)),
  patch: <T = undefined>(path: string, body?: unknown) => http.patch<Envelope<unknown> | undefined>(`${BASE}${path}`, camelKeys(body)).then((b) => unwrap<T>(b)),
  delete: (path: string) => http.delete(`${BASE}${path}`).then(() => undefined),
}
