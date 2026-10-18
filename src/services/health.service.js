import api from './api'

export const healthService = {
  details: () => api.get('/api/health/details'),
}
