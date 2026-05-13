import api from './api'

export const progressService = {
  getHistoryByUser: (userId, params) =>
    api.get(`/api/progress/user/${userId}/history`, { params }),
  getProgressByLevel: (userId, levelId) =>
    api.get(`/api/progress/level/${levelId}`, { params: { user_id: userId } }),
}