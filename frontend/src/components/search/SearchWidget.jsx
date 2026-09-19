import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Calendar, Users, MapPin, Search, ChevronDown } from 'lucide-react';
import { trainService } from '../../services/trainService';
import { Button } from '../common/Button';

export const SearchWidget = ({ 
  initialFrom = 'CSMT', 
  initialTo = 'PUNE', 
  initialDate = '', 
  initialClass = '', 
  compact = false 
}) => {
  const navigate = useNavigate();

  // Get tomorrow's date by default
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [fromCode, setFromCode] = useState(initialFrom);
  const [toCode, setToCode] = useState(initialTo);
  const [date, setDate] = useState(initialDate || getTomorrow());
  const [coachClass, setCoachClass] = useState(initialClass);
  const [passengersCount, setPassengersCount] = useState(1);

  const [stations, setStations] = useState([]);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    trainService.getStations()
      .then((data) => setStations(data))
      .catch((err) => {
        // Fallback popular stations if backend not yet ready
        setStations([
          { code: 'CSMT', name: 'Mumbai CSMT', city: 'Mumbai' },
          { code: 'PUNE', name: 'Pune Junction', city: 'Pune' },
          { code: 'NDLS', name: 'New Delhi', city: 'New Delhi' },
          { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai' },
          { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru' },
          { code: 'MAS', name: 'Chennai Central', city: 'Chennai' },
          { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' },
        ]);
      });
  }, []);

  // Sync display names
  const getStationLabel = (code) => {
    const s = stations.find((item) => item.code.toUpperCase() === code.toUpperCase());
    return s ? `${s.city} (${s.code})` : code;
  };

  const swapStations = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!fromCode || !toCode || !date) return;
    const query = new URLSearchParams({
      from: fromCode,
      to: toCode,
      date,
      ...(coachClass && { class: coachClass }),
      passengers: passengersCount,
    }).toString();
    navigate(`/search?${query}`);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) setShowFromDropdown(false);
      if (toRef.current && !toRef.current.contains(e.target)) setShowToDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredFromStations = stations.filter(s =>
    s.name.toLowerCase().includes(fromSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(fromSearch.toLowerCase()) ||
    s.city.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToStations = stations.filter(s =>
    s.name.toLowerCase().includes(toSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(toSearch.toLowerCase()) ||
    s.city.toLowerCase().includes(toSearch.toLowerCase())
  );

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white rounded-3xl shadow-elevated border border-slate-200/90 ${
        compact ? 'p-4' : 'p-6 sm:p-8'
      } relative z-20`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* From Station */}
        <div className="md:col-span-3 relative" ref={fromRef}>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            From Station
          </label>
          <div
            onClick={() => setShowFromDropdown(true)}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:border-blue-500 bg-slate-50/60 hover:bg-white cursor-pointer transition-all"
          >
            <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-slate-900 truncate">
                {getStationLabel(fromCode) || 'Select Origin'}
              </span>
              <span className="block text-[11px] text-slate-400 truncate">
                {stations.find(s => s.code === fromCode)?.name || 'Origin railway terminal'}
              </span>
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {showFromDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-elevated border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <input
                type="text"
                placeholder="Search station or city..."
                value={fromSearch}
                onChange={(e) => setFromSearch(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <div className="max-h-56 overflow-y-auto space-y-1">
                {filteredFromStations.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      setFromCode(s.code);
                      setShowFromDropdown(false);
                      setFromSearch('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{s.city} ({s.code})</p>
                      <p className="text-xs text-slate-500 truncate">{s.name}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded">
                      {s.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 md:my-0 md:col-span-1">
          <button
            type="button"
            onClick={swapStations}
            className="w-10 h-10 rounded-full border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-all shadow-xs active:scale-90"
            title="Swap stations"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* To Station */}
        <div className="md:col-span-3 relative" ref={toRef}>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            To Station
          </label>
          <div
            onClick={() => setShowToDropdown(true)}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:border-blue-500 bg-slate-50/60 hover:bg-white cursor-pointer transition-all"
          >
            <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-slate-900 truncate">
                {getStationLabel(toCode) || 'Select Destination'}
              </span>
              <span className="block text-[11px] text-slate-400 truncate">
                {stations.find(s => s.code === toCode)?.name || 'Arrival station'}
              </span>
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {showToDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-elevated border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <input
                type="text"
                placeholder="Search station or city..."
                value={toSearch}
                onChange={(e) => setToSearch(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <div className="max-h-56 overflow-y-auto space-y-1">
                {filteredToStations.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      setToCode(s.code);
                      setShowToDropdown(false);
                      setToSearch('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{s.city} ({s.code})</p>
                      <p className="text-xs text-slate-500 truncate">{s.name}</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded">
                      {s.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Departure Date */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Departure Date
          </label>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:border-blue-500 bg-slate-50/60 hover:bg-white transition-all">
            <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="flex-1">
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Search Submit Button */}
        <div className="md:col-span-2 pt-2 md:pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            icon={Search}
            className="rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Class and Passenger Quick Filters */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Class:</span>
          <select
            value={coachClass}
            onChange={(e) => setCoachClass(e.target.value)}
            className="bg-slate-100/80 hover:bg-slate-200/80 border-none rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Classes</option>
            <option value="1A">AC First Class (1A)</option>
            <option value="2A">AC 2 Tier (2A)</option>
            <option value="3A">AC 3 Tier (3A)</option>
            <option value="SL">Sleeper (SL)</option>
            <option value="CC">AC Chair Car (CC)</option>
            <option value="2S">Second Seating (2S)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Passengers:</span>
          <select
            value={passengersCount}
            onChange={(e) => setPassengersCount(Number(e.target.value))}
            className="bg-slate-100/80 hover:bg-slate-200/80 border-none rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          Live Railway Seat Status
        </div>
      </div>
    </form>
  );
};
