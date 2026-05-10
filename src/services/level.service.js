import api from './api'

export const levelService = {
  getAll:  () => api.get('/api/levels'),
  getById: (id) => api.get(`/api/levels/${id}`),
}