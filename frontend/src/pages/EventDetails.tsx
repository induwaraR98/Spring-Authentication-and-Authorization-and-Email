import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User, Ticket, Star, Heart, ArrowLeft, Send, Mic, Clock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getCleanImageUrl } from '../utils/image';

interface Review {
  id: number;
  user: { username: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface EventDetail {
  id: number;
  title: string;
  description: string;
  category: { id: number; name: string } | null;
  venue: string;
  address: string;
  date: string;
  time: string;
  organizer: string;
  ticketPrice: number;
  totalSeats: number;
  availableSeats: number;
  eventImage: string;
  status: string;
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Check attendance for review eligibility
  const [canReview, setCanReview] = useState(false);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const [eventRes, reviewsRes, scheduleRes] = await Promise.all([
        api.get(`/api/events/${id}`),
        api.get(`/api/reviews/event/${id}`),
        api.get(`/api/events/${id}/schedule`)
      ]);
      setEvent(eventRes.data);
      setReviews(reviewsRes.data);
      setSpeakers(scheduleRes.data || []);

      if (user) {
        // Check favorite status
        const favCheck = await api.get(`/api/favourites/${id}/check`);
        setIsFavorited(favCheck.data.favorited);

        // Check if event is past and user booked it to allow review
        const eventDate = new Date(eventRes.data.date);
        const isPast = eventDate <= new Date();
        if (isPast) {
          const bookingsRes = await api.get('/api/bookings/history');
          const hasBooked = bookingsRes.data.some(
            (b: any) => b.event.id === eventRes.data.id && b.status === 'BOOKED'
          );
          setCanReview(hasBooked);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, user]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isFavorited) {
        await api.delete(`/api/favourites/${id}`);
        setIsFavorited(false);
      } else {
        await api.post(`/api/favourites/${id}`);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(false);

    if (!comment.trim()) {
      setReviewError('Please write a comment.');
      return;
    }

    try {
      await api.post('/api/reviews', {
        eventId: event?.id,
        rating,
        comment
      });
      setReviewSuccess(true);
      setComment('');
      // Reload reviews
      const reviewsRes = await api.get(`/api/reviews/event/${id}`);
      setReviews(reviewsRes.data);
    } catch (err: any) {
      setReviewError(err.response?.data?.error || 'Failed to submit review.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <p className="text-rose-400 font-bold text-lg">{error || 'Event not found.'}</p>
        <Link to="/events" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
          Back to Events List
        </Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 'No ratings';

  const defaultBanner = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&auto=format&fit=crop&q=80';

  return (
    <div className="pb-16 space-y-10">
      {/* Hero Banner Section */}
      <section className="relative h-[40vh] md:h-[50vh] bg-slate-900 overflow-hidden border-b border-slate-900">
        <img
          src={getCleanImageUrl(event.eventImage) || defaultBanner}
          alt={event.title}
          className="w-full h-full object-cover opacity-40 blur-sm absolute top-0 left-0 scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultBanner;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 inset-x-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-3">
            <Link
              to="/events"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to browse
            </Link>
            <span className="text-xs font-bold tracking-wider px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 uppercase">
              {event.category ? event.category.name : 'General'}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-outfit">{event.title}</h1>
          </div>
          
          {/* Favorite action */}
          <button
            onClick={handleFavoriteToggle}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm font-semibold active:scale-95 ${
              isFavorited
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-400' : ''}`} />
            {isFavorited ? 'Favorited' : 'Add to Favorites'}
          </button>
        </div>
      </section>

      {/* Details Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Info & Description */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="font-bold text-xl text-white font-outfit">Event Details</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Event Schedule & Speakers Program */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="font-bold text-xl text-white font-outfit flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-400" /> Event Schedule & Guest Speakers
            </h2>
            
            {speakers.length === 0 ? (
              <p className="text-slate-500 text-xs italic py-2">No guest speakers scheduled for this session yet.</p>
            ) : (
              <div className="space-y-4">
                {speakers
                  .sort((a, b) => a.speakingOrder - b.speakingOrder)
                  .map((sp) => (
                    <div key={sp.id} className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <img
                          src={sp.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'}
                          alt={sp.fullName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                        />
                        <div>
                          <Link to={`/speakers/${sp.id}`} className="font-bold text-sm text-slate-200 hover:text-indigo-400 transition-colors">
                            {sp.fullName}
                          </Link>
                          <p className="text-[10px] text-slate-500 capitalize">{sp.designation} at {sp.organization || 'Freelance'}</p>
                          {sp.sessionTitle && (
                            <p className="text-xs text-slate-300 font-medium font-outfit mt-1 italic">"{sp.sessionTitle}"</p>
                          )}
                        </div>
                      </div>

                      {sp.sessionStartTime && (
                        <div className="flex sm:flex-col items-center sm:items-end gap-1.5 sm:gap-0.5 text-[10px] text-slate-500 font-mono self-stretch sm:self-auto justify-between border-t sm:border-t-0 border-slate-900/60 pt-2 sm:pt-0 shrink-0">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            {sp.sessionStartTime.substring(0, 5)} - {sp.sessionEndTime?.substring(0, 5)}
                          </span>
                          {sp.sessionHall && (
                            <span className="text-[9px] font-bold text-slate-650 block uppercase">Hall: {sp.sessionHall}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="space-y-6">
            <h2 className="font-bold text-xl text-white font-outfit flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              Attendees Reviews ({reviews.length})
            </h2>

            {/* Write Review Form */}
            {canReview && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
                <h3 className="font-bold text-sm text-slate-200">Submit a Review</h3>
                {reviewSuccess && (
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl">
                    Review submitted successfully!
                  </div>
                )}
                {reviewError && (
                  <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-xl">
                    {reviewError}
                  </div>
                )}
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-5 h-5 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Share your experience at this event..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 outline-none rounded-xl text-xs text-slate-200 px-4 py-2.5"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-xl transition-all shadow-md shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-slate-500 text-xs py-4">No reviews yet. Be the first to leave one after attending!</p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="p-5 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-300">{r.user.username}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-800'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{r.comment}</p>
                    <span className="text-[10px] text-slate-600 block">
                      Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Event Cover Image */}
          <div className="glass-panel overflow-hidden rounded-3xl border border-slate-800 shadow-xl">
            <img
              src={getCleanImageUrl(event.eventImage) || defaultBanner}
              alt={event.title}
              className="w-full aspect-video md:aspect-[4/3] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultBanner;
              }}
            />
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-6">
            <h3 className="font-bold text-lg text-white font-outfit">Event Logistics</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-300">Date & Time</p>
                  <p className="text-slate-400">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-300">Venue</p>
                  <p className="text-slate-400">{event.venue}</p>
                  <p className="text-[10px] text-slate-500">{event.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-300">Organizer</p>
                  <p className="text-slate-400">{event.organizer}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-300">Rating Summary</p>
                  <p className="text-slate-400">{averageRating}</p>
                </div>
              </div>
            </div>

            {/* Booking action section */}
            <div className="border-t border-slate-800/60 pt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Price per ticket:</span>
                <span className="font-extrabold text-indigo-400 text-lg">
                  {event.ticketPrice === 0 ? 'Free' : `$${event.ticketPrice.toFixed(2)}`}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Available seats:</span>
                <span className="font-semibold text-slate-300">
                  {event.availableSeats <= 0 ? 'Sold Out' : `${event.availableSeats} / ${event.totalSeats}`}
                </span>
              </div>

              {event.status.toUpperCase() === 'UPCOMING' && event.availableSeats > 0 ? (
                <Link
                  to={`/booking/${event.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                >
                  <Ticket className="w-5 h-5" />
                  Book Tickets Now
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-slate-900 text-slate-500 border border-slate-800/40 font-bold text-sm py-3.5 rounded-2xl cursor-not-allowed text-center"
                >
                  {event.status.toUpperCase() !== 'UPCOMING'
                    ? `Booking Closed (Status: ${event.status})`
                    : 'Sold Out'}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetails;
