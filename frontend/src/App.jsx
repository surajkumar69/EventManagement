import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import ProtectedLayout from './layouts/ProtectedLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// User Pages
import UserDashboard from './pages/UserDashboard';
import MyBookings from './pages/MyBookings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageEvents from './pages/admin/ManageEvents';
import EventForm from './pages/admin/EventForm';
import ManageBookings from './pages/admin/ManageBookings';
import ManageUsers from './pages/admin/ManageUsers';
import PaymentReports from './pages/admin/PaymentReports';
import ScanGate from './pages/admin/ScanGate';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resettoken" element={<ResetPassword />} />

              {/* User Protected Routes */}
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/bookings" element={<MyBookings />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/events" element={<ManageEvents />} />
                <Route path="/admin/events/new" element={<EventForm />} />
                <Route path="/admin/events/edit/:id" element={<EventForm />} />
                <Route path="/admin/bookings" element={<ManageBookings />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/payments" element={<PaymentReports />} />
                <Route path="/admin/check-in" element={<ScanGate />} />
              </Route>

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
