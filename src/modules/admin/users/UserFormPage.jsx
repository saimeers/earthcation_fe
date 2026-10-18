import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft, Loader2, Save, UserPlus, UserRound, KeyRound, Building2, Gamepad2, GraduationCap, ShieldCheck, Wrench,
  Mail, IdCard, CheckCircle2, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { userService } from '@/services/user.service'
import { useOrganizations } from '@/hooks/admin/useOrganizations'
import { useLocations } from '@/hooks/admin/useLocations'
import { LocationCombobox } from '@/modules/admin/components/LocationCombobox'

const ROLES = [
  { value: 'player',     label: 'Jugador',       icon: Gamepad2,      desc: 'Juega en Unity. Entra solo con su cédula.' },
  { value: 'instructor', label: 'Instructor',    icon: GraduationCap, desc: 'Dirige sesiones. Entra al panel con contraseña.' },
  { value: 'admin',      label: 'Administrador', icon: ShieldCheck,   desc: 'Acceso total al panel web.' },
  { value: 'developer',  label: 'Desarrollador', icon: Wrench,        desc: 'Publica versiones del juego y da soporte. Consulta el panel sin editar.' },
]
const NO_ORG = '__none__'
const EMPTY = { first_name: '', last_name: '', cedula: '', email: '', username: '', role: 'player', age: '', organization_id: '', location_id: '' }

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-xl border bg-card">
      <header className="flex items-start gap-3 border-b px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0"><Icon className="h-4 w-4" /></span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </header>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, required, error, hint, htmlFor, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

