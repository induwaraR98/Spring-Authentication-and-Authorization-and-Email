import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Plus, Edit2, Trash2, Shield, Calendar, Mail, Phone, Clock, UserCheck, AlertCircle, CheckCircle, X } from 'lucide-react';
import api from '../utils/api';

interface StaffItem {
  id: number;
  employeeNumber: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  availability: boolean;
  emergencyContact: string;
  notes: string;
  status: string;
  assignedEvents: any[];
}

const ManageStaff: React.FC = () => {
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'ALL' | 'REGISTRATION' | 'SECURITY' | 'TECHNICAL' | 'PHOTOGRAPHY' | 'STAGE'>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);

  // Form Fields (Onboarding / Onboarding Login Details)
  const [formEmployeeNumber, setFormEmployeeNumber] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('REGISTRATION');
  const [formPosition, setFormPosition] = useState('');
  const [formShiftStart, setFormShiftStart] = useState('09:00');
  const [formShiftEnd, setFormShiftEnd] = useState('17:00');
  const [formProfilePhoto, setFormProfilePhoto] = useState('');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  
  // Login Details (Only when creating a new Staff member)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Assignment Modal
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    staffId: number | null;
    staffName: string;
    selectedEventId: number;
    area: string;
    responsibility: string;
  }>({
    isOpen: false,
    staffId: null,
    staffName: '',
    selectedEventId: 0,
    area: 'Registration Desk',
    responsibility: 'Verifying tickets and guest check-ins.',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, eventRes] = await Promise.all([
        api.get('/api/admin/staff'),
        api.get('/api/events?size=100'),
      ]);
      setStaff(staffRes.data || []);
      setEvents(eventRes.data.content || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch staff roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearForm = () => {
    setFormEmployeeNumber('');
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormDepartment('REGISTRATION');
    setFormPosition('');
    setFormShiftStart('09:00');
    setFormShiftEnd('17:00');
    setFormProfilePhoto('');
    setFormEmergencyContact('');
    setFormNotes('');
    setFormStatus('ACTIVE');
    setLoginUsername('');
    setLoginPassword('');
    setEditingStaff(null);
  };

  const handleOpenCreate = () => {
    clearForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: StaffItem) => {
    setEditingStaff(member);
    setFormEmployeeNumber(member.employeeNumber);
    setFormFullName(member.fullName);
    setFormEmail(member.email);
    setFormPhone(member.phone || '');
    setFormDepartment(member.department || 'REGISTRATION');
    setFormPosition(member.position || '');
    setFormShiftStart(member.shiftStart ? member.shiftStart.substring(0, 5) : '09:00');
    setFormShiftEnd(member.shiftEnd ? member.shiftEnd.substring(0, 5) : '17:00');
    setFormProfilePhoto(member.profilePhoto || '');
    setFormEmergencyContact(member.emergencyContact || '');
    setFormNotes(member.notes || '');
    setFormStatus(member.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formFullName.trim() || !formEmployeeNumber.trim() || !formEmail.trim()) {
      setError('Full name, email, and employee number are required.');
      return;
    }

    if (!editingStaff && (!loginUsername.trim() || !loginPassword.trim())) {
      setError('Staff login credentials (username & password) are required for new accounts.');
      return;
    }

    const staffPayload = {
      employeeNumber: formEmployeeNumber.trim(),
      fullName: formFullName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      department: formDepartment,
      position: formPosition.trim(),
      shiftStart: formShiftStart ? formShiftStart + ':00' : null,
      shiftEnd: formShiftEnd ? formShiftEnd + ':00' : null,
      profilePhoto: formProfilePhoto.trim() || null,
      emergencyContact: formEmergencyContact.trim(),
      notes: formNotes.trim(),
      status: formStatus,
    };

    try {
      if (editingStaff) {
        await api.put(`/api/admin/staff/${editingStaff.id}`, staffPayload);
        setSuccess(`Staff details for "${formFullName}" updated successfully.`);
      } else {
        const fullPayload = {
          username: loginUsername.trim(),
          password: loginPassword,
          staff: staffPayload,
        };
        await api.post('/api/admin/staff', fullPayload);
        setSuccess(`Onboarded new staff member "${formFullName}" successfully.`);
      }
      setIsModalOpen(false);
      clearForm();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save staff member.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Suspend & remove staff member ${name}? This deletes their linked login details too.`)) return;
    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/api/admin/staff/${id}`);
      setSuccess(`Staff member "${name}" account removed.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove staff member.');
    }
  };

  const handleOpenAssign = (member: StaffItem) => {
    setAssignModal({
      isOpen: true,
      staffId: member.id,
      staffName: member.fullName,
      selectedEventId: events.length > 0 ? events[0].id : 0,
      area: 'Registration Desk',
      responsibility: 'Verifying tickets and guest check-ins.',
    });
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignModal.staffId === null || assignModal.selectedEventId === 0) return;
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/api/admin/staff/${assignModal.staffId}/assign/${assignModal.selectedEventId}`, {
        area: assignModal.area,
        responsibility: assignModal.responsibility,
      });
      setSuccess(`Staff member assigned to event area successfully.`);
      setAssignModal({ ...assignModal, isOpen: false, staffId: null, staffName: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign staff.');
      setAssignModal({ ...assignModal, isOpen: false, staffId: null, staffName: '' });
    }
  };

  const handleRemoveAssignment = async (staffId: number, eventId: number) => {
    if (!window.confirm('Remove staff from this event assignment?')) return;
    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/api/admin/staff/${staffId}/remove/${eventId}`);
      setSuccess(`Staff assignment removed successfully.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove staff assignment.');
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || s.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Link to="/admin" className="text-xs hover:underline text-slate-400">Admin Dashboard</Link>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs font-semibold">Event Staff</span>
          </div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Event Staff Workspace</h1>
          <p className="text-sm text-slate-400">Onboard staff accounts, specify shifts, assign areas of responsibility, and view check-ins</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Onboard Crew Member
        </button>
      </div>

      {/* Feedback Alerts */}
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
      <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search roster by crew name, employee ID, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-300 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-2">Department:</span>
          {(['ALL', 'REGISTRATION', 'SECURITY', 'TECHNICAL', 'PHOTOGRAPHY', 'STAGE'] as const).map(dept => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                departmentFilter === dept
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-850'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex py-20 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 text-slate-500 italic border border-dashed border-slate-850 rounded-3xl">
              No crew members match department filters.
            </div>
          ) : (
            filteredStaff.map((member) => (
              <div key={member.id} className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between space-y-6 hover:border-slate-700/80 transition-all">
                <div className="space-y-4">
                  {/* Photo & Identity details */}
                  <div className="flex items-center gap-4">
                    <img
                      src={member.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={member.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-800 bg-slate-900"
                    />
                    <div>
                      <h2 className="font-bold text-slate-200 font-outfit text-base">{member.fullName}</h2>
                      <p className="text-[10px] text-slate-500 font-bold tracking-wider font-mono">ID: {member.employeeNumber}</p>
                      
                      <span className={`inline-block px-2 py-0.5 mt-1 rounded-full border text-[8px] font-black uppercase tracking-wider ${
                        member.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>

                  {/* Credentials details */}
                  <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-400 bg-slate-950/40 p-3 rounded-2xl border border-slate-900">
                    <div>
                      <span className="font-semibold text-slate-600 block uppercase">Department</span>
                      <span className="text-slate-300 font-bold">{member.department}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600 block uppercase">Position</span>
                      <span className="text-slate-300 font-bold">{member.position || 'Crew'}</span>
                    </div>
                    {member.shiftStart && (
                      <div className="col-span-2 flex items-center gap-1.5 pt-1.5 border-t border-slate-900/60 text-[10px] text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Shift Hours: {member.shiftStart.substring(0, 5)} - {member.shiftEnd?.substring(0, 5)}</span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Events lists */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Allocated Events Areas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.assignedEvents && member.assignedEvents.length > 0 ? (
                        member.assignedEvents.map((e: any) => (
                          <span key={e.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-900 text-[10px] text-slate-300 rounded-lg">
                            {e.title}
                            <button
                              onClick={() => handleRemoveAssignment(member.id, e.id)}
                              className="text-slate-500 hover:text-rose-400 font-bold"
                              title="Unassign Area"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No event assignments.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-850/60">
                  <button
                    onClick={() => handleOpenAssign(member)}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Assign Event
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg border border-transparent hover:border-slate-700/50 transition-colors"
                      title="Edit Staff Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.fullName)}
                      className="p-1.5 hover:bg-red-950/20 text-slate-400 hover:text-rose-450 rounded-lg border border-transparent hover:border-red-900/20 transition-colors"
                      title="Remove Staff"
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

      {/* ONBOARDING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> {editingStaff ? 'Edit Staff Profile' : 'Onboard New Staff Member'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Employee ID Number</label>
                  <input
                    type="text"
                    required
                    value={formEmployeeNumber}
                    onChange={(e) => setFormEmployeeNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all font-mono"
                    placeholder="e.g. EMP-9821"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. Sarah Connor"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="sarah@smartevents.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. +12345678"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    <option value="REGISTRATION">REGISTRATION & TICKETS</option>
                    <option value="SECURITY">SECURITY & GATES</option>
                    <option value="TECHNICAL">TECHNICAL & AUDIOVISUAL</option>
                    <option value="PHOTOGRAPHY">PHOTOGRAPHY & MEDIA</option>
                    <option value="STAGE">STAGE MANAGEMENT</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Position Title</label>
                  <input
                    type="text"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. Lead Sound Engineer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Shift Start (HH:MM)</label>
                  <input
                    type="time"
                    value={formShiftStart}
                    onChange={(e) => setFormShiftStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Shift End (HH:MM)</label>
                  <input
                    type="time"
                    value={formShiftEnd}
                    onChange={(e) => setFormShiftEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avatar Photo URL</label>
                  <input
                    type="text"
                    value={formProfilePhoto}
                    onChange={(e) => setFormProfilePhoto(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Emergency Contact</label>
                  <input
                    type="text"
                    value={formEmergencyContact}
                    onChange={(e) => setFormEmergencyContact(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="Name and number"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Incident notes / Comments</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all h-16"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Security Login details (ONLY shown during creation) */}
              {!editingStaff && (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-4">
                  <h3 className="text-xs font-bold font-outfit text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-400" /> Onboard Login Account Credentials
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Username</label>
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        placeholder="sarah_c"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Temporary Password</label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        placeholder="Create entry password"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                  {editingStaff ? 'Save Roster Details' : 'Onboard Crew Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN STAFF TO EVENT AREA MODAL */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold font-outfit text-white flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-indigo-400" /> Assign Event Staff Responsibility
              </h2>
              <button onClick={() => setAssignModal({ ...assignModal, isOpen: false, staffId: null, staffName: '' })} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <p className="text-xs text-slate-400">
                Assign crew member <strong className="text-slate-200">"{assignModal.staffName}"</strong> to an event and define their shift details.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Target Event</label>
                <select
                  value={assignModal.selectedEventId}
                  onChange={(e) => setAssignModal({ ...assignModal, selectedEventId: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                >
                  <option value={0}>-- Select event --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assigned Work Area</label>
                <input
                  type="text"
                  required
                  value={assignModal.area}
                  onChange={(e) => setAssignModal({ ...assignModal, area: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  placeholder="e.g. Entrance Gate 3, Stage A"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description of Responsibility</label>
                <textarea
                  required
                  value={assignModal.responsibility}
                  onChange={(e) => setAssignModal({ ...assignModal, responsibility: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all h-16"
                  placeholder="Summarize gate rules, ticket verification flow, etc."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setAssignModal({ ...assignModal, isOpen: false, staffId: null, staffName: '' })}
                  className="px-4 py-2 bg-slate-900 border border-slate-850 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                >
                  Assign Duty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
