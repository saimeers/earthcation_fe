import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/client'
import { usePort } from '@/shared/lib/ports'
import type { Location, LocationInput } from '../domain/locations'
import { locationKeys, locationsPort } from './ports'

/** Catálogo de municipios (también lo usan el selector de sesiones y el formulario de usuarios). */
export function useLocationList() {
  const gateway = usePort(locationsPort)
  return useQuery({ queryKey: locationKeys.all, queryFn: () => gateway.list() })
}

/** Habilitar/deshabilitar: `location.is_active` es el estado actual (se invierte). */
export function useToggleLocation() {
  const gateway = usePort(locationsPort)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (location: Location) => gateway.setActive(location.id, !location.is_active),
    onSuccess: () => qc.invalidateQueries({ queryKey: locationKeys.all }),
    onError: () => toast.error('Error al cambiar el estado'),
  })
}

export function useSaveLocation() {
  const gateway = usePort(locationsPort)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id?: string, input: LocationInput }) => (id ? gateway.update(id, input) : gateway.create(input)),
    onSuccess: (_, { id }) => {
      toast.success(id ? 'Localidad actualizada' : 'Localidad creada')
      void qc.invalidateQueries({ queryKey: locationKeys.all })
    },
    onError: (err) => toast.error('Error', { description: apiErrorMessage(err, 'Ocurrió un error inesperado') }),
  })
}
