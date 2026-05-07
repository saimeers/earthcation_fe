import api from './api'

export const sessionService = {
  create:      (data)      => api.post('/api/sessions', data),
  getMine:     ()          => api.get('/api/sessions/mine'),
  getById:     (id)        => api.get(`/api/sessions/${id}`),
  getProgress: (id)        => api.get(`/api/sessions/${id}/progress`),
  start:       (id)        => api.patch(`/api/sessions/${id}/start`),
  end:         (id)        => api.patch(`/api/sessions/${id}/end`),
  byLocation:  (params)    => api.get('/api/sessions/by-location', { params }),
}