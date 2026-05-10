import api from './api'

export const userService = {
  getAll:        (params) => api.get('/api/users', { params }),
  getById:       (id)     => api.get(`/api/users/${id}`),
  update:        (id, data) => api.put(`/api/users/${id}`, data),
  createByAdmin: (data)   => api.post('/api/users', data),
  disable:       (id)     => api.patch(`/api/users/${id}/disable`),
  enable:        (id)     => api.patch(`/api/users/${id}/enable`),
}