const inputCls = 'h-9 text-sm md:text-sm'

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

  const { register, handleSubmit, reset, control, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: EMPTY })

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
    } else if (!isEdit) {
      reset(EMPTY)
    }
  }, [isEdit, user, reset])

  const values = watch()
  const role = values.role
  const isStaff = role !== 'player'
  const org = (orgs ?? []).find(o => o.id === values.organization_id)
  const loc = (locations ?? []).find(l => l.id === values.location_id)
  const initials = [values.first_name?.[0], values.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  const onSubmit = async (data) => {
    // Vacíos → null para que el backend no intente validar '' como correo/edad/UUID
    const payload = {
      ...data,
      email: data.email?.trim() || null,
      username: data.username?.trim() || (isEdit ? undefined : data.cedula.trim()),
      age: data.age === '' || data.age == null ? null : Number(data.age),
      organization_id: data.organization_id || null,
      location_id: data.location_id || null,
    }
    try {
      if (isEdit) {
        await userService.update(id, payload)
        toast.success('Usuario actualizado correctamente')
      } else {
        const res = await userService.createByAdmin(payload)
        toast.success('Usuario creado', {
          description: data.role === 'player'
            ? 'Ya puede entrar al juego con su cédula.'
            : res.data?.email_sent
              ? 'Le enviamos un correo para que defina su contraseña.'
              : 'No se pudo enviar el correo — usa "¿Olvidaste tu contraseña?" para que defina una.',
        })
      }
      qc.invalidateQueries({ queryKey: ['users'] })
      navigate('/admin/users')
    } catch (err) {
      toast.error(isEdit ? 'Error al actualizar' : 'Error al crear', {
        description: err.response?.data?.error ?? 'Ocurrió un error inesperado',
      })
    }
  }

  const loading = isSubmitting || (isEdit && isLoadingUser)

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-10">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
          <Link to="/admin/users" aria-label="Volver"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Modifica los campos necesarios y guarda los cambios.' : 'Los campos con * son obligatorios. No se pide contraseña.'}
          </p>
        </div>
      </div>

      {isEdit && isLoadingUser ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
          <div className="space-y-5 min-w-0">
            <Section icon={UserRound} title="Datos personales" description="Como aparece en la base de datos de la ANM.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre" required htmlFor="first_name" error={errors.first_name?.message}>
                  <Input id="first_name" placeholder="Ana María" disabled={loading} className={inputCls} aria-invalid={!!errors.first_name}
                    {...register('first_name', { required: 'Escribe el nombre' })} />
                </Field>
                <Field label="Apellido" required htmlFor="last_name" error={errors.last_name?.message}>
                  <Input id="last_name" placeholder="Gómez" disabled={loading} className={inputCls} aria-invalid={!!errors.last_name}
                    {...register('last_name', { required: 'Escribe el apellido' })} />
                </Field>
                <Field label="Cédula" required htmlFor="cedula" error={errors.cedula?.message} hint="Es con lo que entra al juego.">
                  <div className="relative">
                    <IdCard className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="cedula" placeholder="1090123456" inputMode="numeric" disabled={loading} className={cn(inputCls, 'pl-8 font-mono')} aria-invalid={!!errors.cedula}
                      {...register('cedula', {
                        required: 'La cédula es obligatoria',
                        pattern: { value: /^\d{5,15}$/, message: 'Solo números, entre 5 y 15 dígitos' },
                      })} />
                  </div>
                </Field>
                <Field label="Edad" htmlFor="age" error={errors.age?.message}>
                  <Input id="age" type="number" placeholder="28" min={16} max={80} disabled={loading} className={inputCls} aria-invalid={!!errors.age}
                    {...register('age', {
                      min: { value: 16, message: 'Mínimo 16 años' },
                      max: { value: 80, message: 'Máximo 80 años' },
                    })} />
                </Field>
              </div>
            </Section>

            <Section icon={KeyRound} title="Acceso" description="Define qué puede hacer esta persona en Earthcation.">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div role="radiogroup" aria-label="Rol" className="grid gap-2.5 sm:grid-cols-2">
                    {ROLES.map(r => {
                      const on = field.value === r.value
                      return (
                        <button
                          key={r.value}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          disabled={loading}
                          onClick={() => field.onChange(r.value)}
                          className={cn(
                            'relative flex flex-col items-start justify-start rounded-xl border p-3.5 text-left transition-all',
                            on ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-foreground/20 hover:bg-muted/40',
                          )}>
                          {on && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                          <r.icon className={cn('h-5 w-5 mb-2', on ? 'text-primary' : 'text-muted-foreground')} />
                          <p className="text-sm font-semibold">{r.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{r.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Correo electrónico" required={isStaff} htmlFor="email" error={errors.email?.message}
                  hint={isStaff ? 'Le enviaremos un enlace para definir su contraseña.' : 'Opcional — puede ser el de la empresa.'}>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="ana@empresa.com" disabled={loading} className={cn(inputCls, 'pl-8')} aria-invalid={!!errors.email}
                      {...register('email', {
                        validate: v => (!isStaff || !!v?.trim()) || 'El correo es obligatorio para el personal del panel',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Formato de correo inválido' },
                      })} />
                  </div>
                </Field>
                <Field label="Nombre de usuario" htmlFor="username" error={errors.username?.message}
                  hint={isEdit ? undefined : 'Si lo dejas vacío se usa la cédula.'}>
                  <Input id="username" placeholder={values.cedula || 'ana_gomez'} disabled={loading} className={inputCls}
                    {...register('username', isEdit ? { required: 'El usuario no puede quedar vacío' } : {})} />
                </Field>
              </div>
            </Section>

            <Section icon={Building2} title="Organización y ubicación" description="Se usa para los reportes por mina y el mapa.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Organización">
                  <Controller
                    name="organization_id"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || NO_ORG} onValueChange={v => field.onChange(v === NO_ORG ? '' : v)} disabled={loading}>
                        <SelectTrigger className="h-9 w-full text-sm bg-background"><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                        <SelectContent position="popper" className="max-h-72 bg-popover border shadow-lg z-[200]">
                          <SelectItem value={NO_ORG} className="text-sm text-muted-foreground">Sin asignar</SelectItem>
                          <SelectSeparator />
                          {(orgs ?? []).filter(o => o.is_active !== false || o.id === field.value).map(o => (
                            <SelectItem key={o.id} value={o.id} className="text-sm">{o.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Municipio">
                  <Controller
                    name="location_id"
                    control={control}
                    render={({ field }) => (
                      <LocationCombobox locations={locations ?? []} value={field.value} onChange={field.onChange} disabled={loading} allowClear placeholder="Buscar municipio" />
                    )}
                  />
                </Field>
              </div>
            </Section>
          </div>

          {/* Resumen lateral */}
          <aside className="lg:sticky lg:top-20 space-y-4">
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
              <div className="px-5 pb-5 -mt-8 space-y-3">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-xl font-bold ring-4 ring-card shadow-sm border">{initials}</span>
                <div>
                  <p className="font-semibold text-base leading-tight">{[values.first_name, values.last_name].filter(Boolean).join(' ') || 'Nombre del usuario'}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{values.cedula ? `CC ${values.cedula}` : 'Sin cédula'}</p>
                </div>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Rol</dt><dd className="font-medium">{ROLES.find(r => r.value === role)?.label}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Usuario</dt><dd className="font-medium truncate">{values.username || values.cedula || '—'}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Organización</dt><dd className="font-medium truncate text-right">{org?.name ?? '—'}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Municipio</dt><dd className="font-medium truncate text-right">{loc ? `${loc.municipality}, ${loc.department}` : '—'}</dd></div>
                </dl>
              </div>
            </div>

            {!isEdit && (
              <div className="rounded-xl border bg-muted/40 p-4 flex gap-2.5">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isStaff
                    ? 'Al guardar se genera una contraseña temporal y le llega un correo para definir la suya.'
                    : 'Al guardar ya puede entrar al juego escribiendo su cédula. No necesita contraseña ni correo.'}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={loading} className="h-10 text-sm">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isEdit ? <Save className="h-4 w-4 mr-1.5" /> : <UserPlus className="h-4 w-4 mr-1.5" />}
                {loading ? (isEdit ? 'Guardando…' : 'Creando…') : (isEdit ? 'Guardar cambios' : 'Crear usuario')}
              </Button>
              <Button type="button" variant="ghost" asChild disabled={loading} className="h-9 text-sm">
                <Link to="/admin/users">Cancelar</Link>
              </Button>
            </div>
          </aside>
        </form>
      )}
    </div>
  )
}
