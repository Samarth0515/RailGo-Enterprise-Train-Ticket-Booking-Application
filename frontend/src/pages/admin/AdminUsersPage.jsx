import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge } from '../../components/common/Badge';
import { Users, Search, Mail, Phone } from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getAllUsers()
      .then((data) => setUsers(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.includes(search)
  );

  return (
    <AdminLayout title="Passenger Directory & RBAC Audit">
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Registered: <strong className="text-slate-900">{filtered.length}</strong> passengers
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
              Loading user roster...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Role / RBAC</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[11px] text-slate-400">ID #{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-900 font-medium block">{u.email}</span>
                        <span className="text-slate-400 text-[11px]">{u.mobile}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={u.role === 'ROLE_ADMIN' ? 'purple' : 'info'} size="sm">
                          {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Passenger'}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-700">{u.gender || 'Not specified'}</td>
                      <td className="p-4 text-slate-500 max-w-[200px] truncate">{u.address || '—'}</td>
                      <td className="p-4 text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
