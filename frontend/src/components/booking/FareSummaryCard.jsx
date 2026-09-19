import React from 'react';
import { Train, ShieldCheck, Calendar, MapPin } from 'lucide-react';

export const FareSummaryCard = ({
  train,
  fromStation,
  toStation,
  journeyDate,
  departureTime,
  arrivalTime,
  coachType,
  classCode,
  selectedSeats = [],
  passengers = [],
  baseFare = 0,
  reservationFee = 0,
  gst = 0,
  totalAmount = 0,
}) => {
  const passengerCount = passengers.length || selectedSeats.length || 1;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle space-y-5 sticky top-24">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
        Fare & Journey Summary
      </h3>

      {/* Train Info */}
      <div className="pb-4 border-b border-slate-100 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              {train?.trainName || 'Selected Train'}
            </h4>
            <span className="text-xs text-slate-400 font-semibold">
              #{train?.trainNumber} • {classCode} ({coachType})
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
          <span className="font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {fromStation?.code} ({departureTime}) → {toStation?.code} ({arrivalTime})
          </span>
          <span className="text-slate-500 font-medium">{journeyDate}</span>
        </div>
      </div>

      {/* Selected Berths */}
      {selectedSeats.length > 0 && (
        <div className="pb-4 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-700 mb-1.5">Allocated Berths ({selectedSeats.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedSeats.map((s, i) => (
              <span key={i} className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                {s.coachNumber}-{s.seatNumber}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Itemized Fare */}
      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Ticket Base Fare ({passengerCount} × ₹{Math.round(baseFare / passengerCount || 0)})</span>
          <span className="font-semibold text-slate-900">₹{Math.round(baseFare)}</span>
        </div>
        <div className="flex justify-between">
          <span>Reservation / IRCTC Fee</span>
          <span className="font-semibold text-slate-900">₹{Math.round(reservationFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST (5% for AC Classes)</span>
          <span className="font-semibold text-slate-900">₹{Math.round(gst)}</span>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
          <span className="font-extrabold text-slate-900">Total Fare</span>
          <span className="text-xl font-black text-blue-600">₹{Math.round(totalAmount)}</span>
        </div>
      </div>

      {/* Guarantee Badge */}
      <div className="pt-2">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Pessimistic Seat Lock Active:</strong> Your selected berths are reserved exclusively for you during checkout.
          </span>
        </div>
      </div>
    </div>
  );
};
