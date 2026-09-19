import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Train, ToggleLeft, ToggleRight, Search, MapPin } from 'lucide-react';

export const AdminTrainsPage = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllTrains();
      setTrains(data || []);
    } catch (err) {
      console.error('Failed to load trains:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (train) => {
    const newStatus = train.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateTrainStatus(train.id, newStatus);
      setTrains((prev) =>
        prev.map((t) => (t.id === train.id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert('Failed to update train status.');
    }
  };

  const filteredTrains = trains.filter(
    (t) =>
      t.trainName.toLowerCase().includes(search.toLowerCase()) ||
      t.trainNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.sourceStation?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.destinationStation?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Train Fleet & Route Management">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search train name or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Fleet: <strong className="text-slate-900">{filteredTrains.length}</strong> active & scheduled trains
          </div>
        </div>

        {/* Trains Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
              Loading train schedules & routes...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Train Number</th>
                    <th className="p-4">Train Name</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Route Corridors</th>
                    <th className="p-4">Timings</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredTrains.map((train) => {
                    const isActive = train.status === 'ACTIVE';
                    return (
                      <tr key={train.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          #{train.trainNumber}
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {train.trainName}
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                            {train.trainType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          <span className="font-semibold text-slate-900">{train.sourceStation?.code}</span>
                          <span className="mx-1 text-slate-400">→</span>
                          <span className="font-semibold text-slate-900">{train.destinationStation?.code}</span>
                          <span className="text-[11px] text-slate-400 ml-1.5">({train.totalDistanceKm} km)</span>
                        </td>
                        <td className="p-4 text-slate-700">
                          {train.departureTime} → {train.arrivalTime}
                        </td>
                        <td className="p-4">
                          <Badge variant={isActive ? 'success' : 'danger'} size="sm">
                            {train.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(train)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                              isActive
                                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
