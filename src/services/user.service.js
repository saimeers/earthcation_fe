import api from './api'

export const userService = {
  getAll:        (params) => api.get('/api/users', { params }),
  getById:       (id)     => api.get(`/api/users/${id}`),
  getSessions:   (id)     => api.get(`/api/users/${id}/sessions`),
  update:        (id, data) => api.put(`/api/users/${id}`, data),
  createByAdmin: (data)   => api.post('/api/users', data),
  disable:       (id)     => api.patch(`/api/users/${id}/disable`),
  enable:        (id)     => api.patch(`/api/users/${id}/enable`),
  parseBulkImport: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/users/bulk-import/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  confirmBulkImport: (rows) => api.post('/api/users/bulk-import/confirm', { rows }),
}