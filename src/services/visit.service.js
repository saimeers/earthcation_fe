import api from './api'

export const visitService = {
  stats: (days) => api.get('/api/visits/stats', { params: { days } }),
}
