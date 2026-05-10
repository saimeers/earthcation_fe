import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { toast }       from 'sonner'

export function useUsers() {
  const qc = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', 'all'],
    queryFn:  () => userService.getAll().then(r => r.data),
  })

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }) => userService.update(id, { role }),
    onSuccess:  () => { qc.invalidateQueries(['users', 'all']); toast.success('Rol actualizado') },
    onError:    () => toast.error('Error al cambiar el rol'),
  })

  const disableMutation = useMutation({
    mutationFn: (id) => userService.disable(id),
    onSuccess:  () => { qc.invalidateQueries(['users', 'all']); toast.success('Usuario deshabilitado') },
    onError:    () => toast.error('Error al deshabilitar'),
  })

  const enableMutation = useMutation({
    mutationFn: (id) => userService.enable(id),
    onSuccess:  () => { qc.invalidateQueries(['users', 'all']); toast.success('Usuario habilitado') },
    onError:    () => toast.error('Error al habilitar'),
  })

  return {
    users,
    isLoading,
    changeRole:  changeRoleMutation.mutate,
    disableUser: disableMutation.mutate,
    enableUser:  enableMutation.mutate,
    isChangingRole:  changeRoleMutation.isPending,
    isDisabling:     disableMutation.isPending,
    isEnabling:      enableMutation.isPending,
  }
}