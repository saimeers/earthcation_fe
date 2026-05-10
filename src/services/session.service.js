import api from './api'

export const sessionService = {
  getAll:      ()          => api.get('/api/sessions/all'),
  getMine:     ()          => api.get('/api/sessions/mine'),
  getById:     (id)        => api.get(`/api/sessions/${id}`),
  getProgress: (id)        => api.get(`/api/sessions/${id}/progress`),
  create:      (data)      => api.post('/api/sessions', data),
  start:       (id)        => api.patch(`/api/sessions/${id}/start`),
  end:         (id)        => api.patch(`/api/sessions/${id}/end`),
  byLocation:  (params)    => api.get('/api/sessions/by-location', { params }),
}