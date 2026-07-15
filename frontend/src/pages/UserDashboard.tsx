import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Download, XCircle, Heart, User, Sparkles, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import type { EventItem } from '../components/EventCard';
import { getCleanImageUrl } from '../utils/image';

interface BookingItem {
  id: number;
  seatCount: number;
  totalPrice: number;
  status: string;
  bookingDate: string;
  event: EventItem;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<BookingItem[]>([]);
  const [previousBookings, setPreviousBookings] = useState<BookingItem[]>([]);
  const [favourites, setFavourites] = useState<EventItem[]>([]);
  const [recommended, setRecommended] = useState<EventItem[]>([]);
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

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/dashboard');
      setUpcomingBookings(res.data.upcomingBookings || []);
      setPreviousBookings(res.data.previousBookings || []);
      setFavourites(res.data.favourites || []);
      setRecommended(res.data.recommended || []);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelBooking = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This will restore seats and notify the organizer.',
      onConfirm: async () => {
        try {
          await api.post(`/api/bookings/${id}/cancel`);
          setAlertModal({
            isOpen: true,
            type: 'success',
            title: 'Cancelled',
            message: 'Booking cancelled successfully.'
          });
          fetchDashboardData();
        } catch (err: any) {
          setAlertModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: err.response?.data?.error || 'Failed to cancel booking.'
          });
        }
      }
    });
  };

  const handleDownloadTicket = async (bookingId: number, eventTitle: string) => {
    try {
      const res = await api.get(`/api/bookings/${bookingId}/ticket/pdf`, {
        responseType: 'blob'
      });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Ticket-${eventTitle.replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download ticket PDF.'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[65vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-outfit text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">Manage your ticket bookings, favorites, and recommendations</p>
        </div>

        <Link
          to="/profile"
          className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-905 border border-slate-900 hover:border-indigo-500/50 text-xs transition-all duration-150"
          title="Edit Profile Settings"
        >
          <User className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <p className="font-bold text-slate-300 flex items-center gap-1">
              {user?.username} <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            </p>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-2xl">
          {error}
        </div>
      )}

      {/* Main Grid: Bookings list on left, sidebar on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Bookings History */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Upcoming Bookings */}
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-outfit">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Upcoming Event Bookings ({upcomingBookings.length})
            </h2>

            {upcomingBookings.length === 0 ? (
              <div className="glass-panel p-10 rounded-3xl border border-slate-900 text-center space-y-3">
                <p className="text-slate-500 text-xs">No upcoming event bookings.</p>
                <Link to="/events" className="inline-block text-xs font-bold text-indigo-400 hover:text-indigo-300">
                  Browse Events & Book Tickets
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map(b => (
                  <div key={b.id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-700 transition-all duration-200">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 uppercase">
                        {b.event.category ? b.event.category.name : 'Event'}
                      </span>
                      <h3 className="font-bold text-sm text-slate-100">{b.event.title}</h3>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(b.event.date).toLocaleDateString()} at {b.event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {b.event.venue}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-500">
                        Booked {b.seatCount} seats for <span className="font-semibold text-slate-300">${b.totalPrice.toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 justify-end">
                      <button
                        onClick={() => handleDownloadTicket(b.id, b.event.title)}
                        className="flex items-center gap-1 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                        title="Download PDF Entry Ticket"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Ticket
                      </button>
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="flex items-center gap-1 px-3 py-2 border border-slate-800 hover:border-red-900/50 hover:bg-red-950/20 text-slate-400 hover:text-red-400 font-bold text-xs rounded-xl transition-all"
                        title="Cancel Bookings"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Previous Bookings */}
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-outfit">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Previous Attendances ({previousBookings.length})
            </h2>

            {previousBookings.length === 0 ? (
              <p className="text-slate-600 text-xs italic">No history of past event attendances.</p>
            ) : (
              <div className="space-y-3 opacity-70">
                {previousBookings.map(b => (
                  <div key={b.id} className="glass-card p-4 rounded-xl border border-slate-900/80 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-xs text-slate-300">{b.event.title}</h3>
                      <p className="text-[10px] text-slate-500">
                        Attended on {new Date(b.event.date).toLocaleDateString()} &middot; {b.seatCount} ticket{b.seatCount > 1 && 's'}
                      </p>
                    </div>
                    <Link
                      to={`/events/${b.event.id}`}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-500/10 hover:border-indigo-500/30 px-3 py-1.5 rounded-lg bg-indigo-500/5 transition-all"
                    >
                      Leave Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Side: Favorites Bookmarks & Recommended */}
        <div className="space-y-10 lg:col-span-1">
          
          {/* Favorites List */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-outfit">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              My Favorites ({favourites.length})
            </h2>

            {favourites.length === 0 ? (
              <div className="glass-panel p-6 rounded-2xl border border-slate-900 text-center text-slate-500 text-xs">
                No favorited events bookmarks.
              </div>
            ) : (
              <div className="space-y-3">
                {favourites.map(fav => (
                  <div key={fav.id} className="glass-card p-3.5 rounded-xl border border-slate-900 flex justify-between items-center gap-3">
                    <div className="overflow-hidden">
                      <Link to={`/events/${fav.id}`} className="font-bold text-xs text-slate-300 hover:text-indigo-400 line-clamp-1 block transition-colors">
                        {fav.title}
                      </Link>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(fav.date).toLocaleDateString()} &middot; {fav.venue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recommendations List */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-outfit">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Recommended for You
            </h2>

            {recommended.length === 0 ? (
              <p className="text-slate-600 text-xs italic">No recommendations available.</p>
            ) : (
              <div className="space-y-3">
                {recommended.map(rec => (
                  <Link
                    key={rec.id}
                    to={`/events/${rec.id}`}
                    className="glass-panel p-4 rounded-2xl border border-slate-900/80 hover:border-slate-800 hover:bg-slate-900/30 flex gap-3 group transition-all duration-200"
                  >
                    <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-950">
                      <img
                        src={getCleanImageUrl(rec.eventImage) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=100'}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=100';
                        }}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-xs text-slate-200 group-hover:text-indigo-400 line-clamp-1 block transition-colors">
                        {rec.title}
                      </h4>
                      <p className="text-[9px] text-slate-500 truncate mt-0.5">
                        {new Date(rec.date).toLocaleDateString()} &middot; {rec.venue}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
    </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-left text-center">
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

export default UserDashboard;
