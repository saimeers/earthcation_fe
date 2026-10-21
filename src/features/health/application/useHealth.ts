import { useQuery } from '@tanstack/react-query'
import { usePort } from '@/shared/lib/ports'
import { healthKeys, healthPort } from './ports'

/** Se refresca cada 10 s: es la vista que mira soporte durante una sesión en vivo. */
export function useHealth() {
  const gateway = usePort(healthPort)
  return useQuery({
    queryKey: healthKeys.details(),
    queryFn: () => gateway.details(),
    refetchInterval: 10_000,
    staleTime: 5_000,
  })
}
