import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { EMPTY_LOCATION, toLocationInput, type Location, type LocationInput } from '../../domain/locations'
import { useSaveLocation } from '../../application/useLocations'

interface LocationFormModalProps {
  open: boolean
  onClose: () => void
  location: Location | null
}

export function LocationFormModal({ open, onClose, location }: LocationFormModalProps) {
  const isEdit = !!location
  const save = useSaveLocation()
  const isSaving = save.isPending

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LocationInput>()

  useEffect(() => {
    if (open) reset(location ? toLocationInput(location) : EMPTY_LOCATION)
  }, [open, location, reset])

  const onSubmit = async (input: LocationInput) => {
    try {
      await save.mutateAsync({ id: location?.id, input })
      onClose()
    } catch {
      // el toast de error lo muestra useSaveLocation
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="
          w-[calc(100vw-2rem)] max-w-md
          bg-background text-foreground
          border border-border
          shadow-2xl rounded-xl
          max-h-[90vh] overflow-y-auto
          z-300
        ">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-semibold">
            {isEdit ? 'Editar localidad' : 'Nueva localidad'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {isEdit
              ? 'Modifica los datos de la localidad y guarda los cambios.'
              : 'Agrega una nueva localidad al sistema.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">

          <div className="space-y-1.5">
            <Label htmlFor="municipality" className="text-sm font-medium">
              Municipio <span className="text-destructive">*</span>
            </Label>
            <Input
              id="municipality"
              disabled={isSaving}
              className="bg-background border-border"
              placeholder="Ej. Cúcuta"
              {...register('municipality', { required: 'Requerido' })}
            />
            {errors.municipality && <p className="text-xs text-destructive">{errors.municipality.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="department" className="text-sm font-medium">
              Departamento <span className="text-destructive">*</span>
            </Label>
            <Input
              id="department"
              disabled={isSaving}
              className="bg-background border-border"
              placeholder="Ej. Norte de Santander"
              {...register('department', { required: 'Requerido' })}
            />
            {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-sm font-medium">
              País
            </Label>
            <Input
              id="country"
              disabled={isSaving}
              className="bg-background border-border"
              {...register('country')}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="bg-background border-border">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving
                ? (isEdit ? 'Guardando...' : 'Creando...')
                : (isEdit ? 'Guardar cambios' : 'Crear localidad')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
