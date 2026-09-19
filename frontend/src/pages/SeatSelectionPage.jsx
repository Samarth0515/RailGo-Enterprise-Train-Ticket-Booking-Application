import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { trainService } from '../services/trainService';
import { bookingService } from '../services/bookingService';
import { BookingStepIndicator } from '../components/booking/BookingStepIndicator';
import { CoachSeatMap } from '../components/seat/CoachSeatMap';
import { FareSummaryCard } from '../components/booking/FareSummaryCard';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

export const SeatSelectionPage = () => {
  const navigate = useNavigate();
  const { bookingState, updateBookingState } = useBooking();
  const { isAuthenticated } = useAuth();

  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lockError, setLockError] = useState('');
  const [locking, setLocking] = useState(false);

  // If no train selected in context, redirect back to home
  useEffect(() => {
    if (!bookingState.scheduleId) {
      navigate('/');
      return;
    }

    const fetchSeatMap = async () => {
      setLoading(true);
      try {
        const data = await trainService.getCoachSeatMap(bookingState.scheduleId);
        // Filter coaches matching selected class or all
        const relevantCoaches = data.coaches?.filter(
          c => !bookingState.coachType || c.coachType === bookingState.coachType
        ) || data.coaches;

        setCoaches(relevantCoaches || []);

        // Filter out any seats that do not belong to the current train schedule coaches
        const validSeatIds = new Set(
          (relevantCoaches || []).flatMap(c => (c.seats || []).map(s => s.seatId))
        );
        const currentSeats = bookingState.selectedSeats || [];
        const validSelected = currentSeats.filter(s => validSeatIds.has(s.seatId));
        if (validSelected.length !== currentSeats.length) {
          const count = validSelected.length;
          const baseRate = bookingState.totalFarePerPassenger || 750;
          const baseFare = count > 0 ? Math.round((baseRate * 0.8) * count) : 0;
          const reservationFee = count > 0 ? 40 * count : 0;
          const isAc = bookingState.coachType?.includes('AC') || bookingState.classCode?.includes('A') || bookingState.classCode === 'CC';
          const gst = isAc ? Math.round((baseFare + reservationFee) * 0.05) : 0;
          const totalAmount = baseFare + reservationFee + gst;

          updateBookingState({
            selectedSeats: validSelected,
            passengers: [],
            baseFare,
            reservationFee,
            gst,
            totalAmount,
          });
        }
      } catch (err) {
        console.error('Error fetching seat map:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeatMap();
  }, [bookingState.scheduleId, bookingState.coachType, navigate]);

  const handleSeatToggle = (seatObj) => {
    const exists = bookingState.selectedSeats.some(s => s.seatId === seatObj.seatId);
    let updated;

    if (exists) {
      updated = bookingState.selectedSeats.filter(s => s.seatId !== seatObj.seatId);
    } else {
      if (bookingState.selectedSeats.length >= 6) {
        alert('You can select a maximum of 6 passengers per booking.');
        return;
      }
      updated = [...bookingState.selectedSeats, seatObj];
    }

    // Recompute preliminary fare
    const count = updated.length;
    const baseRate = bookingState.totalFarePerPassenger || 750;
    const baseFare = count > 0 ? Math.round((baseRate * 0.8) * count) : 0;
    const reservationFee = count > 0 ? 40 * count : 0;
    const isAc = bookingState.coachType?.includes('AC') || bookingState.classCode?.includes('A') || bookingState.classCode === 'CC';
    const gst = isAc ? Math.round((baseFare + reservationFee) * 0.05) : 0;
    const totalAmount = baseFare + reservationFee + gst;

    updateBookingState({
      selectedSeats: updated,
      baseFare,
      reservationFee,
      gst,
      totalAmount,
    });
  };

  const handleClearSeats = () => {
    updateBookingState({
      selectedSeats: [],
      passengers: [],
      baseFare: 0,
      reservationFee: 0,
      gst: 0,
      totalAmount: 0,
    });
  };

  const handleProceed = async () => {
    if (bookingState.selectedSeats.length === 0) return;

    if (!isAuthenticated) {
      navigate('/login?redirect=/booking/seats');
      return;
    }

    setLocking(true);
    setLockError('');

    try {
      // Attempt temporary seat lock on backend
      const seatIds = bookingState.selectedSeats.map(s => s.seatId);
      await bookingService.lockSeats(bookingState.scheduleId, seatIds);

      // Successfully locked: proceed to passenger details
      navigate('/booking/passengers');
    } catch (err) {
      console.error('Failed to lock seats:', err);
      setLockError(err.response?.data?.message || 'One or more of your selected seats was just taken. Please pick another seat.');
    } finally {
      setLocking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search results</span>
      </button>

      {/* Step Indicator */}
      <BookingStepIndicator currentStep={1} />

      {lockError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{lockError}</span>
        </div>
      )}

      {/* Main Grid: Seat Map + Fare Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <p className="text-sm font-semibold text-slate-500 animate-pulse">
                Loading authentic coach layout...
              </p>
            </div>
          ) : (
            <CoachSeatMap
              coaches={coaches}
              selectedSeats={bookingState.selectedSeats}
              onSeatToggle={handleSeatToggle}
              onClearSeats={handleClearSeats}
              onProceed={handleProceed}
              classCode={bookingState.classCode}
            />
          )}
        </div>

        <div className="lg:col-span-4">
          <FareSummaryCard
            train={bookingState.train}
            fromStation={bookingState.fromStation}
            toStation={bookingState.toStation}
            journeyDate={bookingState.journeyDate}
            departureTime={bookingState.departureTime}
            arrivalTime={bookingState.arrivalTime}
            coachType={bookingState.coachType}
            classCode={bookingState.classCode}
            selectedSeats={bookingState.selectedSeats}
            baseFare={bookingState.baseFare}
            reservationFee={bookingState.reservationFee}
            gst={bookingState.gst}
            totalAmount={bookingState.totalAmount}
          />
        </div>
      </div>
    </div>
  );
};
