import api from '../utils/api';

export const trainService = {
  async searchTrains(from, to, date, coachType = '') {
    const params = { from, to, date };
    if (coachType) params.coachType = coachType;
    const res = await api.get('/trains/search', { params });
    return res.data;
  },

  async getTrainDetails(id) {
    const res = await api.get(`/trains/${id}`);
    return res.data;
  },

  async getCoachSeatMap(scheduleId) {
    const res = await api.get(`/trains/schedule/${scheduleId}/seats`);
    return res.data;
  },

  async getStations(query = '') {
    const endpoint = query ? `/stations/search?q=${encodeURIComponent(query)}` : '/stations';
    const res = await api.get(endpoint);
    return res.data;
  },
};
