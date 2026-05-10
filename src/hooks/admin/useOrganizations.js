import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationService } from '@/services/organization.service'
import { toast } from 'sonner'

export function useOrganizations() {
  const qc = useQueryClient()

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn:  () => organizationService.getAll().then(r => r.data),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }) =>
      active ? organizationService.disable(id) : organizationService.enable(id),
    onSuccess: () => qc.invalidateQueries(['organizations']),
    onError:   () => toast.error('Error al cambiar el estado'),
  })

  const saveMutation = useMutation({
    mutationFn: ({ id, data, isEdit }) =>
      isEdit
        ? organizationService.update(id, data)
        : organizationService.create(data),
    onSuccess: (_, { isEdit }) => {
      toast.success(isEdit ? 'Organización actualizada' : 'Organización creada')
      qc.invalidateQueries(['organizations'])
    },
    onError: (err) => {
      toast.error('Error', {
        description: err.response?.data?.error ?? 'Ocurrió un error inesperado',
      })
    },
  })

  return {
    orgs,
    isLoading,
    toggleStatus:       toggleStatusMutation.mutate,
    saveOrg:            saveMutation.mutateAsync,
    isSaving:           saveMutation.isPending,
    isTogglingStatus:   toggleStatusMutation.isPending,
  }
}