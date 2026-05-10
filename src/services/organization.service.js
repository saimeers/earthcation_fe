import api from './api'

export const organizationService = {
  getAll:   ()          => api.get('/api/organizations'),
  getById:  (id)        => api.get(`/api/organizations/${id}`),
  search:   (params)    => api.get('/api/organizations/search', { params }),
  create:   (data)      => api.post('/api/organizations', data),
  update:   (id, data)  => api.put(`/api/organizations/${id}`, data),
  disable:  (id)        => api.patch(`/api/organizations/${id}/disable`),
  enable:   (id)        => api.patch(`/api/organizations/${id}/enable`),
}