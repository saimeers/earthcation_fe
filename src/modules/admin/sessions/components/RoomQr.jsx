import { useRef, useState } from 'react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { Check, Copy, Download, Maximize2, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { roomLink } from '@/lib/playUrl'

/** QR pequeño para documentos impresos (informe). */
export function RoomQrPrint({ code, size = 96 }) {
  if (!code) return null
  return <QRCodeSVG value={roomLink(code)} size={size} level="M" marginSize={1} />
}

/** Botón que abre el QR grande (para proyectar en clase), con descargar PNG y copiar enlace. */
export function RoomQrButton({ code, name, variant = 'outline', size = 'sm', label = 'QR de la sala', className }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const canvasWrap = useRef(null)
  if (!code) return null
  const link = roomLink(code)

  const download = () => {
    const canvas = canvasWrap.current?.querySelector('canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `sala-${code}.png`
    a.click()
  }
  const copy = () => {
    navigator.clipboard?.writeText(link)
    setCopied(true)
    toast.success('Enlace copiado')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        <QrCode className="h-4 w-4 mr-1.5" /> {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg bg-background border border-border shadow-2xl z-[300]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Maximize2 className="h-4 w-4" /> Únete a la sala</DialogTitle>
            <DialogDescription>
              Escanea con el celular: el juego se abre con la sala {code}{name ? ` (${name})` : ''} ya puesta.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {/* Fondo blanco siempre: un QR sobre fondo oscuro cuesta leerlo a muchos lectores */}
            <div ref={canvasWrap} className="rounded-2xl bg-white p-4 shadow-inner">
              <QRCodeCanvas value={link} size={320} level="M" marginSize={2} />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Código de sala</p>
              <p className="font-mono text-5xl font-bold tracking-[0.2em] text-primary pl-[0.2em]">{code}</p>
              <p className="mt-1 text-xs text-muted-foreground break-all">{link}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copy}>
                {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />} Copiar enlace
              </Button>
              <Button size="sm" onClick={download}>
                <Download className="h-4 w-4 mr-1.5" /> Descargar PNG
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
