import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { usePort } from '@/shared/lib/ports'
import { visitsKeys, visitsPort } from './ports'

/** La API cachea 60 s; aquí se refresca cada minuto mientras la página está abierta. */
export function useVisitStats(days: number) {
  const gateway = usePort(visitsPort)
  return useQuery({
    queryKey: visitsKeys.stats(days),
    queryFn: () => gateway.stats(days),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  })
}
