import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trainService } from '../services/trainService';
import { TrainCard } from '../components/train/TrainCard';
import { FilterSidebar } from '../components/train/FilterSidebar';
import { SearchWidget } from '../components/search/SearchWidget';
import { TrainCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Train, ArrowRight } from 'lucide-react';

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || 'CSMT';
  const to = searchParams.get('to') || 'PUNE';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialClass = searchParams.get('class') || '';

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    timeSlots: [],
    trainTypes: [],
    classes: initialClass ? [initialClass] : [],
  });

  const [sortBy, setSortBy] = useState('departure');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await trainService.searchTrains(from, to, date, initialClass);
        setTrains(data || []);
      } catch (err) {
        console.error('Failed to fetch train search results:', err);
        setError('Could not connect to railway schedule server. Please verify backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [from, to, date, initialClass]);

  const resetFilters = () => {
    setFilters({
      timeSlots: [],
      trainTypes: [],
      classes: [],
    });
    setSortBy('departure');
  };

  // Filter and sort results
  const filteredTrains = useMemo(() => {
    let result = [...trains];

    // Filter by Time Slot
    if (filters.timeSlots.length > 0) {
      result = result.filter((train) => {
        const depHour = parseInt(train.departureTime.split(':')[0], 10);
        return filters.timeSlots.some((slot) => {
          if (slot === 'early_morning') return depHour < 6;
          if (slot === 'morning') return depHour >= 6 && depHour < 12;
          if (slot === 'afternoon') return depHour >= 12 && depHour < 18;
          if (slot === 'night') return depHour >= 18;
          return true;
        });
      });
    }

    // Filter by Train Type
    if (filters.trainTypes.length > 0) {
      result = result.filter((train) => filters.trainTypes.includes(train.trainType));
    }

    // Filter by Class
    if (filters.classes.length > 0) {
      result = result.filter((train) =>
        train.classes.some((c) => filters.classes.includes(c.classCode))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'departure') {
        return a.departureTime.localeCompare(b.departureTime);
      }
      if (sortBy === 'arrival') {
        return a.arrivalTime.localeCompare(b.arrivalTime);
      }
      if (sortBy === 'duration') {
        return a.duration.localeCompare(b.duration);
      }
      if (sortBy === 'price') {
        const minA = Math.min(...a.classes.map((c) => c.totalFare));
        const minB = Math.min(...b.classes.map((c) => c.totalFare));
        return minA - minB;
      }
      return 0;
    });

    return result;
  }, [trains, filters, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Bar Modification Widget */}
      <SearchWidget
        initialFrom={from}
        initialTo={to}
        initialDate={date}
        initialClass={initialClass}
        compact
      />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            <span>{from}</span>
            <ArrowRight className="w-5 h-5 text-blue-600" />
            <span>{to}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Journey Date: <strong className="text-slate-800">{date}</strong> • Showing {filteredTrains.length} {filteredTrains.length === 1 ? 'train' : 'trains'} available
          </p>
        </div>
      </div>

      {/* Main Grid: Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-4">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            resetFilters={resetFilters}
          />
        </div>

        {/* Right Results List */}
        <div className="lg:col-span-8 space-y-5">
          {loading ? (
            <>
              <TrainCardSkeleton />
              <TrainCardSkeleton />
              <TrainCardSkeleton />
            </>
          ) : error ? (
            <EmptyState
              title="Connection Error"
              description={error}
              actionLabel="Try Again"
              onAction={() => window.location.reload()}
            />
          ) : filteredTrains.length === 0 ? (
            <EmptyState
              title="No Trains Match Your Filters"
              description="Try adjusting your time slots or train type filters to see more results."
              actionLabel="Reset All Filters"
              onAction={resetFilters}
            />
          ) : (
            filteredTrains.map((train) => (
              <TrainCard key={train.trainId} trainResult={train} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
