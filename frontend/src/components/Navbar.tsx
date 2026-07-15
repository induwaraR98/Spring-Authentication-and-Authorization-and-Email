import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-panel sticky top-0 w-full z-45 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-indigo-600 rounded-xl group-hover:bg-indigo-500 transition-colors duration-200 shadow-md shadow-indigo-600/30">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent font-outfit">
                SmartEvents
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                to="/events"
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/events') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Browse Events
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Notification Dropdown */}
                <NotificationCenter />

                {/* Dashboard Shortcut */}
                {user.role === 'ADMIN' ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 p-2 rounded-xl text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all text-sm"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                    <span className="hidden sm:inline font-medium">Admin</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 p-2 rounded-xl text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all text-sm"
                    title="User Dashboard"
                  >
                    <User className="w-5 h-5 text-cyan-400" />
                    <span className="hidden sm:inline font-medium">Dashboard</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 p-2 rounded-xl text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all text-sm"
                  title="My Profile"
                >
                  <User className="w-5 h-5 text-emerald-450" />
                  <span className="hidden sm:inline font-medium">Profile</span>
                </Link>

                {/* User Info (Desktop only) */}
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">{user.username}</span>
                  <span className="text-[10px] text-slate-500 font-medium capitalize">{user.role.toLowerCase()}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:bg-red-950/20 hover:text-red-400 border border-slate-800 hover:border-red-900/50 transition-all duration-200 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
