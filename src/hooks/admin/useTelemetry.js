import { useQuery } from '@tanstack/react-query'
import { telemetryService } from '@/services/telemetry.service'

export function useTelemetryOverview(params = {}, options = {}) {
  return useQuery({
    queryKey: ['telemetry', 'overview', params],
    queryFn:  () => telemetryService.overview(params).then(r => r.data),
    staleTime: 60_000,
    ...options,
  })
}

// Línea de tiempo completa de un intento (eventos) — se pide solo al abrir ese intento
export function useAttemptDetail(attemptId) {
  return useQuery({
    queryKey: ['telemetry', 'attempt', attemptId],
    queryFn:  () => telemetryService.attempt(attemptId).then(r => r.data),
    enabled:  !!attemptId,
    staleTime: 5 * 60_000,
  })
}
