import axios, { type AxiosProgressEvent, type AxiosRequestConfig } from 'axios'
import { env } from '@/shared/config/env'

/** Error de una llamada a la API: conserva el estado HTTP y el `error` que devuelve el backend. */
export class ApiError extends Error {
  readonly status: number | null
  readonly serverMessage: string | null
  /** Código estable de la API v1 (`TOKEN_INVALID`, `VALIDATION_ERROR`…); la API anterior no lo trae. */
  readonly code: string | null

  constructor(message: string, status: number | null, serverMessage: string | null, code: string | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.serverMessage = serverMessage
    this.code = code
  }
}

// El token vencido o inválido y la cuenta deshabilitada responden 403 (no 401): la sesión ya no vale aunque el estado no
// sea 401. La API v1 lo dice con un código; la anterior, con su mensaje.
const SESSION_ENDED_CODES: readonly string[] = ['TOKEN_INVALID', 'ACCOUNT_DISABLED']
const SESSION_ENDED_MESSAGES: readonly string[] = ['Token inválido o expirado', 'La cuenta está deshabilitada']

/** La respuesta significa que la sesión terminó: 401, o 403 por token inválido o cuenta deshabilitada. Otro 403 es "sin permiso para esto". */
export function endsSession(err: ApiError): boolean {
  if (err.status === 401) return true
  if (err.status !== 403) return false
  return SESSION_ENDED_CODES.includes(err.code ?? '') || SESSION_ENDED_MESSAGES.includes(err.serverMessage ?? '')
}

/** Mensaje del backend (`{ error }`) o el texto de respaldo. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.serverMessage ? err.serverMessage : fallback
}

interface HttpHooks {
  /** Token de la sesión actual (se envía como Bearer). */
  getToken: () => string | null
  /** La sesión ya no vale (401, token inválido o cuenta deshabilitada). */
  onUnauthorized: () => void
}

let hooks: HttpHooks = { getToken: () => null, onUnauthorized: () => {} }

/** La composición de la app conecta el cliente con la sesión (features/auth) sin que shared dependa de ella. */
export function configureHttp(next: Partial<HttpHooks>): void {
  hooks = { ...hooks, ...next }
}

// El cuerpo de error es `{ error: texto }` (API anterior) o `{ error: { code, message } }` (v1)
function errorFields(data: unknown): { message: string | null, code: string | null } {
  const error = data && typeof data === 'object' && 'error' in data ? data.error : null
  if (typeof error === 'string') return { message: error, code: null }
  if (error && typeof error === 'object') {
    const { message, code } = error as { message?: unknown, code?: unknown }
    return { message: typeof message === 'string' ? message : null, code: typeof code === 'string' ? code : null }
  }
  return { message: null, code: null }
}

function toApiError(err: unknown): ApiError {
  if (!axios.isAxiosError(err)) return new ApiError(err instanceof Error ? err.message : String(err), null, null)
  const { message, code } = errorFields(err.response?.data)
  return new ApiError(err.message, err.response?.status ?? null, message, code)
}

const api = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = hooks.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  (err: unknown) => {
    const apiError = toApiError(err)
    if (endsSession(apiError)) hooks.onUnauthorized()
    return Promise.reject(apiError)
  },
)

export type QueryParams = Record<string, string | number | boolean | null | undefined>
export type UploadProgress = (event: AxiosProgressEvent) => void

export interface UploadOptions {
  headers?: Record<string, string>
  onUploadProgress?: UploadProgress
}

/** Cliente de la API v1 con el token de la sesión. Devuelve directamente el cuerpo de la respuesta. */
export const http = {
  get: <T>(url: string, params?: QueryParams) => api.get<T>(url, { params }).then(r => r.data),
  getBlob: (url: string) => api.get<Blob>(url, { responseType: 'blob' }).then(r => r.data),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => api.post<T>(url, body, config).then(r => r.data),
  put: <T>(url: string, body?: unknown) => api.put<T>(url, body).then(r => r.data),
  patch: <T>(url: string, body?: unknown) => api.patch<T>(url, body).then(r => r.data),
  delete: <T>(url: string) => api.delete<T>(url).then(r => r.data),
  /** Subida de un archivo grande a la API (sin límite de tiempo, con progreso). */
  upload: (url: string, body: Blob, options: UploadOptions) =>
    api.put(url, body, { ...options, timeout: 0 }).then(() => undefined),
}

/** Subida a una URL externa (S3 prefirmada): va sin el token de la API. */
export const externalHttp = {
  upload: (url: string, body: Blob, options: UploadOptions) =>
    axios.put(url, body, { ...options, timeout: 0 }).then(() => undefined).catch((err: unknown) => Promise.reject(toApiError(err))),
}
