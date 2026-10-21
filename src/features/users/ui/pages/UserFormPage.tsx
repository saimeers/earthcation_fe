import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { findLocation, useLocationList } from '@/features/locations'
import { useOrganizationList } from '@/features/organizations'
import { EMPTY_USER_FORM, isStaffRole, toUserForm, type UserForm } from '../../domain/users'
import { useSaveUser, useUser } from '../../application/useUsers'
import { AccessSection, PersonalSection, PlaceSection } from '../components/form/UserFormSections'
import { UserSummaryAside } from '../components/form/UserSummaryAside'

/** Crear (/admin/users/new) o editar (/admin/users/:id/edit) un usuario. Nunca pide contraseña. */
export function UserFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: user, isLoading: isLoadingUser } = useUser(id)
  const { data: orgs } = useOrganizationList()
  const { data: locations } = useLocationList()
  const save = useSaveUser(id)

  const { register, handleSubmit, reset, control, watch, formState: { errors, isSubmitting } } = useForm<UserForm>({ defaultValues: EMPTY_USER_FORM })

  useEffect(() => {
    if (isEdit && user) reset(toUserForm(user))
    else if (!isEdit) reset(EMPTY_USER_FORM)
  }, [isEdit, user, reset])

  const values = watch()
  const isStaff = isStaffRole(values.role)
  const org = (orgs ?? []).find(o => o.id === values.organization_id)
  const loc = findLocation(locations, values.location_id)

  const onSubmit = async (data: UserForm) => {
    try {
      await save.mutateAsync(data)
      navigate('/admin/users')
    } catch {
      // el toast de error lo muestra useSaveUser
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
            <PersonalSection register={register} errors={errors} loading={loading} />
            <AccessSection register={register} control={control} errors={errors} loading={loading} isEdit={isEdit} isStaff={isStaff} cedula={values.cedula} />
            <PlaceSection control={control} loading={loading} orgs={orgs ?? []} locations={locations ?? []} />
          </div>
          <UserSummaryAside values={values} org={org} loc={loc} isEdit={isEdit} isStaff={isStaff} loading={loading} />
        </form>
      )}
    </div>
  )
}
