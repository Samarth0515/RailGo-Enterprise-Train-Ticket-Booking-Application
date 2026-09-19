import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { PassengerDetailsPage } from './pages/PassengerDetailsPage';
import { BookingReviewPage } from './pages/BookingReviewPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminTrainsPage } from './pages/admin/AdminTrainsPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminStationsPage } from './pages/admin/AdminStationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { useAuth } from './context/AuthContext';

// Protected route wrapper for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin route wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Customer / Public Routes wrapped with MainLayout */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/search"
        element={
          <MainLayout>
            <SearchResultsPage />
          </MainLayout>
        }
      />
      <Route
        path="/booking/seats"
        element={
          <MainLayout>
            <SeatSelectionPage />
          </MainLayout>
        }
      />
      <Route
        path="/booking/passengers"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PassengerDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/review"
        element={
          <ProtectedRoute>
            <MainLayout>
              <BookingReviewPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/confirmation/:pnr"
        element={
          <MainLayout>
            <BookingConfirmationPage />
          </MainLayout>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <MainLayout>
            <MyBookingsPage />
          </MainLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        }
      />
      <Route
        path="/register"
        element={
          <MainLayout>
            <RegisterPage />
          </MainLayout>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/trains"
        element={
          <AdminRoute>
            <AdminTrainsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <AdminRoute>
            <AdminBookingsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/stations"
        element={
          <AdminRoute>
            <AdminStationsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
