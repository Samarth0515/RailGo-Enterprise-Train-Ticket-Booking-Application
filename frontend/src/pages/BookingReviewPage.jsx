import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { BookingStepIndicator } from '../components/booking/BookingStepIndicator';
import { MockPaymentModal } from '../components/booking/MockPaymentModal';
import { Button } from '../components/common/Button';
import { Train, Clock, User, ShieldCheck, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

export const BookingReviewPage = () => {
  const navigate = useNavigate();
  const { bookingState, updateBookingState, clearBooking } = useBooking();
  const { isAuthenticated } = useAuth();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!bookingState.scheduleId || !bookingState.passengers?.length) {
      navigate('/');
    }
  }, [bookingState.scheduleId, bookingState.passengers, navigate]);

  const handlePaymentSuccess = async (paymentData) => {
    setShowPaymentModal(false);
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        scheduleId: bookingState.scheduleId,
        fromStationId: bookingState.fromStation.id,
        toStationId: bookingState.toStation.id,
        coachType: bookingState.coachType,
        passengers: bookingState.passengers.map(p => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          seatPreference: p.seatPreference,
          seatId: p.seatId,
          coachNumber: p.coachNumber,
          seatNumber: p.seatNumber,
        })),
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.paymentReference,
      };

      const response = await bookingService.createBooking(payload);

      // Successfully confirmed booking - clear booking session so new bookings start with 0 seats
      clearBooking();
      navigate(`/booking/confirmation/${response.pnr}`, { state: { booking: response } });
    } catch (err) {
      console.error('Booking submission error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Booking transaction failed. The selected seat may have just expired or been taken.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to passenger details</span>
      </button>

      <BookingStepIndicator currentStep={3} />

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Itinerary Card */}
        <div className="md:col-span-8 space-y-6">
          {/* Journey Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {bookingState.train?.trainName}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Train #{bookingState.train?.trainNumber} • {bookingState.classDisplayName || bookingState.classCode} ({bookingState.coachType})
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                Date: {bookingState.journeyDate}
              </span>
            </div>

            {/* Departure / Arrival Timeline */}
            <div className="grid grid-cols-3 items-center py-2">
              <div>
                <span className="text-2xl font-black text-slate-900">{bookingState.departureTime}</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{bookingState.fromStation?.name}</p>
                <span className="text-xs font-semibold text-slate-400">({bookingState.fromStation?.code})</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {bookingState.duration}
                </span>
                <div className="w-full h-0.5 bg-slate-200 relative">
                  <div className="absolute w-2 h-2 rounded-full bg-blue-600 left-0 -top-[3px]"></div>
                  <div className="absolute w-2 h-2 rounded-full bg-blue-600 right-0 -top-[3px]"></div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">{bookingState.arrivalTime}</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{bookingState.toStation?.name}</p>
                <span className="text-xs font-semibold text-slate-400">({bookingState.toStation?.code})</span>
              </div>
            </div>

            {/* Passengers Table */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Confirmed Passenger Berths
              </h4>
              <div className="space-y-2">
                {bookingState.passengers?.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className="text-slate-400">({p.age} yrs • {p.gender})</span>
                    </div>

                    <div className="font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-lg">
                      Coach {p.coachNumber || 'B2'} • Seat {p.seatNumber || (40 + idx)} ({p.seatPreference})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancellation Notice */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-800 space-y-1">
              <p className="font-bold">Indian Railways Cancellation & Refund Guarantee</p>
              <p className="text-amber-700 leading-relaxed">
                Tickets cancelled before chart preparation are eligible for instant automated refund deduction (₹{bookingState.coachType === 'FIRST_AC' ? '240' : bookingState.coachType === 'TWO_TIER_AC' ? '200' : '180'} per ticket).
              </p>
            </div>
          </div>
        </div>

        {/* Right Checkout Action Card */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Payment Breakdown</h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span className="font-semibold text-slate-900">₹{Math.round(bookingState.baseFare)}</span>
              </div>
              <div className="flex justify-between">
                <span>Reservation Charge</span>
                <span className="font-semibold text-slate-900">₹{Math.round(bookingState.reservationFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-semibold text-slate-900">₹{Math.round(bookingState.gst)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-extrabold text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-blue-600">₹{Math.round(bookingState.totalAmount)}</span>
              </div>
            </div>

            <Button
              onClick={() => setShowPaymentModal(true)}
              loading={submitting}
              variant="primary"
              size="lg"
              fullWidth
              className="rounded-2xl shadow-md text-base"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs text-center pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified 256-bit Bank Grade Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Payment Gateway Modal */}
      <MockPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={bookingState.totalAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
