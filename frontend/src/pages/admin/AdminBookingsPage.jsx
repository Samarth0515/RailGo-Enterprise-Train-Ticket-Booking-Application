import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { bookingService } from '../../services/bookingService';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Download, Search, Ticket } from 'lucide-react';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getAllBookings()
      .then((data) => setBookings(data || []))
      .catch((err) => console.error('Failed to load bookings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPdf = async (pnr) => {
    try {
      await bookingService.downloadTicketPdf(pnr);
    } catch (err) {
      alert('Failed to download PDF.');
    }
  };

  const filtered = bookings.filter(
    (b) =>
      b.pnr.includes(search) ||
      b.trainName?.toLowerCase().includes(search.toLowerCase()) ||
      b.passengers?.some((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout title="Bookings & Passenger Master Audit">
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PNR, passenger, or train..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Showing <strong className="text-slate-900">{filtered.length}</strong> total platform reservations
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
              Loading passenger manifests...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">PNR</th>
                    <th className="p-4">Train</th>
                    <th className="p-4">Journey Date</th>
                    <th className="p-4">Route</th>
                    <th className="p-4">Passengers</th>
                    <th className="p-4">Total Fare</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((b) => (
                    <tr key={b.pnr} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-blue-600">
                        {b.pnr}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{b.trainName}</span>
                        <span className="text-[11px] text-slate-400">#{b.trainNumber} • {b.classCode}</span>
                      </td>
                      <td className="p-4 text-slate-700">
                        {b.journeyDate}
                      </td>
                      <td className="p-4 text-slate-600">
                        {b.fromStationCode} → {b.toStationCode}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">
                          {b.passengers?.map((p) => p.name).join(', ') || '1 Passenger'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {b.passengers?.map((p) => `${p.coachNumber}-${p.seatNumber}`).join(', ')}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        ₹{Math.round(b.totalAmount)}
                      </td>
                      <td className="p-4">
                        <Badge variant={b.status === 'CONFIRMED' ? 'success' : 'danger'} size="sm">
                          {b.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(b.pnr)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors inline-block"
                          title="Download PDF Ticket Slip"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
