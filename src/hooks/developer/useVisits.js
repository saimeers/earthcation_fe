import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { visitService } from '@/services/visit.service'

// La API las cachea 60 s; aquí se refrescan cada minuto mientras la página está abierta
export function useVisitStats(days) {
  return useQuery({
    queryKey: ['visits', 'stats', days],
    queryFn: () => visitService.stats(days).then(r => r.data),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  })
}
