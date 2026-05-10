import { useEffect, useState }    from 'react'
import { useForm }                from 'react-hook-form'
import { useQueryClient }         from '@tanstack/react-query'
import { toast }                  from 'sonner'
import { Loader2 }                from 'lucide-react'
import { Button }                 from '@/components/ui/button'
import { Input }                  from '@/components/ui/input'
import { Label }                  from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { userService } from '@/services/user.service'

const ROLES = [
  { value: 'player',     label: 'Jugador'        },
  { value: 'instructor', label: 'Instructor'     },
  { value: 'admin',      label: 'Administrador'  },
]

export function UserFormModal({ open, onClose, user }) {
  const isEdit    = !!user
  const qc        = useQueryClient()
  const [loading, setLoading] = useState(false)

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors },
  } = useForm()

  const role = watch('role', 'player')

  useEffect(() => {
    if (open) {
      reset(isEdit
        ? {
            first_name: user.first_name ?? '',
            last_name:  user.last_name  ?? '',
            cedula:     user.cedula     ?? '',
            email:      user.email      ?? '',
            username:   user.username   ?? '',
            role:       user.role       ?? 'player',
            age:        user.age        ?? '',
          }
        : { first_name: '', last_name: '', cedula: '', email: '', username: '', role: 'player', age: '' }
      )
    }
  }, [open, user, isEdit, reset])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEdit) {
        await userService.update(user.id, data)
        toast.success('Usuario actualizado correctamente')
      } else {
        await userService.createByAdmin(data)
        toast.success('Usuario creado', {
          description: 'Se envió un correo con las credenciales temporales.',
        })
      }
      qc.invalidateQueries(['users', 'all'])
      onClose()
    } catch (err) {
      toast.error(isEdit ? 'Error al actualizar' : 'Error al crear', {
        description: err.response?.data?.error ?? 'Ocurrió un error inesperado',
      })
    } finally {
      setLoading(false)
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
          z-[300]
        ">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-semibold">
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {isEdit
              ? 'Modifica los campos necesarios y guarda los cambios.'
              : 'Completa el formulario. El usuario recibirá un correo con su contraseña temporal.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">

          {/* Nombre y apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first_name" className="text-sm font-medium">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="first_name"
                placeholder="Ana"
                disabled={loading}
                className="bg-background border-border"
                {...register('first_name', { required: 'Requerido' })}
              />
              {errors.first_name &&
                <p className="text-xs text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name" className="text-sm font-medium">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="last_name"
                placeholder="Gómez"
                disabled={loading}
                className="bg-background border-border"
                {...register('last_name', { required: 'Requerido' })}
              />
              {errors.last_name &&
                <p className="text-xs text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>

          {/* Cédula */}
          <div className="space-y-1.5">
            <Label htmlFor="cedula" className="text-sm font-medium">
              Cédula <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cedula"
              placeholder="1234567890"
              inputMode="numeric"
              disabled={loading}
              className="bg-background border-border font-mono"
              {...register('cedula', { required: 'Requerido' })}
            />
            {errors.cedula &&
              <p className="text-xs text-destructive">{errors.cedula.message}</p>}
          </div>

          {/* Correo */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Correo electrónico <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ana@ejemplo.com"
              disabled={loading}
              className="bg-background border-border"
              {...register('email', {
                required: 'Requerido',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Formato de correo inválido' },
              })}
            />
            {errors.email &&
              <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {/* Usuario y edad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">
                Usuario <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                placeholder="ana_gomez"
                disabled={loading}
                className="bg-background border-border"
                {...register('username', { required: 'Requerido' })}
              />
              {errors.username &&
                <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age" className="text-sm font-medium">Edad</Label>
              <Input
                id="age"
                type="number"
                placeholder="28"
                min={16}
                max={80}
                disabled={loading}
                className="bg-background border-border"
                {...register('age', {
                  min: { value: 16, message: 'Mínimo 16 años' },
                  max: { value: 80, message: 'Máximo 80 años' },
                })}
              />
              {errors.age &&
                <p className="text-xs text-destructive">{errors.age.message}</p>}
            </div>
          </div>

          {/* Rol */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Rol</Label>
            <Select
              value={role}
              onValueChange={val => setValue('role', val)}
              disabled={loading}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent className="z-[400] bg-popover border border-border shadow-xl">
                {ROLES.map(r => (
                  <SelectItem key={r.value} value={r.value} className="text-sm cursor-pointer">
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nota para creación */}
          {!isEdit && (
            <div className="rounded-lg bg-muted border border-border px-3 py-2.5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Se generará una contraseña temporal y se enviará al correo junto
                con un enlace para que el usuario establezca su propia contraseña.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              className="bg-background border-border"
              onClick={onClose}
              disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? (isEdit ? 'Guardando...' : 'Creando...')
                : (isEdit ? 'Guardar cambios' : 'Crear usuario')}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}