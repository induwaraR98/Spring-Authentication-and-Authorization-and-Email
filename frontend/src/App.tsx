import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Booking from './pages/Booking';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManageEvents from './pages/ManageEvents';
import ManageCategories from './pages/ManageCategories';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import ManageUsers from './pages/ManageUsers';
import ManagePromos from './pages/ManagePromos';
import ManageSpeakers from './pages/ManageSpeakers';
import SpeakerProfile from './pages/SpeakerProfile';
import ManageStaff from './pages/ManageStaff';
import StaffConsole from './pages/StaffConsole';
import ManageAnnouncements from './pages/ManageAnnouncements';
import NotificationFeed from './pages/NotificationFeed';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin Protected Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// Staff Protected Route Component
const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user || (user.role !== 'EVENT_STAFF' && user.role !== 'ADMIN')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
          {/* Global Navigation Bar */}
          <Navbar />
          
          {/* Main content body */}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/speakers/:id" element={<SpeakerProfile />} />

              {/* User Protected Routes */}
              <Route
                path="/booking/:id"
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationFeed />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/console"
                element={
                  <StaffRoute>
                    <StaffConsole />
                  </StaffRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/events/new"
                element={
                  <AdminRoute>
                    <ManageEvents />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/events/edit/:id"
                element={
                  <AdminRoute>
                    <ManageEvents />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <AdminRoute>
                    <ManageCategories />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <AdminRoute>
                    <Reports />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <ManageUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/promos"
                element={
                  <AdminRoute>
                    <ManagePromos />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/speakers"
                element={
                  <AdminRoute>
                    <ManageSpeakers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <AdminRoute>
                    <ManageStaff />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/announcements"
                element={
                  <AdminRoute>
                    <ManageAnnouncements />
                  </AdminRoute>
                }
              />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
