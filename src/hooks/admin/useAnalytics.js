import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'

export function useOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn:  () => analyticsService.overview().then(r => r.data),
    staleTime: 60_000,
  })
}

export function useVarkAll() {
  return useQuery({
    queryKey: ['analytics', 'vark'],
    queryFn:  () => analyticsService.varkAll().then(r => r.data),
  })
}

export function useMinesMap() {
  return useQuery({
    queryKey: ['analytics', 'map'],
    queryFn:  () => analyticsService.minesMap().then(r => r.data),
    staleTime: 60_000,
  })
}

export function useAnalyticsByOrganization(orgId) {
  return useQuery({
    queryKey: ['analytics', 'organization', orgId],
    queryFn:  () => analyticsService.byOrganization(orgId).then(r => r.data),
    enabled:  !!orgId,
  })
}