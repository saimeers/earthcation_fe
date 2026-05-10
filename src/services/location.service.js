import api from './api'

export const locationService = {
  getAll:   ()          => api.get('/api/locations'),
  getById:  (id)        => api.get(`/api/locations/${id}`),
  search:   (params)    => api.get('/api/locations/search', { params }),
  create:   (data)      => api.post('/api/locations', data),
  update:   (id, data)  => api.put(`/api/locations/${id}`, data),
  disable:  (id)        => api.patch(`/api/locations/${id}/disable`),
  enable:   (id)        => api.patch(`/api/locations/${id}/enable`),
}