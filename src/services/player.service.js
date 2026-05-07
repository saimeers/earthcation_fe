import api from './api'

export const playerService = {
  getAll:       (params) => api.get('/api/users', { params }),
  getById:      (id)     => api.get(`/api/users/${id}`),
  getProgress:  (id)     => api.get(`/api/progress/me`, { headers: { 'x-user-id': id } }),
  getVark:      (id)     => api.get(`/api/vark/me`, { headers: { 'x-user-id': id } }),
}