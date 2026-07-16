import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mic, Heart, Star, Calendar, Mail, Phone, Globe, Clock, MapPin, Sparkles, MessageSquare, ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Linkedin: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Instagram: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);


interface SpeakerRating {
  id: number;
  user: {
    username: string;
  };
  rating: number;
  review: string;
  createdAt: string;
}

interface SpeakerProfileDetails {
  id: number;
  fullName: string;
  profilePhoto: string;
  biography: string;
  designation: string;
  organization: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  facebook: string;
  twitter: string;
  instagram: string;
  yearsOfExperience: number;
  areasOfExpertise: string;
  languages: string;
  sessionTitle: string;
  sessionDescription: string;
  sessionStartTime: string | null;
  sessionEndTime: string | null;
  speakingOrder: number;
  sessionHall: string;
  events: any[];
}

const SpeakerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [speaker, setSpeaker] = useState<SpeakerProfileDetails | null>(null);
  const [ratings, setRatings] = useState<SpeakerRating[]>([]);
  const [avgRating, setAvgRating] = useState(0.0);
  const [isFavorite, setIsFavorite] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Submissions
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [profileRes, ratingRes] = await Promise.all([
        api.get(`/api/speakers/${id}`),
        api.get(`/api/speakers/${id}/ratings`),
      ]);
      setSpeaker(profileRes.data);
      setRatings(ratingRes.data || []);
      
      // Calculate Average Rating
      if (ratingRes.data && ratingRes.data.length > 0) {
        const sum = ratingRes.data.reduce((acc: number, r: SpeakerRating) => acc + r.rating, 0);
        setAvgRating(sum / ratingRes.data.length);
      } else {
        setAvgRating(0.0);
      }

      // Check if favorited if logged in
      if (user) {
        const favsRes = await api.get('/api/speakers/favorites');
        const favList = favsRes.data || [];
        const found = favList.some((fav: any) => fav.id === parseInt(id));
        setIsFavorite(found);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load speaker profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id, user]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please sign in to save speakers to your favorites.');
      return;
    }
    if (!speaker) return;

    try {
      if (isFavorite) {
        await api.delete(`/api/speakers/${speaker.id}/favorite`);
        setIsFavorite(false);
      } else {
        await api.post(`/api/speakers/${speaker.id}/favorite`);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    if (!user) {
      setReviewError('Please login to review sessions.');
      return;
    }

    try {
      await api.post(`/api/speakers/${id}/rate`, {
        rating: reviewRating,
        review: reviewText.trim(),
      });
      setReviewSuccess('Thank you! Your session rating has been submitted.');
      setReviewText('');
      
      // Refresh Ratings List
      const ratingRes = await api.get(`/api/speakers/${id}/ratings`);
      setRatings(ratingRes.data || []);
      if (ratingRes.data && ratingRes.data.length > 0) {
        const sum = ratingRes.data.reduce((acc: number, r: SpeakerRating) => acc + r.rating, 0);
        setAvgRating(sum / ratingRes.data.length);
      }
    } catch (err: any) {
      setReviewError(err.response?.data?.error || 'Failed to submit rating.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !speaker) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4 bg-slate-950">
        <p className="text-rose-400 font-bold">{error || 'Speaker profile not found.'}</p>
        <Link to="/events" className="text-sm font-semibold text-indigo-400">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profil Header Summary */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left z-10">
          <img
            src={speaker.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'}
            alt={speaker.fullName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border border-slate-700 bg-slate-900 shadow-xl"
          />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">{speaker.fullName}</h1>
              
              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-xl transition-all ${
                  isFavorite 
                    ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20 shadow-md shadow-rose-500/5' 
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4.5 h-4.5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            <p className="text-sm text-indigo-400 font-semibold font-outfit uppercase tracking-wide">{speaker.designation}</p>
            <p className="text-xs text-slate-400 font-medium">{speaker.organization || 'Independent'}</p>
            
            {/* Average rating star */}
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'fill-current' : 'opacity-25'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-300">{avgRating > 0 ? avgRating.toFixed(1) : 'No Ratings'}</span>
              <span className="text-[10px] text-slate-500">({ratings.length} review{ratings.length !== 1 && 's'})</span>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-900 p-3.5 rounded-2xl md:w-auto w-full justify-center">
          {speaker.linkedin && (
            <a href={speaker.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-850 rounded-xl transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {speaker.twitter && (
            <a href={speaker.twitter} target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-400 border border-slate-850 rounded-xl transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {speaker.instagram && (
            <a href={speaker.instagram} target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-pink-400 border border-slate-850 rounded-xl transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {speaker.website && (
            <a href={speaker.website} target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-850 rounded-xl transition-colors">
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Bio & Core details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Biography */}
          <section className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-lg font-bold font-outfit text-white">Biography</h2>
            <p className="text-sm text-slate-400 leading-relaxed white-space-pre-line">{speaker.biography || 'Biography details are not specified for this speaker.'}</p>
          </section>

          {/* Session Program */}
          {speaker.sessionTitle && (
            <section className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" /> Presentation / Session Topic
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  Lecture
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-200 font-outfit leading-snug">{speaker.sessionTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{speaker.sessionDescription}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-900">
                  {speaker.sessionStartTime && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-4.5 h-4.5 text-indigo-400" />
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Time Slot</p>
                        <p className="font-semibold">{speaker.sessionStartTime.substring(0, 5)} - {speaker.sessionEndTime?.substring(0, 5)}</p>
                      </div>
                    </div>
                  )}
                  {speaker.sessionHall && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-4.5 h-4.5 text-indigo-400" />
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Session Hall</p>
                        <p className="font-semibold">{speaker.sessionHall}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-black">Timeline Order</p>
                      <p className="font-semibold">Speaker #{speaker.speakingOrder}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* User Reviews list */}
          <section className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-6">
            <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" /> Attendees Feedback ({ratings.length})
            </h2>

            <div className="space-y-4">
              {ratings.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No session ratings submitted yet.</p>
              ) : (
                ratings.map((rate) => (
                  <div key={rate.id} className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-200">{rate.user.username}</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rate.rating ? 'fill-current' : 'opacity-25'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {rate.review && <p className="text-xs text-slate-400 leading-relaxed font-light">{rate.review}</p>}
                    <span className="text-[9px] text-slate-600 block pt-1">
                      Reviewed on {new Date(rate.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Speaker Credentials & Rate Form */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Attributes Cards */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
            <h2 className="text-md font-bold font-outfit text-slate-200 border-b border-slate-900 pb-3">Speaker Credentials</h2>
            
            <div className="space-y-4">
              {speaker.areasOfExpertise && (
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Expertise</p>
                  <p className="text-xs text-slate-300 font-medium">{speaker.areasOfExpertise}</p>
                </div>
              )}
              {speaker.yearsOfExperience > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Experience</p>
                  <p className="text-xs text-slate-300 font-medium">{speaker.yearsOfExperience} Years</p>
                </div>
              )}
              {speaker.languages && (
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Languages</p>
                  <p className="text-xs text-slate-300 font-medium">{speaker.languages}</p>
                </div>
              )}
              {speaker.email && (
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Address</p>
                  <p className="text-xs text-slate-400 font-mono truncate">{speaker.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Rate Session Form */}
          {user && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <h2 className="text-md font-bold font-outfit text-slate-200 border-b border-slate-900 pb-3">Rate this Session</h2>
              
              {reviewError && (
                <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-450 rounded-xl">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {reviewSuccess && (
                <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 rounded-xl">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRatingSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Rating Score</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-amber-400 focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-current' : 'opacity-25'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Review Content</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-300 focus:outline-none transition-all h-24"
                    placeholder="Describe your session experience or feedback..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
                >
                  Submit Rating
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default SpeakerProfile;
