import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const smitApi = {
  sendCode: (phone) => api.post('/sms/send', { phone }),
  verifyCode: (phone, code) => api.post('/sms/verify', { phone, code }),
}

export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getAll: (status) => api.get('/orders', { params: { status } }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
}

export const datesApi = {
  getAvailable: () => api.get('/dates/available'),
  getAll: () => api.get('/dates/all'),
  create: (date) => api.post('/dates', date),
  update: (id, data) => api.patch(`/dates/${id}`, data),
  delete: (id) => api.delete(`/dates/${id}`),
}

export default api
