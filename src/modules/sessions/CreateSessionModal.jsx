import { useForm }     from 'react-hook-form'
import { Button }      from '../../components/ui/button'
import { Input }       from '../../components/ui/input'
import { Label }       from '../../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription }
                       from '../../components/ui/dialog'
import { useCreateSession } from '../../hooks/useSession'

export function CreateSessionModal({ open, onClose }) {
  const { register, handleSubmit, reset } = useForm()
  const createSession = useCreateSession()

  const onSubmit = (data) => {
    createSession.mutate(data, {
      onSuccess: () => { reset(); onClose() }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva sesión</DialogTitle>
          <DialogDescription>
            Crea una sesión de capacitación para tus jugadores
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Nombre de la sesión</Label>
            <Input placeholder="Capacitación Nivel 1 — Enero"
              {...register('name', { required: true })} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createSession.isPending}>
              {createSession.isPending ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}