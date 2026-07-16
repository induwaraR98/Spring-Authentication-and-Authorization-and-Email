import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Ticket, Calendar, MapPin, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface EventDetail {
  id: number;
  title: string;
  ticketPrice: number;
  availableSeats: number;
  date: string;
  time: string;
  venue: string;
  status: string;
}

const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [seatCount, setSeatCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Promo Code States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const handleQuantityChange = (newCount: number) => {
    setSeatCount(newCount);
    // Reset applied promo to ensure limits and bounds are re-evaluated
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoSuccess(null);
    setPromoError(null);
    setPromoCodeInput('');
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);
    if (!promoCodeInput.trim() || !event) return;

    try {
      setValidatingPromo(true);
      const res = await api.post('/api/promos/validate', {
        code: promoCodeInput.trim().toUpperCase(),
        eventId: event.id,
        purchaseAmount: event.ticketPrice * seatCount,
      });

      if (res.data.valid) {
        setAppliedPromo(promoCodeInput.trim().toUpperCase());
        setDiscountAmount(res.data.discountAmount);
        setPromoSuccess(`Coupon applied! Saved $${res.data.discountAmount.toFixed(2)}`);
      }
    } catch (err: any) {
      setPromoError(err.response?.data?.error || 'Invalid promo code.');
      setAppliedPromo(null);
      setDiscountAmount(0);
    } finally {
      setValidatingPromo(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchEvent = async () => {
      try {
        const res = await api.get(`/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        setError('Failed to load event details for booking.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, user, navigate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (seatCount < 1) {
      setError('Please book at least 1 ticket.');
      return;
    }

    if (event && seatCount > event.availableSeats) {
      setError(`Cannot book more than available seats (${event.availableSeats}).`);
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/api/bookings', {
        eventId: Number(id),
        seatCount,
        promoCode: appliedPromo || undefined
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <p className="text-rose-400 font-bold">{error}</p>
        <Link to="/events" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
          Back to Events browse
        </Link>
      </div>
    );
  }

  const totalPrice = event ? event.ticketPrice * seatCount : 0;

  return (
    <div className="mx-auto max-w-xl px-4 py-12 space-y-8">
      <Link
        to={`/events/${id}`}
        className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to details
      </Link>

      <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Success Alert overlay */}
        {success && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-4 z-10 animate-in fade-in duration-300">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-white font-outfit">Booking Confirmed!</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Your tickets are booked. We've sent a confirmation email with your entry ticket PDF. Redirecting to your dashboard...
            </p>
          </div>
        )}

        <div className="border-b border-slate-800/80 pb-4">
          <h2 className="text-2xl font-extrabold text-white font-outfit">Book Tickets</h2>
          <p className="text-xs text-slate-400 mt-1">Review event details and select quantity</p>
        </div>

        {event && (
          <div className="space-y-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-900/60 text-xs">
            <h3 className="font-bold text-sm text-slate-200">{event.title}</h3>
            
            <div className="grid grid-cols-2 gap-4 text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {event && (
          <form onSubmit={handleBook} className="space-y-6">
            
            {/* Quantity select */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-slate-300">Ticket Quantity</label>
                <p className="text-[10px] text-slate-500">{event.availableSeats} seats left</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(Math.max(1, seatCount - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 active:scale-95 transition-all"
                >
                  -
                </button>
                <span className="text-base font-bold text-slate-100 w-6 text-center">{seatCount}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(Math.min(event.availableSeats, seatCount + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Promo Code Fields */}
            <div className="space-y-2 border-t border-slate-800/60 pt-4">
              <label className="text-xs font-bold text-slate-300 block">Promo / Discount Campaign Coupon</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SUMMER50"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  disabled={!!appliedPromo}
                  className="bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none flex-grow uppercase font-mono tracking-wider"
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null);
                      setDiscountAmount(0);
                      setPromoSuccess(null);
                      setPromoCodeInput('');
                    }}
                    className="px-3.5 bg-rose-955/20 hover:bg-rose-955/40 text-rose-400 border border-rose-900/30 font-bold text-xs rounded-xl transition-all"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={validatingPromo}
                    className="px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-all"
                  >
                    {validatingPromo ? 'Validating...' : 'Apply'}
                  </button>
                )}
              </div>

              {promoSuccess && <p className="text-[10px] font-bold text-emerald-400">{promoSuccess}</p>}
              {promoError && <p className="text-[10px] font-bold text-rose-450">{promoError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-b border-slate-800/60 py-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tickets:</span>
                <span>{seatCount} x ${event.ticketPrice.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-450 font-bold">
                  <span>Campaign Discount:</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Service Fee:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-205 pt-2 border-t border-slate-900">
                <span>Total Amount:</span>
                <span className="text-indigo-400">${(totalPrice - discountAmount).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              {bookingLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Ticket className="w-5 h-5" />
                  Confirm and Book
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};

export default Booking;
