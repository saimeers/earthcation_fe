import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { useLocations } from '@/hooks/admin/useLocations' // Ajusta la ruta si es necesario

export function LocationFormModal({ open, onClose, location }) {
  const isEdit = !!location
  const { saveLocation, isSaving } = useLocations()

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (open) {
      reset(isEdit 
        ? { 
            municipality: location.municipality, 
            department: location.department, 
            country: location.country 
          }
        : { municipality: '', department: '', country: 'Colombia' }
      )
    }
  }, [open, location, isEdit, reset])

  const onSubmit = async (data) => {
    try {
      await saveLocation({ id: location?.id, data, isEdit })
      onClose()
    } catch {
      // El error ya es manejado por el toast en el hook
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