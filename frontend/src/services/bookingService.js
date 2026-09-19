import api from '../utils/api';

export const bookingService = {
  async lockSeats(scheduleId, seatIds) {
    const res = await api.post('/bookings/lock-seats', { scheduleId, seatIds });
    return res.data;
  },

  async createBooking(data) {
    const res = await api.post('/bookings', data);
    return res.data;
  },

  async getBookingByPnr(pnr) {
    const res = await api.get(`/bookings/pnr/${pnr}`);
    return res.data;
  },

  async getMyBookings() {
    const res = await api.get('/bookings/my-bookings');
    return res.data;
  },

  async cancelBooking(pnr) {
    const res = await api.post(`/bookings/${pnr}/cancel`);
    return res.data;
  },

  async downloadTicketPdf(pnr) {
    const res = await api.get(`/bookings/${pnr}/ticket-pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RailGo_Ticket_${pnr}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
