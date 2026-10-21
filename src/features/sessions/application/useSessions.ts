import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateSessionDto, TelemetryOverviewParams } from '@/shared/api/types'
import { usePort } from '@/shared/lib/ports'
import { saveBlob } from '@/shared/lib/download'
import { exportFileName } from '../domain/sessions'
import { sessionKeys, sessionsPort, telemetryKeys } from './ports'

/** Lista de sesiones del panel: todas (admin, soporte) o las del instructor. */
export function useSessionList(mine: boolean) {
  const gateway = usePort(sessionsPort)
  const all = useQuery({ queryKey: sessionKeys.list(), queryFn: () => gateway.listAll(), enabled: !mine })
  const own = useQuery({ queryKey: sessionKeys.mine(), queryFn: () => gateway.listMine(), enabled: mine })
  return mine ? own : all
}

// Solo se refresca mientras la sesión está en curso — una finalizada no cambia.
export function useSessionProgress(id: string | undefined) {
  const gateway = usePort(sessionsPort)
  return useQuery({
    queryKey: sessionKeys.progress(id ?? ''),
    queryFn: () => gateway.progress(id ?? ''),
    enabled: !!id,
    placeholderData: keepPreviousData,
    refetchInterval: (query) => (query.state.data?.session?.status === 'active' ? 15_000 : false),
  })
}

export function useParticipantAnalysis(sessionId: string | undefined, userId: string | undefined) {
  const gateway = usePort(sessionsPort)
  return useQuery({
    queryKey: sessionKeys.participant(sessionId ?? '', userId ?? ''),
    queryFn: () => gateway.participantAnalysis(sessionId ?? '', userId ?? ''),
    enabled: !!sessionId && !!userId,
    placeholderData: keepPreviousData,
  })
}

/** Telemetría agregada (de una sesión con `session_id`). */
export function useTelemetryOverview(params: TelemetryOverviewParams = {}) {
  const gateway = usePort(sessionsPort)
  return useQuery({
    queryKey: telemetryKeys.overview(params),
    queryFn: () => gateway.telemetryOverview(params),
    staleTime: 60_000,
  })
}

// Línea de tiempo completa de un intento (eventos) — se pide solo al abrir ese intento
export function useAttemptDetail(attemptId: string | null) {
  const gateway = usePort(sessionsPort)
  return useQuery({
    queryKey: telemetryKeys.attempt(attemptId ?? ''),
    queryFn: () => gateway.attemptDetail(attemptId ?? ''),
    enabled: !!attemptId,
    staleTime: 5 * 60_000,
  })
}

function useSessionMutation<T>(run: (input: T) => Promise<void>, success: string, failure: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: run,
    onSuccess: () => { void qc.invalidateQueries({ queryKey: sessionKeys.all }); toast.success(success) },
    onError: () => toast.error(failure),
  })
}

export function useCreateSession() {
  const gateway = usePort(sessionsPort)
  return useSessionMutation((input: CreateSessionDto) => gateway.create(input), 'Sesión creada', 'Error al crear la sesión')
}

export function useStartSession() {
  const gateway = usePort(sessionsPort)
  return useSessionMutation((id: string) => gateway.start(id), 'Sesión iniciada', 'Error al iniciar la sesión')
}

export function useEndSession() {
  const gateway = usePort(sessionsPort)
  return useSessionMutation((id: string) => gateway.end(id), 'Sesión finalizada', 'Error al finalizar la sesión')
}

/** Excel generado por la API (participantes, riesgos e intentos), descargado como archivo. */
export function useExportSessionXlsx() {
  const gateway = usePort(sessionsPort)
  return useMutation({
    mutationFn: async ({ id, code }: { id: string, code?: string | null }) => {
      saveBlob(await gateway.exportXlsx(id), exportFileName(code ?? id, new Date()))
    },
    onSuccess: () => toast.success('Excel descargado'),
    onError: () => toast.error('No se pudo exportar la sesión'),
  })
}
