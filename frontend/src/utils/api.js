import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const productAPI = {
  getAll: () => api.get('/products'),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.patch(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/lowstock'),
};

export const supplierAPI = {
  getAll: () => api.get('/suppliers'),
  create: (supplier) => api.post('/suppliers', supplier),
  update: (id, supplier) => api.patch(`/suppliers/${id}`, supplier),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const orderAPI = {
  getAll: () => api.get('/orders'),
  create: (order) => api.post('/orders', order),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getAIInsights: (query) => api.post('/analytics/ai-insights', { query }),
  getSmartInsights: () => api.get('/analytics/smart-insights'),
  getRoleInsights: (role) => api.get(`/analytics/role-insights/${role}`),
  generateReport: (reportType) => api.get(`/analytics/report/${reportType}`),
  predictDemand: (productId, days) => api.post('/analytics/predict-demand', { productId, days }),
};

export const chatAPI = {
  getConversationHistory: () => api.get('/chat/history'),
  saveConversation: (conversation) => api.post('/chat/save', conversation),
};

export default api;