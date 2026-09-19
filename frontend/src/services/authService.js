import api from '../utils/api';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('railgo_token', res.data.token);
      localStorage.setItem('railgo_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('railgo_token', res.data.token);
      localStorage.setItem('railgo_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('railgo_token');
    localStorage.removeItem('railgo_user');
  },

  getStoredUser() {
    const u = localStorage.getItem('railgo_user');
    return u ? JSON.parse(u) : null;
  },

  getToken() {
    return localStorage.getItem('railgo_token');
  },
};
