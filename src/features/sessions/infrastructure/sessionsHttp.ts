import { v1 } from '@/shared/api/v1'
import type {
  AttemptDetailDto, ParticipantAnalysisDto, SessionDto, SessionProgressDto, TelemetryOverviewDto,
} from '@/shared/api/types'
import type { SessionsGateway } from '../application/ports'

export const sessionsHttp: SessionsGateway = {
  listAll: () => v1.list<SessionDto>('/sessions', { scope: 'all' }),
  listMine: () => v1.list<SessionDto>('/sessions', { scope: 'mine' }),
  progress: (id) => v1.get<SessionProgressDto>(`/sessions/${id}`),
  participantAnalysis: (sessionId, userId) => v1.get<ParticipantAnalysisDto>(`/sessions/${sessionId}/participants/${userId}/analysis`),
  create: (input) => v1.post('/sessions', input),
  start: (id) => v1.put(`/sessions/${id}/status`, { status: 'active' }),
  end: (id) => v1.put(`/sessions/${id}/status`, { status: 'finished' }),
  exportXlsx: (id) => v1.getBlob(`/sessions/${id}/report.xlsx`),
  telemetryOverview: (params) => v1.get<TelemetryOverviewDto>('/telemetry/overview', { ...params }),
  attemptDetail: (id) => v1.get<AttemptDetailDto>(`/attempts/${id}`),
}
