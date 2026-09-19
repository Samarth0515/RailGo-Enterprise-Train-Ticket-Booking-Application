import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { 
  Ticket, 
  Search, 
  Download, 
  XCircle, 
  Clock, 
  Train, 
  Calendar, 
  AlertTriangle, 
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyBookingsPage = () => {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UPCOMING, CANCELLED
  const [searchPnr, setSearchPnr] = useState('');
  const [pnrSearchLoading, setPnrSearchLoading] = useState(false);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePnrSearch = async (e) => {
    e.preventDefault();
    if (!searchPnr.trim()) return;

    setPnrSearchLoading(true);
    try {
      const result = await bookingService.getBookingByPnr(searchPnr.trim());
      // Prepend or show
      setBookings((prev) => {
        const filtered = prev.filter((b) => b.pnr !== result.pnr);
        return [result, ...filtered];
      });
      setActiveTab('ALL');
    } catch (err) {
      alert('PNR not found or invalid. Please double-check your 10-digit PNR number.');
    } finally {
      setPnrSearchLoading(false);
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBookingForCancel(booking);
    setCancelResult(null);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancelling(true);
    try {
      const res = await bookingService.cancelBooking(selectedBookingForCancel.pnr);
      setCancelResult(res);
      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.pnr === selectedBookingForCancel.pnr
            ? { ...b, status: 'CANCELLED', cancellationRefund: res.refundAmount, cancelledAt: new Date().toISOString() }
            : b
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownload = async (pnr) => {
    try {
      await bookingService.downloadTicketPdf(pnr);
    } catch (err) {
      alert('Could not download PDF ticket at this time.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED';
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & PNR Search */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Trips & PNR Status</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your reservation slips, boarding passes, and cancellation requests.
          </p>
        </div>

        {/* PNR Quick Search Input */}
        <form onSubmit={handlePnrSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by 10-digit PNR..."
              value={searchPnr}
              onChange={(e) => setSearchPnr(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            loading={pnrSearchLoading}
            variant="primary"
            size="md"
            className="rounded-xl shrink-0"
          >
            Find PNR
          </Button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'ALL', label: 'All Trips' },
          { id: 'UPCOMING', label: 'Upcoming Trips' },
          { id: 'CANCELLED', label: 'Cancelled Trips' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading trips history...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No Bookings Found"
            description="You have no train bookings under this tab. Ready to plan your next journey?"
            actionLabel="Search Trains"
            onAction={() => window.location.href = '/'}
          />
        ) : (
          filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            return (
              <div
                key={b.pnr}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 p-6 shadow-subtle space-y-4 transition-all"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Train className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{b.trainName}</h3>
                        <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                          #{b.trainNumber}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Class: {b.classCode} ({b.coachType}) • PNR: <strong className="font-mono text-slate-800">{b.pnr}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={isConfirmed ? 'success' : 'danger'} size="md">
                      {b.status}
                    </Badge>
                  </div>
                </div>

                {/* Timing & Route */}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center py-2 gap-4">
                  <div>
                    <span className="text-xl font-black text-slate-900">{b.departureTime}</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{b.fromStationName} ({b.fromStationCode})</p>
                    <span className="text-[11px] text-slate-400">{b.journeyDate}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full h-0.5 bg-slate-200 relative flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600 absolute left-0"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-600 absolute right-0"></div>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xl font-black text-slate-900">{b.arrivalTime}</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{b.toStationName} ({b.toStationCode})</p>
                    <span className="text-[11px] text-slate-400">{b.journeyDate}</span>
                  </div>
                </div>

                {/* Passenger Berths */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Passengers:</span>
                  {b.passengers?.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                    >
                      <span>{p.name}</span>
                      <strong className="text-blue-700">({p.coachNumber}-{p.seatNumber})</strong>
                    </span>
                  ))}
                </div>

                {/* Footer and Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Total Fare:</span>
                    <strong className="text-slate-900 ml-1 text-sm font-bold">₹{Math.round(b.totalAmount)}</strong>
                    {b.cancellationRefund != null && (
                      <span className="text-emerald-700 font-bold ml-3 bg-emerald-50 px-2 py-0.5 rounded">
                        Refund: ₹{Math.round(b.cancellationRefund)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleDownload(b.pnr)}
                      variant="outline"
                      size="sm"
                      icon={Download}
                      className="rounded-xl"
                    >
                      PDF Ticket
                    </Button>

                    {isConfirmed && (
                      <Button
                        onClick={() => openCancelModal(b)}
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        className="rounded-xl"
                      >
                        Cancel Ticket
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Ticket Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => !cancelling && setCancelModalOpen(false)}
        title="Cancel Train Ticket"
        subtitle={`PNR: ${selectedBookingForCancel?.pnr}`}
        maxWidth="max-w-md"
      >
        {cancelResult ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Cancellation Successful</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{cancelResult.message}</p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span>Original Fare:</span>
                <strong>₹{Math.round(cancelResult.totalAmount)}</strong>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Cancellation Fee:</span>
                <strong>- ₹{Math.round(cancelResult.cancellationFee)}</strong>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                <span>Refund Processed:</span>
                <strong>₹{Math.round(cancelResult.refundAmount)}</strong>
              </div>
            </div>
            <Button onClick={() => setCancelModalOpen(false)} variant="primary" fullWidth size="md">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3 text-xs text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Important Cancellation Notice</p>
                <p className="mt-1 text-amber-700 leading-relaxed">
                  Upon cancellation, your seats will be released immediately to waiting passengers. Standard Indian Railways cancellation fee will be deducted and the remaining refund will be processed back to your original payment mode.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Fare Paid</span>
                <strong className="text-slate-900">₹{Math.round(selectedBookingForCancel?.totalAmount || 0)}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated Deduction</span>
                <span>≈ ₹{selectedBookingForCancel?.coachType === 'FIRST_AC' ? '240' : selectedBookingForCancel?.coachType === 'TWO_TIER_AC' ? '200' : '180'}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                onClick={() => setCancelModalOpen(false)}
                variant="outline"
                fullWidth
                size="md"
                disabled={cancelling}
              >
                Keep Booking
              </Button>
              <Button
                onClick={handleConfirmCancel}
                loading={cancelling}
                variant="danger"
                fullWidth
                size="md"
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
