import { Link } from 'react-router-dom'
import { Loader2, Save, UserPlus, Info } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { initials } from '@/shared/lib/format'
import type { Location } from '@/features/locations'
import type { Organization } from '@/features/organizations'
import { ROLE_TITLES, type UserForm } from '../../../domain/users'

interface UserSummaryAsideProps {
  values: UserForm
  org: Organization | undefined
  loc: Location | null
  isEdit: boolean
  isStaff: boolean
  loading: boolean
}

/** Vista previa de la persona mientras se llena el formulario, con guardar/cancelar. */
export function UserSummaryAside({ values, org, loc, isEdit, isStaff, loading }: UserSummaryAsideProps) {
  return (
    <aside className="lg:sticky lg:top-20 space-y-4">
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="h-16 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
        <div className="px-5 pb-5 -mt-8 space-y-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-xl font-bold ring-4 ring-card shadow-sm border">{initials(values)}</span>
          <div>
            <p className="font-semibold text-base leading-tight">{[values.first_name, values.last_name].filter(Boolean).join(' ') || 'Nombre del usuario'}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{values.cedula ? `CC ${values.cedula}` : 'Sin cédula'}</p>
          </div>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Rol</dt><dd className="font-medium">{ROLE_TITLES[values.role]}</dd></div>
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
  )
}
