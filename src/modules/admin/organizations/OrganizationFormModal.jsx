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
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { ORG_TYPES } from './constants'
import { useOrganizations } from '../../../hooks/admin/useOrganizations'

export function OrganizationFormModal({ open, onClose, organization }) {
  const isEdit = !!organization
  const { saveOrg } = useOrganizations()

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors, isSubmitting } 
  } = useForm()

  // Observamos el valor del tipo para que el Select lo pueda mostrar
  const selectedType = watch('type', '')

  useEffect(() => {
    // Registramos el campo manualmente para que la validación funcione correctamente
    register('type', { required: 'Debes seleccionar un tipo' })
    
    if (open) {
      reset(isEdit 
        ? { name: organization.name, type: organization.type ?? '' }
        : { name: '', type: '' }
      )
    }
  }, [open, organization, isEdit, reset, register])

  const onSubmit = async (data) => {
    try {
      await saveOrg({ id: organization?.id, data, isEdit })
      onClose()
    } catch (err) {
      // El error ya es manejado por el toast en el hook useOrganizations
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
            {isEdit ? 'Editar organización' : 'Nueva organización'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {isEdit
              ? 'Modifica los datos de la organización y guarda los cambios.'
              : 'Registra una nueva organización en el sistema.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="name"
              disabled={isSubmitting} 
              className="bg-background border-border"
              placeholder="Ej. TechCorp S.A."
              {...register('name', { required: 'Requerido' })} 
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Tipo <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={val => setValue('type', val, { shouldValidate: true })}
              disabled={isSubmitting}>
              <SelectTrigger className="bg-background border-border capitalize">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent className="z-400 bg-popover border border-border shadow-xl">
                {ORG_TYPES.map(t => (
                  <SelectItem key={t} value={t} className="text-sm cursor-pointer capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="bg-background border-border">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting
                ? (isEdit ? 'Guardando...' : 'Creando...')
                : (isEdit ? 'Guardar cambios' : 'Crear organización')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}