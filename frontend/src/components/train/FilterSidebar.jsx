import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export const FilterSidebar = ({
  filters,
  setFilters,
  sortBy,
  setSortBy,
  resetFilters,
}) => {
  const timeSlots = [
    { id: 'early_morning', label: 'Early Morning', time: 'Before 06:00' },
    { id: 'morning', label: 'Morning', time: '06:00 - 12:00' },
    { id: 'afternoon', label: 'Afternoon', time: '12:00 - 18:00' },
    { id: 'night', label: 'Night', time: 'After 18:00' },
  ];

  const trainTypes = [
    { id: 'SUPERFAST', label: 'Superfast Express' },
    { id: 'EXPRESS', label: 'Express' },
    { id: 'RAJDHANI', label: 'Rajdhani / Tejas' },
    { id: 'VANDE_BHARAT', label: 'Vande Bharat' },
  ];

  const classes = [
    { id: '1A', label: 'AC First Class (1A)' },
    { id: '2A', label: 'AC 2 Tier (2A)' },
    { id: '3A', label: 'AC 3 Tier (3A)' },
    { id: 'SL', label: 'Sleeper (SL)' },
    { id: 'CC', label: 'AC Chair Car (CC)' },
    { id: '2S', label: 'Second Seating (2S)' },
  ];

  const handleTimeSlotToggle = (slotId) => {
    setFilters((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slotId)
        ? prev.timeSlots.filter((id) => id !== slotId)
        : [...prev.timeSlots, slotId],
    }));
  };

  const handleTypeToggle = (typeId) => {
    setFilters((prev) => ({
      ...prev,
      trainTypes: prev.trainTypes.includes(typeId)
        ? prev.trainTypes.filter((id) => id !== typeId)
        : [...prev.trainTypes, typeId],
    }));
  };

  const handleClassToggle = (classId) => {
    setFilters((prev) => ({
      ...prev,
      classes: prev.classes.includes(classId)
        ? prev.classes.filter((id) => id !== classId)
        : [...prev.classes, classId],
    }));
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="departure">Departure (Earliest first)</option>
          <option value="arrival">Arrival (Earliest first)</option>
          <option value="duration">Duration (Fastest first)</option>
          <option value="price">Price (Lowest first)</option>
        </select>
      </div>

      {/* Departure Time Slots */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Departure Time
        </label>
        <div className="space-y-2">
          {timeSlots.map((slot) => {
            const checked = filters.timeSlots.includes(slot.id);
            return (
              <label
                key={slot.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleTimeSlotToggle(slot.id)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`font-medium ${checked ? 'text-blue-700 font-bold' : 'text-slate-700'}`}>
                    {slot.label}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{slot.time}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Travel Class */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Journey Class
        </label>
        <div className="space-y-2">
          {classes.map((cls) => {
            const checked = filters.classes.includes(cls.id);
            return (
              <label
                key={cls.id}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleClassToggle(cls.id)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`font-medium ${checked ? 'text-blue-700 font-bold' : 'text-slate-700'}`}>
                  {cls.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Train Type */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Train Type
        </label>
        <div className="space-y-2">
          {trainTypes.map((type) => {
            const checked = filters.trainTypes.includes(type.id);
            return (
              <label
                key={type.id}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleTypeToggle(type.id)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`font-medium ${checked ? 'text-blue-700 font-bold' : 'text-slate-700'}`}>
                  {type.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
