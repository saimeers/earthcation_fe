import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Save, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { userService } from '@/services/user.service'
import { useOrganizations } from '@/hooks/admin/useOrganizations'
import { useLocations } from '@/hooks/admin/useLocations'

const ROLES = [
  { value: 'player',     label: 'Jugador'        },
  { value: 'instructor', label: 'Instructor'     },
  { value: 'admin',      label: 'Administrador'  },
]

export function UserFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id).then(r => r.data),
    enabled: isEdit,
  })

  const { orgs } = useOrganizations()
  const { locations } = useLocations()

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const role = watch('role', 'player')
  const organizationId = watch('organization_id', '')
  const locationId = watch('location_id', '')
  const [department, setDepartment] = useState('')

  const departments = useMemo(
    () => [...new Set((locations ?? []).map(l => l.department))].sort(),
    [locations]
  )
  const municipalitiesInDept = useMemo(
    () => (locations ?? []).filter(l => l.department === department),
    [locations, department]
  )

  useEffect(() => {
    if (isEdit && user) {
      reset({
        first_name: user.first_name ?? '',
        last_name:  user.last_name  ?? '',
        cedula:     user.cedula     ?? '',
        email:      user.email      ?? '',
        username:   user.username   ?? '',
        role:       user.role       ?? 'player',
        age:        user.age        ?? '',
        organization_id: user.profile?.organization_id ?? '',
        location_id:     user.profile?.location_id     ?? '',
      })
      setDepartment(user.profile?.location?.department ?? '')
    } else if (!isEdit) {
      reset({ first_name: '', last_name: '', cedula: '', email: '', username: '', role: 'player', age: '', organization_id: '', location_id: '' })
      setDepartment('')
    }
  }, [isEdit, user, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await userService.update(id, data)
        toast.success('Usuario actualizado correctamente')
      } else {
        await userService.createByAdmin(data)
        toast.success('Usuario creado', {
          description: 'Ya puede iniciar sesión en el juego con su cédula.',
        })
      }
      qc.invalidateQueries(['users', 'all'])
      navigate('/admin/users')
    } catch (err) {
      toast.error(isEdit ? 'Error al actualizar' : 'Error al crear', {
        description: err.response?.data?.error ?? 'Ocurrió un error inesperado',
      })
    }
  }

  const loading = isSubmitting || (isEdit && isLoadingUser)

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
          <Link to="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? 'Modifica los campos necesarios y guarda los cambios.'
              : 'El usuario ingresa al juego solo con su cédula — no se necesita contraseña.'}
          </p>
        </div>
      </div>

      {isEdit && isLoadingUser ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className="text-sm font-medium">
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    placeholder="Ana"
                    disabled={loading}
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
                    {...register('last_name', { required: 'Requerido' })}
                  />
                  {errors.last_name &&
                    <p className="text-xs text-destructive">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cedula" className="text-sm font-medium">
                    Cédula <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cedula"
                    placeholder="1234567890"
                    inputMode="numeric"
                    disabled={loading}
                    className="font-mono"
                    {...register('cedula', { required: 'Requerido' })}
                  />
                  {errors.cedula &&
                    <p className="text-xs text-destructive">{errors.cedula.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Usuario <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    placeholder="ana_gomez"
                    disabled={loading}
                    {...register('username', { required: 'Requerido' })}
                  />
                  {errors.username &&
                    <p className="text-xs text-destructive">{errors.username.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ana@ejemplo.com"
                  disabled={loading}
                  {...register('email', {
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Formato de correo inválido' },
                  })}
                />
                {errors.email &&
                  <p className="text-xs text-destructive">{errors.email.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Opcional — no necesita ser único, varios trabajadores pueden compartir el mismo correo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Rol</Label>
                  <Select
                    value={role}
                    onValueChange={val => setValue('role', val)}
                    disabled={loading}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent className="z-200 bg-popover border border-border shadow-lg">
                      {ROLES.map(r => (
                        <SelectItem key={r.value} value={r.value} className="text-sm cursor-pointer">
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    {...register('age', {
                      min: { value: 16, message: 'Mínimo 16 años' },
                      max: { value: 80, message: 'Máximo 80 años' },
                    })}
                  />
                  {errors.age &&
                    <p className="text-xs text-destructive">{errors.age.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Organización</Label>
                <Select
                  value={organizationId || undefined}
                  onValueChange={val => setValue('organization_id', val)}
                  disabled={loading}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent className="z-200 bg-popover border border-border shadow-lg">
                    {(orgs ?? []).map(o => (
                      <SelectItem key={o.id} value={o.id} className="text-sm cursor-pointer">{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Departamento</Label>
                  <Select
                    value={department || undefined}
                    onValueChange={val => { setDepartment(val); setValue('location_id', '') }}
                    disabled={loading}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Selecciona un departamento" />
                    </SelectTrigger>
                    <SelectContent className="z-200 bg-popover border border-border shadow-lg max-h-72">
                      {departments.map(d => (
                        <SelectItem key={d} value={d} className="text-sm cursor-pointer">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Municipio</Label>
                  <Select
                    value={locationId || undefined}
                    onValueChange={val => setValue('location_id', val)}
                    disabled={loading || !department}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder={department ? 'Selecciona un municipio' : 'Elige un departamento primero'} />
                    </SelectTrigger>
                    <SelectContent className="z-200 bg-popover border border-border shadow-lg max-h-72">
                      {municipalitiesInDept.map(l => (
                        <SelectItem key={l.id} value={l.id} className="text-sm cursor-pointer">{l.municipality}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isEdit && (
                <div className="rounded-lg bg-muted border border-border px-3 py-2.5">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {role === 'player'
                      ? 'No se pide contraseña — el jugador entra al juego con su cédula únicamente.'
                      : 'Se genera una contraseña temporal y se envía por correo — la necesita para entrar al panel web. La cédula y el usuario deben ser únicos.'}
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                <Button type="button" variant="outline" asChild disabled={loading}>
                  <Link to="/admin/users">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : isEdit ? <Save className="h-4 w-4 mr-1.5" /> : <UserPlus className="h-4 w-4 mr-1.5" />}
                  {loading
                    ? (isEdit ? 'Guardando...' : 'Creando...')
                    : (isEdit ? 'Guardar cambios' : 'Crear usuario')}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
