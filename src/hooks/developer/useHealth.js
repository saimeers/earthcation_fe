import { useQuery } from '@tanstack/react-query'
import { healthService } from '@/services/health.service'

// Se refresca cada 10 s: es la vista que mira soporte durante una sesión en vivo
export function useHealth() {
  return useQuery({
    queryKey: ['health', 'details'],
    queryFn: () => healthService.details().then(r => r.data),
    refetchInterval: 10_000,
    staleTime: 5_000,
  })
}
