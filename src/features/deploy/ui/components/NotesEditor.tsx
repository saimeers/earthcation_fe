import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Pencil, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { apiErrorMessage } from '@/shared/api/client'
import { useDeployActions } from '../../application/useDeploy'
import type { GameVersion } from '../../domain/deploy'

/** La nota de una versión: se lee y, con el lápiz, se corrige en el mismo lugar. */
export function NotesEditor({ v }: { v: GameVersion }) {
  const { editNotes } = useDeployActions()
  const [text, setText] = useState<string | null>(null)

  const save = () => {
    editNotes.mutate({ id: v.id, notes: (text ?? '').trim() }, {
      onSuccess: () => { toast.success(`Nota de la versión ${v.label} guardada`); setText(null) },
      onError: (err) => toast.error('No se pudo guardar la nota', { description: apiErrorMessage(err, 'Error desconocido') }),
    })
  }

  if (text === null) {
    return (
      <div className="flex items-start gap-1.5">
        {v.notes ? <p className="text-sm whitespace-pre-line">{v.notes}</p> : <p className="text-sm text-muted-foreground">Sin nota</p>}
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" aria-label={`Editar la nota de la versión ${v.label}`} onClick={() => setText(v.notes ?? '')}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        value={text} onChange={e => setText(e.target.value)} rows={3} maxLength={2000} disabled={editNotes.isPending} autoFocus
        aria-label={`Nota de la versión ${v.label}`}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={editNotes.isPending}><Check className="h-4 w-4" /> Guardar</Button>
        <Button size="sm" variant="ghost" onClick={() => setText(null)} disabled={editNotes.isPending}><X className="h-4 w-4" /> Cancelar</Button>
      </div>
    </div>
  )
}
