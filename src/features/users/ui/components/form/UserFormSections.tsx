import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import {
  UserRound, KeyRound, Building2, Gamepad2, GraduationCap, ShieldCheck, Wrench, Mail, IdCard, CheckCircle2, type LucideIcon,
} from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { LocationCombobox, type Location } from '@/features/locations'
import { selectableOrganizations, type Organization } from '@/features/organizations'
import { CEDULA_PATTERN, EMAIL_PATTERN, ROLE_TITLES, type Role, type UserForm } from '../../../domain/users'
import { Field, FormSection, inputCls } from './FormLayout'

const ROLE_CARDS: { value: Role, icon: LucideIcon, desc: string }[] = [
  { value: 'player', icon: Gamepad2, desc: 'Juega en Unity. Entra solo con su cédula.' },
  { value: 'instructor', icon: GraduationCap, desc: 'Dirige sesiones. Entra al panel con contraseña.' },
  { value: 'admin', icon: ShieldCheck, desc: 'Acceso total al panel web.' },
  { value: 'developer', icon: Wrench, desc: 'Publica versiones del juego y da soporte. Consulta el panel sin editar.' },
]
const NO_ORG = '__none__'

interface SectionProps {
  register: UseFormRegister<UserForm>
  control: Control<UserForm>
  errors: FieldErrors<UserForm>
  loading: boolean
}

export function PersonalSection({ register, errors, loading }: Omit<SectionProps, 'control'>) {
  return (
    <FormSection icon={UserRound} title="Datos personales" description="Como aparece en la base de datos de la ANM.">
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
                pattern: { value: CEDULA_PATTERN, message: 'Solo números, entre 5 y 15 dígitos' },
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
    </FormSection>
  )
}

function RolePicker({ value, onChange, loading }: { value: Role, onChange: (role: Role) => void, loading: boolean }) {
  return (
    <div role="radiogroup" aria-label="Rol" className="grid gap-2.5 sm:grid-cols-2">
      {ROLE_CARDS.map(r => {
        const on = value === r.value
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={loading}
            onClick={() => onChange(r.value)}
            className={cn(
              'relative flex flex-col items-start justify-start rounded-xl border p-3.5 text-left transition-all',
              on ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-foreground/20 hover:bg-muted/40',
            )}>
            {on && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />}
            <r.icon className={cn('h-5 w-5 mb-2', on ? 'text-primary' : 'text-muted-foreground')} />
            <p className="text-sm font-semibold">{ROLE_TITLES[r.value]}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{r.desc}</p>
          </button>
        )
      })}
    </div>
  )
}

interface AccessSectionProps extends SectionProps {
  isEdit: boolean
  isStaff: boolean
  cedula: string
}

export function AccessSection({ register, control, errors, loading, isEdit, isStaff, cedula }: AccessSectionProps) {
  return (
    <FormSection icon={KeyRound} title="Acceso" description="Define qué puede hacer esta persona en Earthcation.">
      <Controller name="role" control={control} render={({ field }) => <RolePicker value={field.value} onChange={field.onChange} loading={loading} />} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Correo electrónico" required={isStaff} htmlFor="email" error={errors.email?.message}
          hint={isStaff ? 'Le enviaremos un enlace para definir su contraseña.' : 'Opcional — puede ser el de la empresa.'}>
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="ana@empresa.com" disabled={loading} className={cn(inputCls, 'pl-8')} aria-invalid={!!errors.email}
              {...register('email', {
                validate: v => (!isStaff || !!v?.trim()) || 'El correo es obligatorio para el personal del panel',
                pattern: { value: EMAIL_PATTERN, message: 'Formato de correo inválido' },
              })} />
          </div>
        </Field>
        <Field label="Nombre de usuario" htmlFor="username" error={errors.username?.message}
          hint={isEdit ? undefined : 'Si lo dejas vacío se usa la cédula.'}>
          <Input id="username" placeholder={cedula || 'ana_gomez'} disabled={loading} className={inputCls}
            {...register('username', isEdit ? { required: 'El usuario no puede quedar vacío' } : {})} />
        </Field>
      </div>
    </FormSection>
  )
}

interface PlaceSectionProps extends Pick<SectionProps, 'control' | 'loading'> {
  orgs: Organization[]
  locations: Location[]
}

export function PlaceSection({ control, loading, orgs, locations }: PlaceSectionProps) {
  return (
    <FormSection icon={Building2} title="Organización y ubicación" description="Se usa para los reportes por mina y el mapa.">
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
                  {selectableOrganizations(orgs, field.value).map(o => (
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
              <LocationCombobox locations={locations} value={field.value} onChange={field.onChange} disabled={loading} allowClear placeholder="Buscar municipio" />
            )}
          />
        </Field>
      </div>
    </FormSection>
  )
}
