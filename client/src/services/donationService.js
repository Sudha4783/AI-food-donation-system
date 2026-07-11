import api from './api';

export const donationService = {
  getAll: (params) => api.get('/donations', { params }),
  getById: (id) => api.get(`/donations/${id}`),
  create: (data) => api.post('/donations', data),
  updateStatus: (id, status) => api.patch(`/donations/${id}/status`, { status }),
  delete: (id) => api.delete(`/donations/${id}`),
  claim: (id, data) => api.post(`/donations/${id}/claim`, data),
  getMyStats: () => api.get('/donations/my-stats'),
};

export const ngoService = {
  getClaims: (params) => api.get('/ngo/claims', { params }),
  getStats: () => api.get('/ngo/stats'),
  updateClaimStatus: (id, data) => api.patch(`/ngo/claims/${id}/status`, data),
  cancelClaim: (id, data) => api.delete(`/ngo/claims/${id}`, { data }),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getDonations: (params) => api.get('/admin/donations', { params }),
};

export const aiService = {
  predictQuality: (data) => api.post('/ai/predict-quality', data),
  analyzeDonation: (id) => api.post(`/ai/analyze-donation/${id}`),
  getRecommendations: (data) => api.post('/ai/recommend', data),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.patch('/notifications/read-all'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};
