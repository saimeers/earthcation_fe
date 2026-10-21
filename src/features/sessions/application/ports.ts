import { definePort } from '@/shared/lib/ports'
import type {
  AttemptDetailDto, CreateSessionDto, ParticipantAnalysisDto, SessionProgressDto, TelemetryOverviewDto, TelemetryOverviewParams,
} from '@/shared/api/types'
import type { Session } from '../domain/sessions'

export interface SessionsGateway {
  listAll(): Promise<Session[]>
  /** Instructor: sus salas y la sesión "Juego libre" de su ubicación. */
  listMine(): Promise<Session[]>
  progress(id: string): Promise<SessionProgressDto>
  participantAnalysis(sessionId: string, userId: string): Promise<ParticipantAnalysisDto>
  create(input: CreateSessionDto): Promise<void>
  start(id: string): Promise<void>
  end(id: string): Promise<void>
  exportXlsx(id: string): Promise<Blob>
  telemetryOverview(params: TelemetryOverviewParams): Promise<TelemetryOverviewDto>
  attemptDetail(attemptId: string): Promise<AttemptDetailDto>
}

export const sessionsPort = definePort<SessionsGateway>('sessions')

export const sessionKeys = {
  all: ['sessions'] as const,
  list: () => ['sessions', 'all'] as const,
  mine: () => ['sessions', 'mine'] as const,
  progress: (id: string) => ['sessions', id, 'progress', 'admin'] as const,
  participant: (sessionId: string, userId: string) => ['sessions', sessionId, 'participants', userId, 'analysis'] as const,
}

export const telemetryKeys = {
  overview: (params: TelemetryOverviewParams) => ['telemetry', 'overview', params] as const,
  attempt: (id: string) => ['telemetry', 'attempt', id] as const,
}
