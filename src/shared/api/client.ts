import axios, { type AxiosProgressEvent, type AxiosRequestConfig } from 'axios'
import { env } from '@/shared/config/env'

/** Error de una llamada a la API: conserva el estado HTTP y el `error` que devuelve el backend. */
export class ApiError extends Error {
  readonly status: number | null
  readonly serverMessage: string | null

  constructor(message: string, status: number | null, serverMessage: string | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.serverMessage = serverMessage
  }
}

/** Mensaje del backend (`{ error }`) o el texto de respaldo. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.serverMessage ? err.serverMessage : fallback
}

interface HttpHooks {
  /** Token de la sesión actual (se envía como Bearer). */
  getToken: () => string | null
  /** La API respondió 401: la sesión ya no vale. */
  onUnauthorized: () => void
}

let hooks: HttpHooks = { getToken: () => null, onUnauthorized: () => {} }

/** La composición de la app conecta el cliente con la sesión (features/auth) sin que shared dependa de ella. */
export function configureHttp(next: Partial<HttpHooks>): void {
  hooks = { ...hooks, ...next }
}

function toApiError(err: unknown): ApiError {
  if (!axios.isAxiosError(err)) return new ApiError(err instanceof Error ? err.message : String(err), null, null)
  const data: unknown = err.response?.data
  const serverMessage = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : null
  return new ApiError(err.message, err.response?.status ?? null, serverMessage)
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
    // 401 = token vencido o inválido. Un 403 es "sin permiso para esto" (p. ej. una sesión de otro
    // instructor) y no cierra la sesión.
    if (axios.isAxiosError(err) && err.response?.status === 401) hooks.onUnauthorized()
    return Promise.reject(toApiError(err))
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
