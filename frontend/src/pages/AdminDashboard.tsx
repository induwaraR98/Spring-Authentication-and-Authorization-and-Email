import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Ticket, DollarSign, Plus, Settings, BarChart2, Download, Trash2, Edit2, AlertCircle, CheckCircle, XCircle, Tag, Mic, Megaphone, Shield } from 'lucide-react';
import api from '../utils/api';

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  upcomingEvents: any[];
  recentBookings: any[];
  categoryDistribution: Record<string, number>;
  monthlyBookings: Record<string, number>;
  monthlyRevenue: Record<string, number>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const fetchDashboardStats = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/events?size=100') // Fetch events list for grid
      ]);
      setStats(statsRes.data);
      setEvents(eventsRes.data.content || []);
    } catch (err) {
      setError('Failed to load admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleDeleteEvent = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? This will erase all bookings and tickets associated.',
      onConfirm: async () => {
        try {
          await api.delete(`/api/events/${id}`);
          setAlertModal({
            isOpen: true,
            type: 'success',
            title: 'Deleted',
            message: 'Event deleted successfully.'
          });
          fetchDashboardStats(); // Refresh
        } catch (err: any) {
          setAlertModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: err.response?.data?.error || 'Failed to delete event.'
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <p className="text-rose-400 font-bold">{error || 'Unable to access dashboard.'}</p>
        <button onClick={fetchDashboardStats} className="text-sm font-semibold text-indigo-400">
          Try Again
        </button>
      </div>
    );
  }

  // Calculate highest value for category chart normalization
  const maxCategoryCount = Math.max(...Object.values(stats.categoryDistribution), 1);
  const maxMonthlyRevenue = Math.max(...Object.values(stats.monthlyRevenue), 1);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-905 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Admin Console</h1>
          <p className="text-sm text-slate-400">Overview of users, registrations, events, bookings, and revenue</p>
        </div>
      </div>

      {/* Admin Control Center Section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold font-outfit text-white">Management Console</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {/* Create Event Card */}
          <Link
            to="/admin/events/new"
            className="glass-panel p-5 rounded-2xl border border-slate-850 bg-slate-900/20 hover:border-indigo-500/50 hover:bg-indigo-950/5 flex flex-col justify-between h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-600/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 group-hover:text-indigo-300 rounded-xl border border-indigo-500/20 w-fit transition-all duration-200">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-outfit text-slate-200 group-hover:text-white transition-colors">Create Event</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Generate and configure new event bookings</p>
            </div>
          </Link>

          {/* Categories Card */}
          <Link
            to="/admin/categories"
            className="glass-panel p-5 rounded-2xl border border-slate-850 bg-slate-900/20 hover:border-purple-500/50 hover:bg-purple-950/5 flex flex-col justify-between h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/5 group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
            <div className="p-3 bg-purple-500/10 text-purple-400 group-hover:text-purple-300 rounded-xl border border-purple-500/20 w-fit transition-all duration-200">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-outfit text-slate-200 group-hover:text-white transition-colors">Categories</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Organize dynamic event taxonomies</p>
            </div>
          </Link>

          {/* Reports Card */}
          <Link
            to="/admin/reports"
            className="glass-panel p-5 rounded-2xl border border-slate-850 bg-slate-900/20 hover:border-cyan-500/50 hover:bg-cyan-950/5 flex flex-col justify-between h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 group-hover:text-cyan-300 rounded-xl border border-cyan-500/20 w-fit transition-all duration-200">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-outfit text-slate-200 group-hover:text-white transition-colors">System Reports</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Export database tables and csv statistics</p>
            </div>
          </Link>

          {/* Users Card */}
          <Link
            to="/admin/users"
            className="glass-panel p-5 rounded-2xl border border-slate-850 bg-slate-900/20 hover:border-emerald-500/50 hover:bg-emerald-950/5 flex flex-col justify-between h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 group-hover:text-emerald-300 rounded-xl border border-emerald-500/20 w-fit transition-all duration-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-outfit text-slate-200 group-hover:text-white transition-colors">Users Directory</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Manage registered accounts and roles</p>
            </div>
          </Link>

          {/* Promos Card */}
          <Link
            to="/admin/promos"
            className="glass-panel p-5 rounded-2xl border border-slate-850 bg-slate-900/20 hover:border-amber-500/50 hover:bg-amber-950/5 flex flex-col justify-between h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
            <div className="p-3 bg-amber-500/10 text-amber-400 group-hover:text-amber-300 rounded-xl border border-amber-500/20 w-fit transition-all duration-200">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-outfit text-slate-200 group-hover:text-white transition-colors">Promo Campaigns</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Create and monitor discount coupon codes</p>
            </div>
          </Link>

          {/* Speakers Card */}
          <Link
            to="/admin/speakers"
            className="glass-panel p-5 rounded-2xl border border-slate-850 bg-slate-900/20 hover:border-fuchsia-500/50 hover:bg-fuchsia-950/5 flex flex-col justify-between h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-500/5 group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-fuchsia-500/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
            <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 group-hover:text-fuchsia-300 rounded-xl border border-fuchsia-500/20 w-fit transition-all duration-200">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-outfit text-slate-200 group-hover:text-white transition-colors">Speaker Roster</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Onboard presenters, hosts and bios</p>
            </div>
          </Link>

          {/* Staff Card */}
          <Link
            to="/admin/staff"
            className="glass-panel p-5 rounded-2xl border border-slate-850 bg-slate-900/20 hover:border-rose-500/50 hover:bg-rose-950/5 flex flex-col justify-between h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/5 group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-rose-500/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
            <div className="p-3 bg-rose-500/10 text-rose-450 group-hover:text-rose-350 rounded-xl border border-rose-500/20 w-fit transition-all duration-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-outfit text-slate-200 group-hover:text-white transition-colors">Staff Directory</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Manage crew shift duty allocations</p>
            </div>
          </Link>

          {/* Announcements Card */}
          <Link
            to="/admin/announcements"
            className="glass-panel p-5 rounded-2xl border border-slate-850 bg-slate-900/20 hover:border-lime-500/50 hover:bg-lime-950/5 flex flex-col justify-between h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-500/5 group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-lime-500/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
            <div className="p-3 bg-lime-500/10 text-lime-400 group-hover:text-lime-300 rounded-xl border border-lime-500/20 w-fit transition-all duration-200">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-outfit text-slate-200 group-hover:text-white transition-colors">Broadcasts</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Send emails and push alerts to users</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/users"
          className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/10 flex items-center gap-4 transition-all"
        >
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Users</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.totalUsers}</p>
          </div>
        </Link>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl border border-cyan-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Events</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.totalEvents}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Bookings</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.totalBookings}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Revenue</p>
            <p className="text-2xl font-bold text-white mt-0.5">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Popularity Bar Graph */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-6">
          <h2 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            Events Category Distribution
          </h2>
          <div className="space-y-4">
            {Object.keys(stats.categoryDistribution).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 italic">No category distribution data.</p>
            ) : (
              Object.entries(stats.categoryDistribution).map(([category, count]) => {
                const percentage = (count / maxCategoryCount) * 100;
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{category}</span>
                      <span>{count} event{count !== 1 && 's'}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Monthly Revenue Graph */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-6">
          <h2 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            Monthly Revenue Trends
          </h2>
          <div className="space-y-4">
            {Object.keys(stats.monthlyRevenue).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 italic">No revenue transaction history yet.</p>
            ) : (
              Object.entries(stats.monthlyRevenue).map(([month, rev]) => {
                const percentage = (rev / maxMonthlyRevenue) * 100;
                return (
                  <div key={month} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{month}</span>
                      <span className="text-cyan-400">${rev.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Events Management Panel */}
      <section className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="font-bold text-lg text-white font-outfit">Manage Created Events</h2>
          <span className="text-xs text-slate-500">Total: {events.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800/80">
                <th className="py-3 font-semibold">Title</th>
                <th className="py-3 font-semibold">Category</th>
                <th className="py-3 font-semibold">Date / Time</th>
                <th className="py-3 font-semibold">Price</th>
                <th className="py-3 font-semibold">Seats</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">No events generated yet.</td>
                </tr>
              ) : (
                events.map(e => (
                  <tr key={e.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3.5 font-bold text-slate-200">{e.title}</td>
                    <td className="py-3.5">{e.category ? e.category.name : 'N/A'}</td>
                    <td className="py-3.5">{e.date} at {e.time}</td>
                    <td className="py-3.5">${e.ticketPrice.toFixed(2)}</td>
                    <td className="py-3.5">{e.availableSeats} / {e.totalSeats}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${
                        e.status === 'UPCOMING' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        e.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/events/edit/${e.id}`}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-all"
                        title="Edit Event"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(e.id)}
                        className="p-1.5 hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-base font-extrabold text-white font-outfit">{confirmModal.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1">{confirmModal.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs font-bold text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  confirmModal.onConfirm();
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/15 active:scale-95 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-lg ${
              alertModal.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-emerald-500/5'
                : alertModal.type === 'error'
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-rose-500/5'
                : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-indigo-500/5'
            }`}>
              {alertModal.type === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : alertModal.type === 'error' ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-base font-extrabold text-white font-outfit">{alertModal.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1">{alertModal.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
