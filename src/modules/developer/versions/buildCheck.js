import JSZip from 'jszip'

/**
 * Revisa en el navegador, antes de subirlo, que el ZIP sea un build WebGL de Unity.
 * Mismas reglas que la API (deploy.service.js#inspectBuild), para avisar sin esperar la publicación.
 * @returns {Promise<{ errors: string[], warnings: string[], compression: string, productVersion: string|null, files: number }>}
 */
export async function checkBuild(file) {
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
  const has = (re) => build.some(p => re.test(p))

  const errors = []
  const missing = [
    [/\.loader\.js$/i, 'loader (.loader.js)'],
    [/\.framework\.js(\.br|\.gz|\.unityweb)?$/i, 'framework'],
    [/\.wasm(\.br|\.gz|\.unityweb)?$/i, 'wasm'],
    [/\.data(\.br|\.gz|\.unityweb)?$/i, 'data'],
  ].filter(([re]) => !has(re)).map(([, name]) => name)
  if (missing.length) errors.push(`Al build le falta: ${missing.join(', ')} en la carpeta Build/`)

  const compression = has(/\.br$/i) ? 'brotli' : has(/\.gz$/i) ? 'gzip' : has(/\.unityweb$/i) ? 'fallback' : 'none'
  const warnings = []
  if (compression === 'none') warnings.push('Build sin compresión: los jugadores descargan unas 3 veces más. Usa Brotli.')
  if (compression === 'fallback') warnings.push('Build con "Decompression Fallback": más lento de abrir. Desactívalo y usa Brotli.')
  if (rel.includes('ServiceWorker.js') || rel.includes('manifest.webmanifest')) {
    warnings.push('Build con plantilla PWA: su Service Worker puede dejar a los jugadores en una versión vieja. Usa la plantilla Earthcation.')
  }

  const html = await zip.file(index).async('string')
  const productVersion = html.match(/productVersion:\s*["']([^"']+)["']/)?.[1] ?? null
  return { errors, warnings, compression, productVersion, files: rel.length }
}
