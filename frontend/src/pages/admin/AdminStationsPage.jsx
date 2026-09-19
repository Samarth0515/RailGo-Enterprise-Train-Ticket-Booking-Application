import React, { useState, useEffect } from 'react';
import { trainService } from '../../services/trainService';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { MapPin, Plus, Search } from 'lucide-react';
import api from '../../utils/api';

export const AdminStationsPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newStation, setNewStation] = useState({ code: '', name: '', city: '', state: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const data = await trainService.getStations();
      setStations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/stations', newStation);
      setStations([...stations, res.data]);
      setModalOpen(false);
      setNewStation({ code: '', name: '', city: '', state: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create station');
    } finally {
      setSaving(false);
    }
  };

  const filtered = stations.filter(
    (s) =>
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Railway Stations Directory">
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <Button
            onClick={() => setModalOpen(true)}
            variant="primary"
            size="md"
            icon={Plus}
            className="rounded-xl shrink-0"
          >
            Add Station
          </Button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
              Loading stations directory...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Station Code</th>
                    <th className="p-4">Station Name</th>
                    <th className="p-4">City</th>
                    <th className="p-4">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((s) => (
                    <tr key={s.id || s.code} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-purple-700">
                        {s.code}
                      </td>
                      <td className="p-4 font-bold text-slate-900">{s.name}</td>
                      <td className="p-4 text-slate-700">{s.city}</td>
                      <td className="p-4 text-slate-500">{s.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add Railway Station"
          subtitle="Register a new station node in Indian Railways network"
        >
          <form onSubmit={handleCreateStation} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Station Code (e.g. CSMT, PUNE)</label>
              <input
                type="text"
                required
                maxLength="6"
                value={newStation.code}
                onChange={(e) => setNewStation({ ...newStation, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Station Name</label>
              <input
                type="text"
                required
                value={newStation.name}
                onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={newStation.city}
                  onChange={(e) => setNewStation({ ...newStation, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={newStation.state}
                  onChange={(e) => setNewStation({ ...newStation, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" loading={saving} variant="primary" fullWidth size="md">
                Register Station
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
};
