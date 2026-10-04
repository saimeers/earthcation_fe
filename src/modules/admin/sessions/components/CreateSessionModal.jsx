import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { CalendarPlus, Loader2 } from 'lucide-react'
import { useCreateSession } from '@/hooks/admin/useSessions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { LocationCombobox } from '@/modules/admin/components/LocationCombobox'

export function CreateSessionModal({ open, onClose, locations = [] }) {
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', location_id: '' },
  })
  const createSession = useCreateSession()

  // Al cerrar (cancelar o crear) el formulario vuelve a quedar limpio
  useEffect(() => { if (!open) reset({ name: '', location_id: '' }) }, [open, reset])

  const onSubmit = async (data) => {
    try {
      await createSession.mutateAsync(data)
      onClose()
    } catch {
      // el toast de error lo muestra useCreateSession
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-background border border-border shadow-2xl z-[300] p-0 gap-0 overflow-hidden">
        <DialogHeader className="flex-row items-start gap-3 px-5 pt-5 pb-4 border-b bg-muted/30">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <CalendarPlus className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <DialogTitle className="text-base font-semibold">Nueva sesión</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Se genera un código de 3 dígitos para que los jugadores se unan desde el juego.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="session-name" className="text-sm font-medium">Nombre de la sesión</Label>
            <Input
              id="session-name"
              placeholder="Capacitación Nivel 1 — Mayo"
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              className="h-9 text-sm"
              {...register('name', { required: 'Escribe un nombre para la sesión', validate: v => v.trim().length > 2 || 'El nombre es muy corto' })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Localidad</Label>
            <Controller
              name="location_id"
              control={control}
              rules={{ required: 'Elige el municipio donde se realiza la capacitación' }}
              render={({ field }) => (
                <LocationCombobox
                  locations={locations}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  invalid={!!errors.location_id}
                  placeholder="Buscar municipio o departamento"
                />
              )}
            />
            {errors.location_id && <p className="text-xs text-destructive">{errors.location_id.message}</p>}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
            <Button type="button" variant="outline" className="h-9 px-4" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="h-9 px-4" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {isSubmitting ? 'Creando…' : 'Crear sesión'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
