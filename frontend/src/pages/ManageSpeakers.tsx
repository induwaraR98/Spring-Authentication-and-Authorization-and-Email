import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Search, Plus, Edit2, Trash2, Calendar, Link as LinkIcon, Mail, Phone, Clock, MapPin, Award, CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react';
import api from '../utils/api';

interface SpeakerItem {
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
  status: string;
  events: any[];
}

const ManageSpeakers: React.FC = () => {
  const [speakers, setSpeakers] = useState<SpeakerItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<SpeakerItem | null>(null);
  
  // Assign Modal
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    speakerId: number | null;
    speakerName: string;
  }>({
    isOpen: false,
    speakerId: null,
    speakerName: '',
  });

  // Form Fields
  const [formFullName, setFormFullName] = useState('');
  const [formProfilePhoto, setFormProfilePhoto] = useState('');
  const [formBiography, setFormBiography] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formOrganization, setFormOrganization] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formFacebook, setFormFacebook] = useState('');
  const [formTwitter, setFormTwitter] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formYearsExp, setFormYearsExp] = useState(0);
  const [formExpertise, setFormExpertise] = useState('');
  const [formLanguages, setFormLanguages] = useState('English');
  const [formSessionTitle, setFormSessionTitle] = useState('');
  const [formSessionDesc, setFormSessionDesc] = useState('');
  const [formSessionStart, setFormSessionStart] = useState('');
  const [formSessionEnd, setFormSessionEnd] = useState('');
  const [formSpeakingOrder, setFormSpeakingOrder] = useState(1);
  const [formSessionHall, setFormSessionHall] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [speakerRes, eventRes] = await Promise.all([
        api.get('/api/speakers'),
        api.get('/api/events?size=100'),
      ]);
      setSpeakers(speakerRes.data || []);
      setEvents(eventRes.data.content || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch speakers records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearForm = () => {
    setFormFullName('');
    setFormProfilePhoto('');
    setFormBiography('');
    setFormDesignation('');
    setFormOrganization('');
    setFormEmail('');
    setFormPhone('');
    setFormWebsite('');
    setFormLinkedin('');
    setFormFacebook('');
    setFormTwitter('');
    setFormInstagram('');
    setFormYearsExp(0);
    setFormExpertise('');
    setFormLanguages('English');
    setFormSessionTitle('');
    setFormSessionDesc('');
    setFormSessionStart('');
    setFormSessionEnd('');
    setFormSpeakingOrder(1);
    setFormSessionHall('');
    setFormStatus('ACTIVE');
    setEditingSpeaker(null);
  };

  const handleOpenCreate = () => {
    clearForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (speaker: SpeakerItem) => {
    setEditingSpeaker(speaker);
    setFormFullName(speaker.fullName);
    setFormProfilePhoto(speaker.profilePhoto || '');
    setFormBiography(speaker.biography || '');
    setFormDesignation(speaker.designation);
    setFormOrganization(speaker.organization || '');
    setFormEmail(speaker.email || '');
    setFormPhone(speaker.phone || '');
    setFormWebsite(speaker.website || '');
    setFormLinkedin(speaker.linkedin || '');
    setFormFacebook(speaker.facebook || '');
    setFormTwitter(speaker.twitter || '');
    setFormInstagram(speaker.instagram || '');
    setFormYearsExp(speaker.yearsOfExperience);
    setFormExpertise(speaker.areasOfExpertise || '');
    setFormLanguages(speaker.languages || 'English');
    setFormSessionTitle(speaker.sessionTitle || '');
    setFormSessionDesc(speaker.sessionDescription || '');
    setFormSessionStart(speaker.sessionStartTime ? speaker.sessionStartTime.substring(0, 5) : '');
    setFormSessionEnd(speaker.sessionEndTime ? speaker.sessionEndTime.substring(0, 5) : '');
    setFormSpeakingOrder(speaker.speakingOrder);
    setFormSessionHall(speaker.sessionHall || '');
    setFormStatus(speaker.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formFullName.trim() || !formDesignation.trim()) {
      setError('Full name and designation are required.');
      return;
    }

    const payload = {
      fullName: formFullName.trim(),
      profilePhoto: formProfilePhoto.trim() || null,
      biography: formBiography.trim() || null,
      designation: formDesignation.trim(),
      organization: formOrganization.trim() || null,
      email: formEmail.trim() || null,
      phone: formPhone.trim() || null,
      website: formWebsite.trim() || null,
      linkedin: formLinkedin.trim() || null,
      facebook: formFacebook.trim() || null,
      twitter: formTwitter.trim() || null,
      instagram: formInstagram.trim() || null,
      yearsOfExperience: formYearsExp,
      areasOfExpertise: formExpertise.trim() || null,
      languages: formLanguages.trim() || 'English',
      sessionTitle: formSessionTitle.trim() || null,
      sessionDescription: formSessionDesc.trim() || null,
      sessionStartTime: formSessionStart ? formSessionStart + ':00' : null,
      sessionEndTime: formSessionEnd ? formSessionEnd + ':00' : null,
      speakingOrder: formSpeakingOrder,
      sessionHall: formSessionHall.trim() || null,
      status: formStatus,
    };

    try {
      if (editingSpeaker) {
        await api.put(`/api/admin/speakers/${editingSpeaker.id}`, payload);
        setSuccess(`Speaker "${payload.fullName}" details updated successfully.`);
      } else {
        await api.post('/api/admin/speakers', payload);
        setSuccess(`Speaker "${payload.fullName}" registered successfully.`);
      }
      setIsModalOpen(false);
      clearForm();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to persist speaker record.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete speaker ${name}?`)) return;
    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/api/admin/speakers/${id}`);
      setSuccess(`Speaker "${name}" deleted successfully.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete speaker record.');
    }
  };

  const handleOpenAssign = (speaker: SpeakerItem) => {
    setAssignModal({
      isOpen: true,
      speakerId: speaker.id,
      speakerName: speaker.fullName,
    });
  };

  const handleAssignToEvent = async (eventId: number) => {
    if (assignModal.speakerId === null) return;
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/api/admin/speakers/${assignModal.speakerId}/assign/${eventId}`);
      setSuccess(`Speaker assigned to event successfully.`);
      setAssignModal({ isOpen: false, speakerId: null, speakerName: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign speaker to event.');
      setAssignModal({ isOpen: false, speakerId: null, speakerName: '' });
    }
  };

  const handleRemoveFromEvent = async (speakerId: number, eventId: number) => {
    if (!window.confirm('Remove speaker from this event assignment?')) return;
    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/api/admin/speakers/${speakerId}/remove/${eventId}`);
      setSuccess(`Speaker assignment removed.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove speaker assignment.');
    }
  };

  const filteredSpeakers = speakers.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.areasOfExpertise && s.areasOfExpertise.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Link to="/admin" className="text-xs hover:underline text-slate-400">Admin Dashboard</Link>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs font-semibold">Speakers</span>
          </div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Speaker & Performer Roster</h1>
          <p className="text-sm text-slate-400">Manage hosts, speakers, set session timelines, and assign speakers to events</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Speaker
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium rounded-2xl">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filters */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search roster by speaker name, expertises, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-300 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-2">Status:</span>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-850'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Speakers Grid */}
      {loading ? (
        <div className="flex py-20 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpeakers.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 text-slate-500 italic border border-dashed border-slate-850 rounded-3xl">
              No speakers match filters criteria.
            </div>
          ) : (
            filteredSpeakers.map((speaker) => (
              <div key={speaker.id} className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between space-y-6 hover:border-slate-700/80 transition-all">
                <div className="space-y-4">
                  {/* Photo & Identity details */}
                  <div className="flex items-center gap-4">
                    <img
                      src={speaker.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60'}
                      alt={speaker.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-800 bg-slate-900"
                    />
                    <div>
                      <h2 className="font-bold text-slate-200 font-outfit text-base">{speaker.fullName}</h2>
                      <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">{speaker.designation} at {speaker.organization || 'Freelance'}</p>
                    </div>
                  </div>

                  {/* Expertise badges */}
                  {speaker.areasOfExpertise && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {speaker.areasOfExpertise.split(',').map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded-lg text-[9px] font-bold">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Session Detail */}
                  {speaker.sessionTitle && (
                    <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" /> Session Topic
                      </div>
                      <p className="text-xs font-bold text-slate-300 font-outfit leading-snug">{speaker.sessionTitle}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-1 border-t border-slate-900/60">
                        {speaker.sessionStartTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                            {speaker.sessionStartTime.substring(0, 5)} - {speaker.sessionEndTime?.substring(0, 5)}
                          </span>
                        )}
                        {speaker.sessionHall && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                            {speaker.sessionHall}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Assigned Events Chips */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assigned Events:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {speaker.events && speaker.events.length > 0 ? (
                        speaker.events.map((e: any) => (
                          <span key={e.id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 border border-slate-850 text-[10px] text-slate-300 rounded-lg">
                            {e.title}
                            <button
                              onClick={() => handleRemoveFromEvent(speaker.id, e.id)}
                              className="text-slate-500 hover:text-rose-400 font-bold"
                              title="Unassign Event"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No assigned events.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-850/60">
                  <button
                    onClick={() => handleOpenAssign(speaker)}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Assign Event
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(speaker)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg border border-transparent hover:border-slate-700/50 transition-colors"
                      title="Edit Speaker Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(speaker.id, speaker.fullName)}
                      className="p-1.5 hover:bg-red-950/20 text-slate-400 hover:text-rose-400 rounded-lg border border-transparent hover:border-red-900/20 transition-colors"
                      title="Remove Speaker"
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

      {/* CREATE / EDIT SPEAKER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-indigo-400" /> {editingSpeaker ? 'Edit Speaker Roster Details' : 'Register New Speaker Profile'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. Dr. Jane Smith"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Profile Photo URL</label>
                  <input
                    type="text"
                    value={formProfilePhoto}
                    onChange={(e) => setFormProfilePhoto(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="Unsplash / Hosted image link"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Designation / Role Title</label>
                  <input
                    type="text"
                    required
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. Lead AI Researcher"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Organization / Company</label>
                  <input
                    type="text"
                    value={formOrganization}
                    onChange={(e) => setFormOrganization(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. Google Deepmind"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Biography</label>
                  <textarea
                    value={formBiography}
                    onChange={(e) => setFormBiography(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all h-20"
                    placeholder="Brief background summary of the speaker..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. +1234567890"
                  />
                </div>

                {/* Socials group */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={formLinkedin}
                    onChange={(e) => setFormLinkedin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Personal Website</label>
                  <input
                    type="text"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Expertise tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formExpertise}
                    onChange={(e) => setFormExpertise(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. AI, Neural Networks, Python"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Years of Experience</label>
                  <input
                    type="number"
                    value={formYearsExp}
                    onChange={(e) => setFormYearsExp(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Session Timeline Info */}
              <h3 className="text-sm font-bold font-outfit text-white border-b border-slate-800 pt-2 pb-2">Session schedule & allocation</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Session Title</label>
                  <input
                    type="text"
                    value={formSessionTitle}
                    onChange={(e) => setFormSessionTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Session Hall</label>
                  <input
                    type="text"
                    value={formSessionHall}
                    onChange={(e) => setFormSessionHall(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. Main Auditorium"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Session Description</label>
                  <textarea
                    value={formSessionDesc}
                    onChange={(e) => setFormSessionDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all h-16"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    value={formSessionStart}
                    onChange={(e) => setFormSessionStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">End Time (HH:MM)</label>
                  <input
                    type="time"
                    value={formSessionEnd}
                    onChange={(e) => setFormSessionEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Timeline Speaking Order</label>
                  <input
                    type="number"
                    value={formSpeakingOrder}
                    onChange={(e) => setFormSpeakingOrder(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Speaker Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
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
                  {editingSpeaker ? 'Save Profile Changes' : 'Register Speaker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TO EVENT MODAL */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold font-outfit text-white flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-indigo-400" /> Assign Speaker to Event
              </h2>
              <button onClick={() => setAssignModal({ isOpen: false, speakerId: null, speakerName: '' })} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select which event to assign <strong className="text-slate-200">"{assignModal.speakerName}"</strong> to. This links their session to the event's public program timeline.
            </p>

            <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-2 max-h-52 overflow-y-auto divide-y divide-slate-900">
              {events.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 text-center">No upcoming events found.</p>
              ) : (
                events.map(ev => (
                  <div key={ev.id} className="p-3 flex justify-between items-center hover:bg-slate-900/40 rounded-xl transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-300 font-outfit">{ev.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{ev.venue} on {ev.date}</p>
                    </div>
                    <button
                      onClick={() => handleAssignToEvent(ev.id)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSpeakers;
