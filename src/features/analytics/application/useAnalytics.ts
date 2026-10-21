import { useQuery } from '@tanstack/react-query'
import { usePort } from '@/shared/lib/ports'
import { analyticsKeys, analyticsPort } from './ports'

export function useOverview() {
  const gateway = usePort(analyticsPort)
  return useQuery({ queryKey: analyticsKeys.overview(), queryFn: () => gateway.overview(), staleTime: 60_000 })
}

export function useVarkAll() {
  const gateway = usePort(analyticsPort)
  return useQuery({ queryKey: analyticsKeys.vark(), queryFn: () => gateway.varkAll() })
}

export function useMinesMap() {
  const gateway = usePort(analyticsPort)
  return useQuery({ queryKey: analyticsKeys.map(), queryFn: () => gateway.minesMap(), staleTime: 60_000 })
}

/** Desempeño de los jugadores de una organización (solo con una elegida). */
export function useOrganizationPlayers(orgId: string) {
  const gateway = usePort(analyticsPort)
  return useQuery({ queryKey: analyticsKeys.organization(orgId), queryFn: () => gateway.byOrganization(orgId), enabled: !!orgId })
}

export function useGameTelemetry() {
  const gateway = usePort(analyticsPort)
  return useQuery({ queryKey: analyticsKeys.telemetry(), queryFn: () => gateway.telemetryOverview(), staleTime: 60_000 })
}
