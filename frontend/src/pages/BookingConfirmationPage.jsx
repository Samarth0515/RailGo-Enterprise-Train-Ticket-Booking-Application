import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useBooking } from '../context/BookingContext';
import { Button } from '../components/common/Button';
import { BookingStepIndicator } from '../components/booking/BookingStepIndicator';
import { CheckCircle2, Download, Ticket, ArrowRight, Train, Printer, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BookingConfirmationPage = () => {
  const { pnr } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clearBooking } = useBooking();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Clear booking state so any subsequent bookings start with 0 seats
    clearBooking();

    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    if (!booking && pnr) {
      setLoading(true);
      bookingService.getBookingByPnr(pnr)
        .then((data) => setBooking(data))
        .catch((err) => console.error('Error fetching confirmed booking:', err))
        .finally(() => setLoading(false));
    }
  }, [pnr, booking]);

  const handleDownloadPdf = async () => {
    if (!booking?.pnr) return;
    setDownloading(true);
    try {
      await bookingService.downloadTicketPdf(booking.pnr);
    } catch (err) {
      alert('Could not download PDF at this time.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading reservation status...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Booking Record Not Found</h3>
        <p className="text-xs text-slate-500">We could not retrieve details for PNR: {pnr}</p>
        <Link to="/"><Button variant="primary">Return Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <BookingStepIndicator currentStep={5} />

      {/* Celebratory Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-75 duration-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking Confirmed!</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Your reservation is officially confirmed by Indian Railways. We have sent an SMS and email with your ticket slip.
        </p>
      </div>

      {/* Ticket Slip Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-elevated overflow-hidden">
        {/* PNR Ribbon */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-700 text-white p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-200 font-bold block">
              Passenger Name Record (PNR)
            </span>
            <span className="text-3xl font-black tracking-wider text-white mt-0.5 block font-mono">
              {booking.pnr}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-white text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-xs">
              {booking.status}
            </span>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-xs">
              <QrCode className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Train Title */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{booking.trainName}</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Train #{booking.trainNumber} • Class: {booking.classCode} ({booking.coachType})
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase">Date of Journey</span>
              <p className="text-sm font-bold text-slate-800">{booking.journeyDate}</p>
            </div>
          </div>

          {/* Timing Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">From Station</span>
              <p className="font-bold text-slate-900 mt-0.5">{booking.fromStationName}</p>
              <span className="text-[11px] text-blue-600 font-bold">({booking.fromStationCode})</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Departure Time</span>
              <p className="font-bold text-slate-900 mt-0.5">{booking.departureTime} hrs</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">To Station</span>
              <p className="font-bold text-slate-900 mt-0.5">{booking.toStationName}</p>
              <span className="text-[11px] text-indigo-600 font-bold">({booking.toStationCode})</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Arrival Time</span>
              <p className="font-bold text-slate-900 mt-0.5">{booking.arrivalTime} hrs</p>
            </div>
          </div>

          {/* Passenger Berth Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Allocated Passengers & Berths
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Passenger Name</th>
                    <th className="p-3">Age / Gender</th>
                    <th className="p-3">Coach</th>
                    <th className="p-3 text-right">Berth / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {booking.passengers?.map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td className="p-3 text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 text-slate-600">{p.age} yrs • {p.gender}</td>
                      <td className="p-3 font-extrabold text-blue-600">{p.coachNumber}</td>
                      <td className="p-3 text-right">
                        <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                          Seat {p.seatNumber} ({p.seatType || 'Berth'})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fare Summary Total */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
            <div>
              <span className="text-slate-400">Total Paid Amount:</span>
              <strong className="text-slate-900 text-sm ml-1.5">₹{Math.round(booking.totalAmount)}</strong>
              <span className="text-slate-400 ml-2">(Inclusive of GST & IRCTC charges)</span>
            </div>
            {booking.payment && (
              <span className="text-slate-400">
                Txn ID: <strong className="font-mono text-slate-600">{booking.payment.transactionId}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleDownloadPdf}
              loading={downloading}
              variant="primary"
              size="md"
              icon={Download}
              className="rounded-xl w-full sm:w-auto"
            >
              Download PDF Ticket
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="md"
              icon={Printer}
              className="rounded-xl hidden sm:inline-flex"
            >
              Print
            </Button>
          </div>

          <Link to="/my-bookings" className="w-full sm:w-auto">
            <Button variant="ghost" size="md" className="rounded-xl w-full sm:w-auto">
              <span>View in My Trips</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
