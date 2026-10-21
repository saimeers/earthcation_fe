import { http } from '@/shared/api/client'
import type {
  AttemptDetailDto, ParticipantAnalysisDto, SessionDto, SessionProgressDto, TelemetryOverviewDto,
} from '@/shared/api/types'
import type { SessionsGateway } from '../application/ports'

const done = () => undefined

export const sessionsHttp: SessionsGateway = {
  listAll: () => http.get<SessionDto[]>('/api/sessions/all'),
  listMine: () => http.get<SessionDto[]>('/api/sessions/mine'),
  progress: (id) => http.get<SessionProgressDto>(`/api/sessions/${id}/progress/admin`),
  participantAnalysis: (sessionId, userId) => http.get<ParticipantAnalysisDto>(`/api/sessions/${sessionId}/participants/${userId}/analysis`),
  create: (input) => http.post('/api/sessions', input).then(done),
  start: (id) => http.patch(`/api/sessions/${id}/start`).then(done),
  end: (id) => http.patch(`/api/sessions/${id}/end`).then(done),
  exportXlsx: (id) => http.getBlob(`/api/sessions/${id}/export.xlsx`),
  telemetryOverview: (params) => http.get<TelemetryOverviewDto>('/api/telemetry/overview', { ...params }),
  attemptDetail: (id) => http.get<AttemptDetailDto>(`/api/telemetry/attempts/${id}`),
}
