import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { locationService } from '@/services/location.service'
import { toast } from 'sonner'

export function useLocations() {
  const qc = useQueryClient()

  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn:  () => locationService.getAll().then(r => r.data),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }) =>
      active ? locationService.disable(id) : locationService.enable(id),
    onSuccess: () => qc.invalidateQueries(['locations']),
    onError:   () => toast.error('Error al cambiar el estado'),
  })

  const saveMutation = useMutation({
    mutationFn: ({ id, data, isEdit }) =>
      isEdit
        ? locationService.update(id, data)
        : locationService.create(data),
    onSuccess: (_, { isEdit }) => {
      toast.success(isEdit ? 'Localidad actualizada' : 'Localidad creada')
      qc.invalidateQueries(['locations'])
    },
    onError: (err) => {
      toast.error('Error', {
        description: err.response?.data?.error ?? 'Ocurrió un error inesperado',
      })
    },
  })

  return {
    locations,
    isLoading,
    toggleStatus:     toggleStatusMutation.mutate,
    saveLocation:     saveMutation.mutateAsync,
    isSaving:         saveMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,
  }
}