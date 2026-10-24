import JSZip from 'jszip'
import type { DeployStatusDto, GameVersionDto, UploadTicketDto } from '@/shared/api/types'

export type GameVersion = GameVersionDto
export type DeployStatus = DeployStatusDto
export type UploadTicket = UploadTicketDto

export type Compression = 'brotli' | 'gzip' | 'fallback' | 'none'

export const COMPRESSION_LABEL: Record<Compression, string> = {
  brotli: 'Brotli', gzip: 'Gzip', fallback: 'Fallback (JS)', none: 'Sin compresión',
}

/** Nombre en español de la compresión del manifiesto (campo libre en el backend). */
export const compressionLabel = (c: string | null | undefined): string =>
  (c && c in COMPRESSION_LABEL ? COMPRESSION_LABEL[c as Compression] : c ?? '—')

export interface BuildCheck {
  errors: string[]
  warnings: string[]
  compression?: Compression
  productVersion?: string | null
  files: number
}

/**
 * Revisa en el navegador, antes de subirlo, que el ZIP sea un build WebGL de Unity. Mismas reglas
 * que la API (`deploy.service.js#inspectBuild`), para avisar sin esperar la publicación.
 */
export async function checkBuild(file: Blob): Promise<BuildCheck> {
  let zip
  try {
    zip = await JSZip.loadAsync(file)
  } catch {
    return { errors: ['El archivo no es un ZIP válido'], warnings: [], files: 0 }
  }
  const names = Object.values(zip.files).filter(f => !f.dir && !f.name.startsWith('__MACOSX/')).map(f => f.name)
  const index = names
    .filter(n => n.toLowerCase() === 'index.html' || n.toLowerCase().endsWith('/index.html'))
    .sort((a, b) => a.length - b.length)[0]
  if (!index) return { errors: ['El ZIP no tiene index.html: comprime la carpeta del build WebGL'], warnings: [], files: names.length }

  const root = index.slice(0, -'index.html'.length)
  const rel = names.filter(n => n.startsWith(root)).map(n => n.slice(root.length))
  const build = rel.filter(p => p.startsWith('Build/'))
  const has = (re: RegExp) => build.some(p => re.test(p))

  const errors: string[] = []
  const missing = (
    [
      [/\.loader\.js$/i, 'loader (.loader.js)'],
      [/\.framework\.js(\.br|\.gz|\.unityweb)?$/i, 'framework'],
      [/\.wasm(\.br|\.gz|\.unityweb)?$/i, 'wasm'],
      [/\.data(\.br|\.gz|\.unityweb)?$/i, 'data'],
    ] as const
  ).filter(([re]) => !has(re)).map(([, name]) => name)
  if (missing.length) errors.push(`Al build le falta: ${missing.join(', ')} en la carpeta Build/`)

  const compression: Compression = has(/\.br$/i) ? 'brotli' : has(/\.gz$/i) ? 'gzip' : has(/\.unityweb$/i) ? 'fallback' : 'none'
  const warnings: string[] = []
  if (compression === 'none') warnings.push('Build sin compresión: los jugadores descargan unas 3 veces más. Usa Brotli.')
  if (compression === 'fallback') warnings.push('Build con "Decompression Fallback": más lento de abrir. Desactívalo y usa Brotli.')
  if (rel.includes('ServiceWorker.js') || rel.includes('manifest.webmanifest')) {
    warnings.push('Build con plantilla PWA: su Service Worker puede dejar a los jugadores en una versión vieja. Usa la plantilla Earthcation.')
  }

  const entry = zip.file(index)
  const html = entry ? await entry.async('string') : ''
  const productVersion = /productVersion:\s*["']([^"']+)["']/.exec(html)?.[1] ?? null
  return { errors, warnings, compression, productVersion, files: rel.length }
}

export const activeVersion = (versions: GameVersion[] | undefined): GameVersion | undefined => versions?.find(v => v.is_active)

export const isPublishing = (versions: GameVersion[] | undefined): boolean => versions?.some(v => v.status === 'processing') ?? false

/** Quién subió la versión. Sin autor la subió el CI del juego (GitHub Actions) con el token de despliegue. */
export const uploaderName = (v: Pick<GameVersion, 'uploader'>): string => {
  if (!v.uploader) return 'subida por el CI'
  return `${v.uploader.first_name ?? ''} ${v.uploader.last_name ?? ''}`.trim() || 'sin nombre'
}
