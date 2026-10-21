/** Descarga un Blob con el nombre dado (enlace temporal). */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Descarga lo que hay dibujado en un canvas como PNG. */
export function saveCanvasPng(canvas: HTMLCanvasElement, filename: string): void {
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = filename
  a.click()
}
