import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  Users, 
  Train, 
  Ticket, 
  IndianRupee, 
  TrendingUp, 
  Percent, 
  ArrowUpRight, 
  CheckCircle2 
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Error fetching admin dashboard stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout title="System Overview">
        <div className="p-12 text-center">
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading platform metrics & analytics...</p>
        </div>
      </AdminLayout>
    );
  }

  const kpis = [
    {
      label: 'Total Registered Passengers',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Scheduled Trains',
      value: stats?.totalTrains || 0,
      icon: Train,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Total Confirmed Bookings',
      value: stats?.confirmedBookings || 0,
      icon: Ticket,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Gross Platform Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <AdminLayout title="Executive Railway Dashboard">
      <div className="space-y-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {kpi.label}
                  </span>
                  <div className={`w-10 h-10 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center font-bold`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Real-time telemetry</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 7-Day Trend Chart & Class Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Daily Trend Chart (SVG) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">7-Day Booking Volume & Revenue Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated aggregation across all routes</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                Past Week
              </span>
            </div>

            {/* SVG Visual Graph */}
            <div className="space-y-4">
              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                {stats?.recentBookingsTrend?.map((item, idx) => {
                  const maxCount = Math.max(...(stats.recentBookingsTrend.map(t => t.bookingsCount) || [1]), 10);
                  const barHeight = Math.max(15, (item.bookingsCount / maxCount) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {item.bookingsCount} bookings • ₹{Math.round(item.revenue)}
                      </div>

                      <div className="w-full max-w-[42px] bg-blue-100 group-hover:bg-blue-200 rounded-xl overflow-hidden flex flex-col justify-end h-36 p-1">
                        <div
                          className="w-full bg-blue-600 group-hover:bg-blue-700 rounded-lg transition-all duration-300"
                          style={{ height: `${barHeight}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 truncate">{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Revenue by Class Breakdown */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-5">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Revenue by Class
            </h3>

            <div className="space-y-3">
              {stats?.revenueByClass &&
                Object.entries(stats.revenueByClass).map(([classCode, amount]) => {
                  return (
                    <div key={classCode} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 block">{classCode}</span>
                        <span className="text-slate-400 text-[10px]">Indian Railways Quota</span>
                      </div>
                      <span className="text-sm font-black text-blue-700">₹{Math.round(amount)}</span>
                    </div>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Cancellation Rate:</span>
                <strong className="text-rose-600 font-bold">{stats?.cancellationRate || 0}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Today's Bookings:</span>
                <strong className="text-slate-900 font-bold">{stats?.todayBookings || 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Top Trains Occupancy Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Train Occupancy & Fleet Capacity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live passenger load across active corridors</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="pb-3">Train Number</th>
                  <th className="pb-3">Train Name</th>
                  <th className="pb-3">Total Fleet Seats</th>
                  <th className="pb-3">Active Booked</th>
                  <th className="pb-3 w-48">Occupancy Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats?.topTrainsOccupancy?.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 font-bold font-mono text-slate-900">#{t.trainNumber}</td>
                    <td className="py-3.5 font-bold text-slate-800">{t.trainName}</td>
                    <td className="py-3.5 text-slate-600">{t.totalSeats} seats</td>
                    <td className="py-3.5 font-semibold text-blue-700">{t.bookedSeats} booked</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              t.occupancyPercentage >= 85
                                ? 'bg-emerald-500'
                                : t.occupancyPercentage >= 50
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, t.occupancyPercentage)}%` }}
                          ></div>
                        </div>
                        <span className="font-extrabold text-slate-900 text-xs w-10 text-right">
                          {t.occupancyPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
