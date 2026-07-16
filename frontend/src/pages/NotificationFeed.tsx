import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, Calendar, AlertCircle, FileText, CheckCircle, Bell, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface AnnouncementNotification {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  pinned: boolean;
  publishDate: string;
  read: boolean;
  event: any;
  attachments: { id: number; fileName: string; fileUrl: string }[];
}

const NotificationFeed: React.FC = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState<AnnouncementNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/announcements');
      setFeed(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to retrieve notification feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.post(`/api/announcements/${id}/read`);
      // Update local state instantly
      setFeed(prev =>
        prev.map(item => (item.id === id ? { ...item, read: true } : item))
      );
    } catch (err) {
      console.error('Failed to mark notice as read', err);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4 bg-slate-950">
        <Bell className="w-12 h-12 text-slate-650 mx-auto" />
        <p className="text-slate-450 font-bold">Please login to view your notifications feed.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = feed.filter(item => !item.read).length;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-400" /> Notifications Feed
          </h1>
          <p className="text-sm text-slate-400">Important safety regulations, scheduling changes, and updates tailored for you</p>
        </div>

        {unreadCount > 0 && (
          <span className="px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/25 text-rose-450 font-black text-xs rounded-2xl animate-pulse tracking-wider">
            {unreadCount} NEW UPDATE{unreadCount !== 1 && 'S'}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Feed list */}
      <div className="space-y-6">
        {feed.length === 0 ? (
          <div className="text-center py-20 text-slate-500 italic border border-dashed border-slate-850 rounded-3xl">
            You are fully up to date! No notices found.
          </div>
        ) : (
          feed.map((notice) => (
            <div
              key={notice.id}
              className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                notice.read 
                  ? 'border-slate-850/80 hover:border-slate-800' 
                  : 'border-indigo-500/30 bg-indigo-500/[0.02] shadow-lg shadow-indigo-600/[0.02]'
              }`}
            >
              <div className="space-y-3.5">
                {/* Header indicators */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {notice.pinned && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[9px] font-black rounded-lg uppercase tracking-wider">
                      <Pin className="w-3.5 h-3.5 fill-current" /> Pinned
                    </span>
                  )}
                  
                  <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider ${
                    notice.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500 border-rose-500/25 animate-pulse' :
                    notice.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/25' :
                    notice.priority === 'MEDIUM' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25' :
                    'bg-slate-550/10 text-slate-400 border-slate-550/20'
                  }`}>
                    {notice.priority} Alert
                  </span>

                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {notice.category}
                  </span>

                  {notice.event && (
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Event: {notice.event.title}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-lg font-bold text-slate-200 font-outfit leading-snug">{notice.title}</h2>
                  {!notice.read && (
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shrink-0 mt-2" title="Unread Update"></span>
                  )}
                </div>

                {notice.summary && (
                  <p className="text-xs font-semibold text-slate-300 italic leading-relaxed">{notice.summary}</p>
                )}

                <p className="text-xs text-slate-400 leading-relaxed font-light whitespace-pre-line">{notice.content}</p>

                {/* Attachments Section */}
                {notice.attachments && notice.attachments.length > 0 && (
                  <div className="bg-slate-950/65 border border-slate-900 rounded-2xl p-4 space-y-2.5 mt-2">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" /> Linked Resources & Attachments
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {notice.attachments.map((at) => (
                        <a
                          key={at.id}
                          href={at.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-xs font-bold text-indigo-400 hover:text-indigo-300 rounded-xl transition-all"
                        >
                          {at.fileName} <ArrowRight className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mark as read footer */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-850/60 text-[10px] text-slate-500 font-mono">
                <span>Published: {new Date(notice.publishDate).toLocaleString()}</span>
                {!notice.read ? (
                  <button
                    onClick={() => handleMarkAsRead(notice.id)}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark as Read
                  </button>
                ) : (
                  <span className="text-slate-650 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Read
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationFeed;
