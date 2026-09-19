import api from '../utils/api';

export const adminService = {
  async getDashboardStats() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getAllBookings() {
    const res = await api.get('/admin/bookings');
    return res.data;
  },

  async getAllTrains() {
    const res = await api.get('/admin/trains');
    return res.data;
  },

  async updateTrainStatus(id, status) {
    const res = await api.put(`/admin/trains/${id}/status?status=${status}`);
    return res.data;
  },

  async getAllUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },
};
