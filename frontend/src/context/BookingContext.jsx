import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [bookingState, setBookingState] = useState(() => {
    const saved = sessionStorage.getItem('railgo_booking_state');
    return saved ? JSON.parse(saved) : {
      train: null,
      scheduleId: null,
      fromStation: null,
      toStation: null,
      journeyDate: '',
      departureTime: '',
      arrivalTime: '',
      duration: '',
      coachType: '',
      classDisplayName: '',
      totalFarePerPassenger: 0,
      selectedSeats: [], // Array of seat objects { seatId, seatNumber, coachNumber, seatType, price }
      passengers: [], // Array of passenger objects { name, age, gender, seatPreference, seatId, coachNumber, seatNumber }
      baseFare: 0,
      reservationFee: 0,
      gst: 0,
      totalAmount: 0,
    };
  });

  useEffect(() => {
    sessionStorage.setItem('railgo_booking_state', JSON.stringify(bookingState));
  }, [bookingState]);

  const updateBookingState = (updates) => {
    setBookingState((prev) => ({ ...prev, ...updates }));
  };

  const clearBooking = () => {
    sessionStorage.removeItem('railgo_booking_state');
    setBookingState({
      train: null,
      scheduleId: null,
      fromStation: null,
      toStation: null,
      journeyDate: '',
      departureTime: '',
      arrivalTime: '',
      duration: '',
      coachType: '',
      classCode: '',
      classDisplayName: '',
      totalFarePerPassenger: 0,
      selectedSeats: [],
      passengers: [],
      baseFare: 0,
      reservationFee: 0,
      gst: 0,
      totalAmount: 0,
    });
  };

  const resetSeats = () => {
    setBookingState((prev) => ({
      ...prev,
      selectedSeats: [],
      passengers: [],
      baseFare: 0,
      reservationFee: 0,
      gst: 0,
      totalAmount: 0,
    }));
  };

  return (
    <BookingContext.Provider
      value={{
        bookingState,
        updateBookingState,
        clearBooking,
        resetSeats,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
