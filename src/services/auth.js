import api from './api';

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data.user;
  },

  logout: async () => {
    await api.post('/auth/logout');
  }
};