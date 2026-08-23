import api from './api'

export const analyticsService = {
  overview:        ()       => api.get('/api/analytics/overview'),
  byOrganization:  (orgId)  => api.get(`/api/analytics/organization/${orgId}`),
  byLocation:      (params) => api.get('/api/analytics/location', { params }),
  minesMap:        ()       => api.get('/api/analytics/map'),
  varkAll:         ()       => api.get('/api/vark/all'),
  varkByStyle:     (style)  => api.get(`/api/vark/by-style/${style}`),
  varkByLocation:  (params) => api.get('/api/vark/by-location', { params }),
}