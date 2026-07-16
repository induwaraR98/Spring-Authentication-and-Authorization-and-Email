import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Search, Plus, Edit2, Trash2, Calendar, FileText, Mail, Info, CheckCircle, AlertCircle, Pin, Eye, Send, X } from 'lucide-react';
import api from '../utils/api';

interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  publishDate: string | null;
  expirationDate: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  author: string;
  targetAudience: 'EVERYONE' | 'ATTENDEES' | 'VIP' | 'STAFF' | 'ADMIN';
  pinned: boolean;
  sendEmail: boolean;
  createdAt: string;
  updatedAt: string;
  event: any;
  attachments: any[];
}

const ManageAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formPriority, setFormPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [formExpirationDate, setFormExpirationDate] = useState('');
  const [formTargetAudience, setFormTargetAudience] = useState<'EVERYONE' | 'ATTENDEES' | 'VIP' | 'STAFF' | 'ADMIN'>('EVERYONE');
  const [formPinned, setFormPinned] = useState(false);
  const [formSendEmail, setFormSendEmail] = useState(false);
  const [formEventId, setFormEventId] = useState<number>(0);
  const [formAttachments, setFormAttachments] = useState<{ fileName: string; fileUrl: string }[]>([]);
  
  // Attachments form inputs
  const [newAttachName, setNewAttachName] = useState('');
  const [newAttachUrl, setNewAttachUrl] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, eventRes] = await Promise.all([
        api.get('/api/announcements'), // fetches announcements feed or admin logs
        api.get('/api/events?size=100'),
      ]);
      // Note: we can fetch full list from admin announcements if we map it, let's map /api/announcements to fetch based on status
      const allAnnRes = await api.get('/api/announcements'); // fallback, lets fetch all
      setAnnouncements(allAnnRes.data || []);
      setEvents(eventRes.data.content || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch announcements logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormSummary('');
    setFormCategory('General');
    setFormPriority('MEDIUM');
    setFormExpirationDate('');
    setFormTargetAudience('EVERYONE');
    setFormPinned(false);
    setFormSendEmail(false);
    setFormEventId(0);
    setFormAttachments([]);
    setNewAttachName('');
    setNewAttachUrl('');
    setEditingAnnouncement(null);
  };

  const handleOpenCreate = () => {
    clearForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: AnnouncementItem) => {
    setEditingAnnouncement(ann);
    setFormTitle(ann.title);
    setFormContent(ann.content);
    setFormSummary(ann.summary || '');
    setFormCategory(ann.category || 'General');
    setFormPriority(ann.priority);
    setFormExpirationDate(ann.expirationDate ? ann.expirationDate.substring(0, 16) : '');
    setFormTargetAudience(ann.targetAudience);
    setFormPinned(ann.pinned);
    setFormSendEmail(ann.sendEmail);
    setFormEventId(ann.event ? ann.event.id : 0);
    setFormAttachments(ann.attachments || []);
    setIsModalOpen(true);
  };

  const handleAddAttachment = () => {
    if (!newAttachName.trim() || !newAttachUrl.trim()) return;
    setFormAttachments([...formAttachments, { fileName: newAttachName.trim(), fileUrl: newAttachUrl.trim() }]);
    setNewAttachName('');
    setNewAttachUrl('');
  };

  const handleRemoveAttachment = (idx: number) => {
    setFormAttachments(formAttachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formTitle.trim() || !formContent.trim()) {
      setError('Announcement title and content text are required.');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      content: formContent.trim(),
      summary: formSummary.trim(),
      category: formCategory,
      priority: formPriority,
      expirationDate: formExpirationDate ? formExpirationDate + ':00' : null,
      targetAudience: formTargetAudience,
      pinned: formPinned,
      sendEmail: formSendEmail,
      event: formEventId > 0 ? { id: formEventId } : null,
      attachments: formAttachments,
    };

    try {
      if (editingAnnouncement) {
        await api.put(`/api/admin/announcements/${editingAnnouncement.id}`, payload);
        setSuccess(`Announcement "${formTitle}" updated successfully.`);
      } else {
        await api.post('/api/admin/announcements', payload);
        setSuccess(`Announcement "${formTitle}" created successfully in drafts.`);
      }
      setIsModalOpen(false);
      clearForm();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save announcement.');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Permanently delete announcement "${title}"?`)) return;
    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/api/admin/announcements/${id}`);
      setSuccess(`Announcement "${title}" removed.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete announcement.');
    }
  };

  const handlePublish = async (id: number, title: string) => {
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/api/admin/announcements/${id}/publish`);
      setSuccess(`Announcement "${title}" published and broadcasted successfully.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to publish announcement.');
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Link to="/admin" className="text-xs hover:underline text-slate-400">Admin Dashboard</Link>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs font-semibold">Announcements</span>
          </div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Broadcast Announcements</h1>
          <p className="text-sm text-slate-400">Compose system alerts, schedule reminders, pin critical announcements, and dispatch email warnings</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Compose Announcement
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-450 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 rounded-2xl">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filters */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search announcement content, alerts summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-300 focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-850 rounded-xl">
            {(['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">ALL PRIORITIES</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex py-20 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-20 text-slate-500 italic border border-dashed border-slate-850 rounded-3xl">
              No matching announcements logs found.
            </div>
          ) : (
            filteredAnnouncements.map((ann) => (
              <div key={ann.id} className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row gap-6 justify-between items-start hover:border-slate-700/80 transition-all">
                <div className="space-y-3 flex-grow">
                  {/* Priority, pin indicator */}
                  <div className="flex flex-wrap items-center gap-2">
                    {ann.pinned && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black rounded-lg uppercase tracking-wider">
                        <Pin className="w-3 h-3 fill-current" /> Pinned
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider ${
                      ann.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' :
                      ann.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      ann.priority === 'MEDIUM' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-550/20'
                    }`}>
                      {ann.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Target: {ann.targetAudience}
                    </span>
                    {ann.event && (
                      <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                        Event: {ann.event.title}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-slate-200 font-outfit">{ann.title}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{ann.content}</p>

                  {/* Date details */}
                  <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 pt-2 font-mono">
                    <span>Category: {ann.category}</span>
                    <span>Created by: {ann.author}</span>
                    {ann.publishDate && <span>Published: {new Date(ann.publishDate).toLocaleString()}</span>}
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex flex-row md:flex-col justify-end items-center gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 border-slate-850 pt-4 md:pt-0">
                  {ann.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(ann.id, ann.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-colors w-full md:w-auto justify-center"
                    >
                      <Send className="w-3.5 h-3.5" /> Publish
                    </button>
                  )}
                  
                  <div className="flex items-center gap-1 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleOpenEdit(ann)}
                      className="p-2 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-xl border border-transparent hover:border-slate-700/50 transition-colors"
                      title="Edit Notice"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id, ann.title)}
                      className="p-2 hover:bg-red-950/20 text-slate-400 hover:text-rose-450 rounded-xl border border-transparent hover:border-red-900/20 transition-colors"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-400" /> {editingAnnouncement ? 'Modify Broadcast Notice' : 'Draft New Broadcast Announcement'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Notice Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. Venue Change / Event Schedule Update"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Short Summary</label>
                  <input
                    type="text"
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="Brief hook for lists"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    <option value="General">General Broadcast</option>
                    <option value="Reminder">Event Reminder</option>
                    <option value="Emergency">Emergency Alert</option>
                    <option value="Schedule Change">Schedule / Timeline Change</option>
                    <option value="Venue Update">Venue / Hall Update</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL (Emergency alert)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Target Audience</label>
                  <select
                    value={formTargetAudience}
                    onChange={(e) => setFormTargetAudience(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    <option value="EVERYONE">Everyone (All Registered Users)</option>
                    <option value="ATTENDEES">All Event Ticket Attendees</option>
                    <option value="STAFF">Roster Event Staff Only</option>
                    <option value="ADMIN">System Admins Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Related Specific Event (Optional)</label>
                  <select
                    value={formEventId}
                    onChange={(e) => setFormEventId(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    <option value={0}>-- Not specific --</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Expiration Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formExpirationDate}
                    onChange={(e) => setFormExpirationDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-4 sm:col-span-2 flex flex-wrap items-center gap-6 bg-slate-950/60 p-4 border border-slate-900 rounded-2xl">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPinned}
                      onChange={(e) => setFormPinned(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                    />
                    <span>Pin Announcement (Highlights at top)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSendEmail}
                      onChange={(e) => setFormSendEmail(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                    />
                    <span>Dispatch Email Alert Broadcast (Asynchronously)</span>
                  </label>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Notice Content Details</label>
                  <textarea
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none transition-all h-36"
                    placeholder="Enter main text of warning, guidelines, updates..."
                  />
                </div>
              </div>

              {/* Attachments Section */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Media / Document Attachments</h3>
                
                {formAttachments.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {formAttachments.map((at, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <span className="font-medium text-slate-300">{at.fileName} ({at.fileUrl})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="text-rose-400 hover:text-rose-350 font-bold"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Doc File Name (e.g. Parking Map)"
                    value={newAttachName}
                    onChange={(e) => setNewAttachName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Attachment URL Link"
                      value={newAttachUrl}
                      onChange={(e) => setNewAttachUrl(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none flex-grow"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 font-semibold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  {editingAnnouncement ? 'Save Changes' : 'Create Draft Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAnnouncements;
