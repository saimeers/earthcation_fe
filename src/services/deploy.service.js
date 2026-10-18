import axios from 'axios'
import api from './api'

export const deployService = {
  status:   () => api.get('/api/deploy/status'),
  versions: () => api.get('/api/deploy/versions'),
  create:   (data) => api.post('/api/deploy/versions', data),
  complete: (id) => api.post(`/api/deploy/versions/${id}/complete`),
  activate: (id) => api.post(`/api/deploy/versions/${id}/activate`),
  preview:  (id) => api.get(`/api/deploy/versions/${id}/preview`),
  remove:   (id) => api.delete(`/api/deploy/versions/${id}`),
  // URL prefirmada de S3: va sin el token de la API. Sin S3 (desarrollo) el ZIP pasa por la API.
  upload: ({ mode, url, headers }, file, onUploadProgress) =>
    (mode === 'presigned' ? axios : api).put(url, file, { headers, onUploadProgress, timeout: 0 }),
}
