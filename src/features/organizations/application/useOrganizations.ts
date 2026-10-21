import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/client'
import { usePort } from '@/shared/lib/ports'
import type { Organization, OrganizationInput } from '../domain/organizations'
import { organizationKeys, organizationsPort } from './ports'

/** Lista de organizaciones (también la usan el formulario de usuarios y el comparador de analíticas). */
export function useOrganizationList() {
  const gateway = usePort(organizationsPort)
  return useQuery({ queryKey: organizationKeys.all, queryFn: () => gateway.list() })
}

/** Habilitar/deshabilitar: `org.is_active` es el estado actual (se invierte). */
export function useToggleOrganization() {
  const gateway = usePort(organizationsPort)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (org: Organization) => gateway.setActive(org.id, !org.is_active),
    onSuccess: () => qc.invalidateQueries({ queryKey: organizationKeys.all }),
    onError: () => toast.error('Error al cambiar el estado'),
  })
}

export function useSaveOrganization() {
  const gateway = usePort(organizationsPort)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id?: string, input: OrganizationInput }) => (id ? gateway.update(id, input) : gateway.create(input)),
    onSuccess: (_, { id }) => {
      toast.success(id ? 'Organización actualizada' : 'Organización creada')
      void qc.invalidateQueries({ queryKey: organizationKeys.all })
    },
    onError: (err) => toast.error('Error', { description: apiErrorMessage(err, 'Ocurrió un error inesperado') }),
  })
}
