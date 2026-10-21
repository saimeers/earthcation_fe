import { useRef, useState } from 'react'
import { Loader2, Upload, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/shared/ui/button'

/** Paso 1: arrastrar o elegir el Excel ANM. */
export function ImportDropzone({ isParsing, onFile }: { isParsing: boolean, onFile: (file: File | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragActive(true) }}
      onDragLeave={() => setDragActive(false)}
      onDrop={e => { e.preventDefault(); setDragActive(false); onFile(e.dataTransfer.files?.[0]) }}
      className={`
            rounded-xl border-2 border-dashed p-8 sm:p-16 flex flex-col items-center justify-center gap-4
            text-center transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}
          `}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {isParsing ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileSpreadsheet className="h-6 w-6" />}
      </div>

      <div className="space-y-1">
        <p className="font-medium">
          {isParsing ? 'Leyendo archivo...' : 'Arrastra el Excel aquí o selecciónalo'}
        </p>
        <p className="text-sm text-muted-foreground">Formato .xlsx / .xls — Base de Datos Anual ANM</p>
      </div>

      <Button type="button" disabled={isParsing} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4 mr-1.5" />
        Seleccionar archivo
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={e => onFile(e.target.files?.[0])}
        disabled={isParsing}
        className="hidden"
      />
    </div>
  )
}
