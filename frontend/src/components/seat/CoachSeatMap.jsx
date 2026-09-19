import React, { useState } from 'react';
import { Check, ShieldAlert, Train, X } from 'lucide-react';
import { Button } from '../common/Button';

export const CoachSeatMap = ({
  coaches = [],
  selectedSeats = [],
  onSeatToggle,
  onClearSeats,
  onProceed,
  maxSelectable = 6,
  classCode = '3A',
}) => {
  const [activeCoachIndex, setActiveCoachIndex] = useState(0);

  const activeCoach = coaches[activeCoachIndex] || coaches[0];

  if (!activeCoach) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">No coaches available for this train.</p>
      </div>
    );
  }

  const isSeatSelected = (seatId) => selectedSeats.some((s) => s.seatId === seatId);

  const getBerthTypeShort = (type) => {
    switch (type) {
      case 'LOWER': return 'LB';
      case 'MIDDLE': return 'MB';
      case 'UPPER': return 'UB';
      case 'SIDE_LOWER': return 'SL';
      case 'SIDE_UPPER': return 'SU';
      case 'WINDOW': return 'W';
      case 'AISLE': return 'A';
      default: return 'M';
    }
  };

  const renderSeat = (seat) => {
    const isOccupied = seat.status === 'BOOKED' || (seat.status === 'LOCKED');
    const selected = isSeatSelected(seat.seatId);

    return (
      <button
        key={seat.seatId}
        type="button"
        disabled={isOccupied}
        onClick={() => onSeatToggle({
          seatId: seat.seatId,
          seatNumber: seat.seatNumber,
          coachNumber: activeCoach.coachNumber,
          seatType: seat.seatType,
        })}
        className={`relative flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
          selected
            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1 scale-105'
            : isOccupied
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/80'
            : 'bg-white hover:bg-blue-50 text-slate-800 border border-slate-200 hover:border-blue-400 active:scale-95 shadow-2xs'
        }`}
        style={{ minWidth: '46px', minHeight: '46px' }}
        title={`Seat ${seat.seatNumber} • ${seat.seatType} • ${isOccupied ? 'Occupied' : 'Available'}`}
      >
        <span className="leading-none text-xs">{seat.seatNumber}</span>
        <span className={`text-[9px] font-semibold mt-0.5 ${selected ? 'text-blue-100' : 'text-slate-400'}`}>
          {getBerthTypeShort(seat.seatType)}
        </span>
        {selected && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">
            <Check className="w-3 h-3" />
          </span>
        )}
      </button>
    );
  };

  // Group seats into bays of 8 (Indian Railways standard 3A/SL sleeper coach)
  const renderSleeperLayout = () => {
    const seats = activeCoach.seats || [];
    const bays = [];
    for (let i = 0; i < seats.length; i += 8) {
      bays.push(seats.slice(i, i + 8));
    }

    return (
      <div className="space-y-4">
        {bays.map((bay, bayIdx) => {
          const mainBerths = bay.slice(0, 6);
          const sideBerths = bay.slice(6, 8);

          return (
            <div key={bayIdx} className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-4">
              {/* Main 6 Berths: Left (1,2,3) & Right (4,5,6) */}
              <div className="grid grid-cols-3 gap-2">
                {mainBerths.map(seat => renderSeat(seat))}
              </div>

              {/* Aisle Walkway */}
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest rotate-90 select-none py-1">
                Aisle
              </div>

              {/* Side 2 Berths (7, 8) */}
              <div className="flex flex-col gap-2">
                {sideBerths.map(seat => renderSeat(seat))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Chair Car / 2S Layout: 3x2 with center aisle
  const renderChairCarLayout = () => {
    const seats = activeCoach.seats || [];
    const rows = [];
    for (let i = 0; i < seats.length; i += 5) {
      rows.push(seats.slice(i, i + 5));
    }

    return (
      <div className="space-y-2">
        {rows.map((row, rowIdx) => {
          const leftSide = row.slice(0, 3);
          const rightSide = row.slice(3, 5);

          return (
            <div key={rowIdx} className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {leftSide.map(seat => renderSeat(seat))}
              </div>
              <div className="text-[9px] font-bold text-slate-300 uppercase tracking-wider select-none">
                Aisle
              </div>
              <div className="flex gap-2">
                {rightSide.map(seat => renderSeat(seat))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6 space-y-6">
      {/* Top Coach Selector Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Train className="w-4 h-4 text-blue-600" />
            Select Coach ({classCode})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Max {maxSelectable} {maxSelectable === 1 ? 'seat' : 'seats'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {coaches.map((c, idx) => (
            <button
              key={c.coachNumber}
              type="button"
              onClick={() => setActiveCoachIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeCoachIndex === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Coach {c.coachNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-white border border-slate-300 shadow-2xs"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-blue-600 text-white flex items-center justify-center">
            <Check className="w-3 h-3" />
          </div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-slate-200 border border-slate-300"></div>
          <span>Occupied</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-400">
          <span>LB: Lower</span> • <span>MB: Middle</span> • <span>UB: Upper</span> • <span>SL: Side Lower</span>
        </div>
      </div>

      {/* Coach Layout Body */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white max-h-[480px] overflow-y-auto">
        <div className="text-center pb-3 text-xs font-extrabold text-slate-400 tracking-wider uppercase flex items-center justify-center gap-2">
          <span>🚪 Entry Door</span>
          <div className="h-px bg-slate-200 flex-1"></div>
          <span>Coach {activeCoach.coachNumber}</span>
          <div className="h-px bg-slate-200 flex-1"></div>
          <span>🚪 Restroom</span>
        </div>

        {activeCoach.coachType === 'CHAIR_CAR' || activeCoach.coachType === 'SECOND_SEATING'
          ? renderChairCarLayout()
          : renderSleeperLayout()}
      </div>

      {/* Selected Seats Bar and Proceed CTA */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Berths</p>
            {selectedSeats.length > 0 && onClearSeats && (
              <button
                type="button"
                onClick={onClearSeats}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Clear All (Reset to 0)
              </button>
            )}
          </div>
          {selectedSeats.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {selectedSeats.map((s) => (
                <span
                  key={s.seatId}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg pl-2.5 pr-1.5 py-1 shadow-2xs"
                >
                  <span>{s.coachNumber}-{s.seatNumber} ({getBerthTypeShort(s.seatType)})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeatToggle(s);
                    }}
                    className="p-0.5 rounded text-blue-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Deselect seat"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic mt-0.5">Click berths above to select seats</p>
          )}
        </div>

        <Button
          onClick={onProceed}
          disabled={selectedSeats.length === 0}
          variant="primary"
          size="md"
          className="rounded-xl px-6 w-full sm:w-auto"
        >
          <span>Continue to Passengers ({selectedSeats.length})</span>
        </Button>
      </div>
    </div>
  );
};
