import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { User, Bell, Lock, Shield, Check, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import api from '../utils/api';

export const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState('PROFILE'); // PROFILE, NOTIFICATIONS, PASSWORD
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
  });

  const [notifications, setNotifications] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Fetch profile details
    api.get('/users/profile')
      .then((res) => {
        setProfileData({
          name: res.data.name || '',
          mobile: res.data.mobile || '',
          dateOfBirth: res.data.dateOfBirth || '',
          gender: res.data.gender || 'Male',
          address: res.data.address || '',
        });
      })
      .catch((err) => console.error('Error fetching profile:', err))
      .finally(() => setLoadingProfile(false));

    // Fetch notifications
    api.get('/users/notifications')
      .then((res) => setNotifications(res.data || []))
      .catch((err) => console.error('Error fetching notifications:', err));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      const res = await api.put('/users/profile', profileData);
      setUser((prev) => ({ ...prev, name: res.data.name, mobile: res.data.mobile }));
      setSuccessMessage('Profile information successfully saved.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      await api.post('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert('Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Current password incorrect');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/users/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account & Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal credentials, contact details, and notification alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Card */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center">
              {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">{profileData.name}</h3>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              <Badge variant="info" size="sm" className="mt-1">
                {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Passenger'}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('PROFILE')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PROFILE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('NOTIFICATIONS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'NOTIFICATIONS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span>Alerts & Notifications</span>
              </div>
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PASSWORD')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PASSWORD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security & Password</span>
            </button>
          </div>
        </div>

        {/* Right Tab Content */}
        <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle">
          {activeTab === 'PROFILE' && (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">Used for auto-filling passenger ticket reservations.</p>
              </div>

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={profileData.mobile}
                    onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth || ''}
                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                <textarea
                  rows="3"
                  value={profileData.address || ''}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="Street, City, State, PIN Code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" loading={saving} variant="primary" size="md">
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'NOTIFICATIONS' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Notifications & Alerts</h3>
                <p className="text-xs text-slate-500 mt-0.5">Booking confirmation alerts and refund updates.</p>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No notifications right now.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-2xl border text-xs transition-colors flex items-start justify-between gap-4 ${
                        n.isRead ? 'bg-slate-50 border-slate-200/60' : 'bg-blue-50/50 border-blue-200'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-900">{n.title}</p>
                        <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-2 block">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n.id)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2.5 py-1 rounded-lg shrink-0"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'PASSWORD' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                <p className="text-xs text-slate-500 mt-0.5">Keep your account secure with a strong password.</p>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md">
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
