import api from './api'

export const telemetryService = {
  overview:     (params)         => api.get('/api/telemetry/overview', { params }),
  userSummary:  (userId, params) => api.get(`/api/telemetry/users/${userId}/summary`, { params }),
  userAttempts: (userId, params) => api.get(`/api/telemetry/users/${userId}/attempts`, { params }),
  attempt:      (id)             => api.get(`/api/telemetry/attempts/${id}`),
}
