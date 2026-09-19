import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Clock, ArrowRight, ChevronDown, ChevronUp, MapPin, Check } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useBooking } from '../../context/BookingContext';
import { trainService } from '../../services/trainService';

export const TrainCard = ({ trainResult }) => {
  const navigate = useNavigate();
  const { updateBookingState } = useBooking();
  const [selectedClass, setSelectedClass] = useState(trainResult.classes[0]?.classCode || '');
  const [expandedRoute, setExpandedRoute] = useState(false);
  const [routeStops, setRouteStops] = useState(null);
  const [loadingStops, setLoadingStops] = useState(false);

  const selectedClassObj = trainResult.classes.find(c => c.classCode === selectedClass) || trainResult.classes[0];

  const handleToggleRoute = async () => {
    if (!expandedRoute && !routeStops) {
      setLoadingStops(true);
      try {
        const details = await trainService.getTrainDetails(trainResult.trainId);
        setRouteStops(details.stops || []);
      } catch (err) {
        console.error('Error fetching stops:', err);
      } finally {
        setLoadingStops(false);
      }
    }
    setExpandedRoute(!expandedRoute);
  };

  const handleProceedToSeats = () => {
    updateBookingState({
      train: {
        id: trainResult.trainId,
        trainNumber: trainResult.trainNumber,
        trainName: trainResult.trainName,
        trainType: trainResult.trainType,
      },
      scheduleId: trainResult.scheduleId,
      fromStation: {
        id: trainResult.fromStationId,
        code: trainResult.fromStationCode,
        name: trainResult.fromStationName,
      },
      toStation: {
        id: trainResult.toStationId,
        code: trainResult.toStationCode,
        name: trainResult.toStationName,
      },
      journeyDate: trainResult.journeyDate,
      departureTime: trainResult.departureTime,
      arrivalTime: trainResult.arrivalTime,
      duration: trainResult.duration,
      coachType: selectedClassObj.coachType,
      classCode: selectedClassObj.classCode,
      classDisplayName: selectedClassObj.displayName,
      totalFarePerPassenger: selectedClassObj.totalFare,
      selectedSeats: [],
      passengers: [],
      baseFare: 0,
      reservationFee: 0,
      gst: 0,
      totalAmount: 0,
    });

    navigate('/booking/seats');
  };

  const getStatusBadge = (statusBadge) => {
    if (statusBadge.startsWith('AVAILABLE')) {
      return <Badge variant="success" size="sm">{statusBadge}</Badge>;
    } else if (statusBadge.startsWith('RAC')) {
      return <Badge variant="warning" size="sm">{statusBadge}</Badge>;
    } else {
      return <Badge variant="danger" size="sm">{statusBadge}</Badge>;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl p-6 shadow-subtle hover:shadow-card transition-all">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {trainResult.trainName}
              </h3>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                #{trainResult.trainNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Runs on all days • {trainResult.trainType}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleRoute}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <span>Route & Halts</span>
          {expandedRoute ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Timing and Route Progression */}
      <div className="py-5 grid grid-cols-1 md:grid-cols-12 items-center gap-4">
        {/* Origin */}
        <div className="md:col-span-4 flex items-center gap-3">
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {trainResult.departureTime}
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {trainResult.fromStationName}
            </p>
            <span className="text-xs font-semibold text-slate-400">
              Station code: {trainResult.fromStationCode}
            </span>
          </div>
        </div>

        {/* Journey Duration Bar */}
        <div className="md:col-span-4 flex flex-col items-center justify-center px-4">
          <span className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {trainResult.duration}
          </span>
          <div className="relative w-full flex items-center justify-center">
            <div className="w-full h-0.5 bg-slate-200"></div>
            <div className="absolute w-2 h-2 rounded-full bg-blue-600 left-0"></div>
            <div className="absolute w-2 h-2 rounded-full bg-blue-600 right-0"></div>
            <div className="absolute bg-white px-2 text-[10px] font-semibold text-slate-400 border border-slate-200 rounded-full">
              {trainResult.stopsCount} {trainResult.stopsCount === 1 ? 'stop' : 'stops'}
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {Math.round(trainResult.distanceKm)} km
          </span>
        </div>

        {/* Destination */}
        <div className="md:col-span-4 flex items-center justify-end text-right gap-3">
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {trainResult.arrivalTime}
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {trainResult.toStationName}
            </p>
            <span className="text-xs font-semibold text-slate-400">
              Station code: {trainResult.toStationCode}
            </span>
          </div>
        </div>
      </div>

      {/* Class Tiles and Live Fare */}
      <div className="pt-4 border-t border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Select Travel Class
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {trainResult.classes.map((cls) => {
            const isSelected = selectedClass === cls.classCode;
            return (
              <div
                key={cls.classCode}
                onClick={() => setSelectedClass(cls.classCode)}
                className={`relative p-3 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{cls.classCode}</span>
                  <span className="text-sm font-extrabold text-blue-700">₹{Math.round(cls.totalFare)}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mb-1.5">{cls.displayName}</p>
                <div>
                  {getStatusBadge(cls.statusBadge)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Selected: <strong className="text-slate-900">{selectedClassObj.displayName} ({selectedClassObj.classCode})</strong> • Fare: <strong className="text-blue-700">₹{Math.round(selectedClassObj.totalFare)}</strong>
          </div>

          <Button
            onClick={handleProceedToSeats}
            variant="primary"
            size="md"
            className="rounded-xl px-6"
          >
            <span>View Coach & Select Seats</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Expandable Route Timeline */}
      {expandedRoute && (
        <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in slide-in-from-top-3 duration-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Intermediate Station Schedule
          </h4>

          {loadingStops ? (
            <p className="text-xs text-slate-400">Loading schedule...</p>
          ) : (
            <div className="space-y-3 pl-2">
              {routeStops?.map((stop, idx) => (
                <div key={stop.id} className="relative flex items-start gap-4 text-xs">
                  {/* Timeline bullet and line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      stop.stationCode === trainResult.fromStationCode || stop.stationCode === trainResult.toStationCode
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-slate-300'
                    }`} />
                    {idx < routeStops.length - 1 && <div className="w-0.5 h-7 bg-slate-200 my-0.5" />}
                  </div>

                  <div className="flex-1 flex items-center justify-between pb-1">
                    <div>
                      <span className="font-bold text-slate-800">{stop.stationName} ({stop.stationCode})</span>
                      <span className="text-slate-400 ml-2">Platform {stop.platform || '1'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-700">Arr: {stop.arrivalTime} • Dep: {stop.departureTime}</span>
                      <span className="text-slate-400 ml-2">({Math.round(stop.distanceFromSourceKm)} km)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
