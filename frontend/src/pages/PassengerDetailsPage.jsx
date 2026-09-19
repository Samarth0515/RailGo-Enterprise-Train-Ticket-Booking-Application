import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { BookingStepIndicator } from '../components/booking/BookingStepIndicator';
import { FareSummaryCard } from '../components/booking/FareSummaryCard';
import { Button } from '../components/common/Button';
import { ArrowLeft, ArrowRight, User as UserIcon, Plus, Trash2 } from 'lucide-react';

export const PassengerDetailsPage = () => {
  const navigate = useNavigate();
  const { bookingState, updateBookingState } = useBooking();
  const { user } = useAuth();

  // Initialize passengers list from selected seats or user profile
  const [passengers, setPassengers] = useState(() => {
    if (bookingState.selectedSeats?.length > 0) {
      if (bookingState.passengers?.length === bookingState.selectedSeats.length) {
        return bookingState.passengers.map((p, index) => ({
          ...p,
          seatId: bookingState.selectedSeats[index].seatId,
          coachNumber: bookingState.selectedSeats[index].coachNumber,
          seatNumber: bookingState.selectedSeats[index].seatNumber,
          seatPreference: bookingState.selectedSeats[index].seatType || p.seatPreference || 'LOWER',
        }));
      }

      return bookingState.selectedSeats.map((seat, index) => ({
        name: index === 0 ? user?.name || '' : '',
        age: index === 0 ? 25 : 24,
        gender: 'MALE',
        seatPreference: seat.seatType || 'LOWER',
        seatId: seat.seatId,
        coachNumber: seat.coachNumber,
        seatNumber: seat.seatNumber,
      }));
    }

    // Default 1 passenger
    return [
      {
        name: user?.name || '',
        age: 25,
        gender: 'MALE',
        seatPreference: 'LOWER',
        seatId: null,
        coachNumber: null,
        seatNumber: null,
      },
    ];
  });

  const [contactMobile, setContactMobile] = useState(user?.mobile || '9890123456');
  const [contactEmail, setContactEmail] = useState(user?.email || 'passenger@railgo.com');

  useEffect(() => {
    if (!bookingState.scheduleId) {
      navigate('/');
    }
  }, [bookingState.scheduleId, navigate]);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleAddPassenger = () => {
    if (passengers.length >= 6) {
      alert('Maximum 6 passengers allowed per booking.');
      return;
    }
    setPassengers([
      ...passengers,
      {
        name: '',
        age: 24,
        gender: 'MALE',
        seatPreference: 'LOWER',
        seatId: null,
        coachNumber: null,
        seatNumber: null,
      },
    ]);
  };

  const handleRemovePassenger = (index) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    for (const p of passengers) {
      if (!p.name.trim()) {
        alert('Please enter names for all passengers.');
        return;
      }
      if (!p.age || p.age < 1 || p.age > 120) {
        alert('Please enter a valid age for all passengers.');
        return;
      }
    }

    // Recalculate fare for total passengers
    const count = passengers.length;
    const baseRate = bookingState.totalFarePerPassenger || 750;
    const baseFare = Math.round((baseRate * 0.8) * count);
    const reservationFee = 40 * count;
    const isAc = bookingState.coachType?.includes('AC') || bookingState.classCode?.includes('A') || bookingState.classCode === 'CC';
    const gst = isAc ? Math.round((baseFare + reservationFee) * 0.05) : 0;
    const totalAmount = baseFare + reservationFee + gst;

    updateBookingState({
      passengers,
      contactMobile,
      contactEmail,
      baseFare,
      reservationFee,
      gst,
      totalAmount,
    });

    navigate('/booking/review');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to seat map</span>
      </button>

      <BookingStepIndicator currentStep={2} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Passenger Cards */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Passenger Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Please ensure names match your government photo identity proof.</p>
              </div>
              <button
                type="button"
                onClick={handleAddPassenger}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Passenger</span>
              </button>
            </div>

            {/* Passenger Rows */}
            <div className="space-y-4">
              {passengers.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 relative group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                      Passenger {idx + 1}
                    </span>

                    {p.coachNumber && p.seatNumber && (
                      <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-lg">
                        Berth: {p.coachNumber}-{p.seatNumber} ({p.seatPreference})
                      </span>
                    )}

                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePassenger(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove passenger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Full Name (as per Govt ID)
                      </label>
                      <input
                        type="text"
                        required
                        value={p.name}
                        onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Rahul Patil"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-semibold text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        required
                        value={p.age}
                        onChange={(e) => handlePassengerChange(idx, 'age', Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-semibold text-slate-900 text-center"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Gender
                      </label>
                      <select
                        value={p.gender}
                        onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                        className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs font-semibold text-slate-900 cursor-pointer"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Preference
                      </label>
                      <select
                        value={p.seatPreference}
                        onChange={(e) => handlePassengerChange(idx, 'seatPreference', e.target.value)}
                        className="w-full px-2 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs font-semibold text-slate-900 cursor-pointer"
                      >
                        <option value="LOWER">Lower</option>
                        <option value="MIDDLE">Middle</option>
                        <option value="UPPER">Upper</option>
                        <option value="SIDE_LOWER">Side Lower</option>
                        <option value="SIDE_UPPER">Side Upper</option>
                        <option value="WINDOW">Window</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Details Section */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Ticket Delivery Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (SMS)</label>
                  <input
                    type="tel"
                    required
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (E-Ticket PDF)</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="lg" className="rounded-xl px-8">
                <span>Review Journey</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Summary */}
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
            passengers={passengers}
            baseFare={bookingState.baseFare}
            reservationFee={bookingState.reservationFee}
            gst={bookingState.gst}
            totalAmount={bookingState.totalAmount}
          />
        </div>
      </form>
    </div>
  );
};
