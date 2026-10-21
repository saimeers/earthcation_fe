import JSZip from 'jszip'
import { describe, it, expect } from 'vitest'
import { activeVersion, checkBuild, isPublishing, type GameVersion } from './deploy'

const zipOf = async (entries: Record<string, string>): Promise<Blob> => {
  const zip = new JSZip()
  Object.entries(entries).forEach(([name, content]) => zip.file(name, content))
  return zip.generateAsync({ type: 'blob' })
}

const INDEX_HTML = '<html><script>var buildUrl = "Build"; var config = { productVersion: "1.4.0" };</script></html>'

describe('revisión del build antes de subirlo', () => {
  it('rechaza un archivo que no es un ZIP', async () => {
    const result = await checkBuild(new Blob(['no soy un zip']))
    expect(result.errors).toEqual(['El archivo no es un ZIP válido'])
  })

  it('rechaza un ZIP sin index.html', async () => {
    const zip = await zipOf({ 'Build/game.wasm': 'x' })
    const result = await checkBuild(zip)
    expect(result.errors[0]).toMatch(/no tiene index\.html/)
  })

  it('avisa los archivos del build que faltan', async () => {
    const zip = await zipOf({ 'index.html': INDEX_HTML, 'Build/game.loader.js': 'x' })
    const result = await checkBuild(zip)
    expect(result.errors[0]).toMatch(/framework.*wasm.*data|loader/)
  })

  it('build completo sin compresión: avisa pero no es error', async () => {
    const zip = await zipOf({
      'index.html': INDEX_HTML,
      'Build/game.loader.js': 'x',
      'Build/game.framework.js': 'x',
      'Build/game.wasm': 'x',
      'Build/game.data': 'x',
    })
    const result = await checkBuild(zip)
    expect(result.errors).toEqual([])
    expect(result.compression).toBe('none')
    expect(result.warnings.some(w => w.includes('Brotli'))).toBe(true)
    expect(result.productVersion).toBe('1.4.0')
  })

  it('build con Brotli: sin avisos de compresión', async () => {
    const zip = await zipOf({
      'index.html': INDEX_HTML,
      'Build/game.loader.js': 'x',
      'Build/game.framework.js.br': 'x',
      'Build/game.wasm.br': 'x',
      'Build/game.data.br': 'x',
    })
    const result = await checkBuild(zip)
    expect(result.errors).toEqual([])
    expect(result.compression).toBe('brotli')
    expect(result.warnings).toEqual([])
  })

  it('avisa la plantilla PWA', async () => {
    const zip = await zipOf({
      'index.html': INDEX_HTML,
      'Build/game.loader.js.br': 'x',
      'Build/game.framework.js.br': 'x',
      'Build/game.wasm.br': 'x',
      'Build/game.data.br': 'x',
      'ServiceWorker.js': 'x',
    })
    const result = await checkBuild(zip)
    expect(result.warnings.some(w => w.includes('PWA'))).toBe(true)
  })
})

describe('versiones del juego', () => {
  const v = (id: string, status: GameVersion['status'], is_active = false): GameVersion =>
    ({ id, label: id, notes: null, status, is_active, size_bytes: null, error: null, created_at: '2026-01-01', activated_at: null })

  it('versión activa y si hay alguna publicándose', () => {
    const versions = [v('a', 'ready'), v('b', 'ready', true), v('c', 'processing')]
    expect(activeVersion(versions)?.id).toBe('b')
    expect(isPublishing(versions)).toBe(true)
    expect(isPublishing([v('a', 'ready')])).toBe(false)
    expect(isPublishing(undefined)).toBe(false)
  })
})
