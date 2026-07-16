import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, MapPin, QrCode, AlertTriangle, CheckCircle, XCircle, Search, HelpCircle, Send, Users, Activity } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface StaffAssignment {
  id: number;
  event: {
    id: number;
    title: string;
    venue: string;
    date: string;
    time: string;
  };
  assignedArea: string;
  responsibility: string;
}

interface CheckedInAttendee {
  status: 'SUCCESS' | 'FAILED';
  attendeeName?: string;
  seatCount?: number;
  eventTitle?: string;
  checkInTime?: string;
  error?: string;
}

const StaffConsole: React.FC = () => {
  const { user } = useAuth();
  
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // QR Check-in scanner simulator states
  const [scanBookingId, setScanBookingId] = useState('');
  const [scanResult, setScanResult] = useState<CheckedInAttendee | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  // Incident reporting state
  const [incTitle, setIncTitle] = useState('');
  const [incDesc, setIncDesc] = useState('');
  const [incPriority, setIncPriority] = useState('MEDIUM');
  const [incPhoto, setIncPhoto] = useState('');
  const [reportingIncident, setReportingIncident] = useState(false);
  const [incidentSuccess, setIncidentSuccess] = useState<string | null>(null);
  const [incidentError, setIncidentError] = useState<string | null>(null);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/staff-portal/assigned');
      setStaffInfo(res.data.staff);
      const assigns = res.data.assignments || [];
      setAssignments(assigns);
      
      if (assigns.length > 0) {
        setSelectedEventId(assigns[0].event.id);
        fetchEventLogs(assigns[0].event.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to retrieve staff schedule assignments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventLogs = async (eventId: number) => {
    try {
      // Find checked-in attendees
      const res = await api.get(`/api/admin/staff/stats`); // we can retrieve dashboard details or general logs
      // Fetch check in logs specifically
      const logsRes = await api.get(`/api/staff-portal/assigned`); // fallback
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleEventChange = (eventId: number) => {
    setSelectedEventId(eventId);
    setScanResult(null);
    setScanBookingId('');
  };

  const handleTicketCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanResult(null);
    if (!scanBookingId.trim() || selectedEventId === 0) return;

    try {
      setCheckingIn(true);
      const res = await api.post('/api/staff-portal/check-in', {
        bookingId: parseInt(scanBookingId.trim()),
        eventId: selectedEventId,
      });
      setScanResult(res.data);
      
      // Add to session logs list
      const newLog = {
        id: Date.now(),
        attendeeName: res.data.attendeeName,
        seatCount: res.data.seatCount,
        eventTitle: res.data.eventTitle,
        checkInTime: res.data.checkInTime,
      };
      setAttendanceLogs(prev => [newLog, ...prev]);
      setScanBookingId('');
    } catch (err: any) {
      setScanResult({
        status: 'FAILED',
        error: err.response?.data?.error || 'Invalid ticket code scan.',
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentError(null);
    setIncidentSuccess(null);

    if (!incTitle.trim() || !incDesc.trim() || selectedEventId === 0) {
      setIncidentError('Roster event, incident summary, and details are required.');
      return;
    }

    try {
      setReportingIncident(true);
      const payload = {
        title: incTitle.trim(),
        description: incDesc.trim(),
        priority: incPriority,
        photoUrl: incPhoto.trim() || null,
        event: { id: selectedEventId },
      };

      await api.post('/api/staff-portal/incidents', payload);
      setIncidentSuccess('Incident reported successfully. Security/System admin notified.');
      setIncTitle('');
      setIncDesc('');
      setIncPhoto('');
    } catch (err: any) {
      setIncidentError(err.response?.data?.error || 'Failed to submit incident log.');
    } finally {
      setReportingIncident(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !staffInfo) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4 bg-slate-950">
        <p className="text-rose-400 font-bold">{error || 'Access Denied. Event Staff profile not configured.'}</p>
        <Link to="/" className="text-sm font-semibold text-indigo-400">Back to Home</Link>
      </div>
    );
  }

  const activeEventAssignment = assignments.find(a => a.event.id === selectedEventId);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Crew Dashboard</h1>
          <p className="text-sm text-slate-400"> Roster: {staffInfo.fullName} (EMP ID: {staffInfo.employeeNumber})</p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-900 rounded-2xl text-xs text-slate-400">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Shift Hours: {staffInfo.shiftStart?.substring(0, 5)} - {staffInfo.shiftEnd?.substring(0, 5)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Assigned Area & Incidents Log */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Active Assignment Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl"></div>
            
            <h2 className="text-md font-bold font-outfit text-slate-200 border-b border-slate-900 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" /> Assigned Roster Area
            </h2>

            {assignments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No event duties allocated for this shift.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Duty Event</label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => handleEventChange(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    {assignments.map(a => (
                      <option key={a.event.id} value={a.event.id}>{a.event.title}</option>
                    ))}
                  </select>
                </div>

                {activeEventAssignment && (
                  <div className="space-y-3 bg-slate-950/60 p-4 border border-slate-900 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <span>{activeEventAssignment.assignedArea}</span>
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed font-light">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mb-0.5">Duties Description</p>
                      {activeEventAssignment.responsibility}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Incident Reporter */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-md font-bold font-outfit text-slate-200 border-b border-slate-900 pb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-indigo-400" /> File Incident Report
            </h2>

            {incidentSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 rounded-xl">
                {incidentSuccess}
              </div>
            )}
            {incidentError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-450 rounded-xl">
                {incidentError}
              </div>
            )}

            <form onSubmit={handleReportIncident} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Incident Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken Stage Mic / Crowd bottleneck"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Priority</label>
                <select
                  value={incPriority}
                  onChange={(e) => setIncPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-350 focus:outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL (Alert Admins)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Photo URL (Reference proof)</label>
                <input
                  type="text"
                  placeholder="Image url link"
                  value={incPhoto}
                  onChange={(e) => setIncPhoto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Detailed Description</label>
                <textarea
                  required
                  placeholder="Describe context of incident, equipment models, or actions taken..."
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none h-20"
                />
              </div>

              <button
                type="submit"
                disabled={reportingIncident}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" /> {reportingIncident ? 'Filing Report...' : 'File Alert Log'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: QR Check-in scanner simulation workspace */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 space-y-6">
            <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400" /> High-Tech Ticket QR Code Scanner
            </h2>

            {/* Check-in simulation tool */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Scan box visual simulation */}
              <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden aspect-video">
                {/* QR Target border */}
                <div className="w-36 h-36 border-2 border-indigo-500/50 rounded-2xl flex flex-col items-center justify-center relative bg-slate-950/80 shadow-inner">
                  {/* Scan Sweep line */}
                  <div className="absolute left-0 right-0 h-[1.5px] bg-indigo-400 shadow-md shadow-indigo-400/80 animate-[bounce_2s_infinite]"></div>
                  
                  <QrCode className="w-16 h-16 text-indigo-400/30" />
                </div>
                
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-4">Simulating Camera Stream</p>
              </div>

              {/* Scanner form */}
              <form onSubmit={handleTicketCheckInSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wide">Enter Ticket Booking ID</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 104"
                      value={scanBookingId}
                      onChange={(e) => setScanBookingId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checkingIn || selectedEventId === 0}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/10 transition-all duration-150 active:scale-95"
                >
                  {checkingIn ? 'Verifying Ticket...' : 'Scan Ticket Code'}
                </button>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Ticket booking ID can be parsed from guest entry ticket PDF.</span>
                </div>
              </form>
            </div>

            {/* Check-in result overlay banner */}
            {scanResult && (
              <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
                scanResult.status === 'SUCCESS' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
              }`}>
                {scanResult.status === 'SUCCESS' ? (
                  <>
                    <CheckCircle className="w-10 h-10 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-black font-outfit uppercase tracking-wider text-slate-200">Access Granted</p>
                      <p className="text-xs text-slate-400 leading-snug">
                        Attendee <strong className="text-slate-200">{scanResult.attendeeName}</strong> verified successfully.
                        Roster Seats: <strong>{scanResult.seatCount}</strong> booked.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-10 h-10 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-black font-outfit uppercase tracking-wider text-slate-200">Access Denied</p>
                      <p className="text-xs text-slate-400">{scanResult.error}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Session check in logs list */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-md font-bold font-outfit text-white flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-indigo-400" /> Roster Check-in Logs (This Session)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800 bg-slate-950/40">
                    <th className="px-4 py-3 font-semibold">Attendee</th>
                    <th className="px-4 py-3 font-semibold">Seats</th>
                    <th className="px-4 py-3 font-semibold">Event</th>
                    <th className="px-4 py-3 font-semibold text-right">Time Scanned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-400">
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">No tickets checked in during this session.</td>
                    </tr>
                  ) : (
                    attendanceLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-900/10">
                        <td className="px-4 py-3 font-bold text-slate-200">{log.attendeeName}</td>
                        <td className="px-4 py-3 font-medium">{log.seatCount} seat{log.seatCount !== 1 && 's'}</td>
                        <td className="px-4 py-3 font-light truncate max-w-xs">{log.eventTitle}</td>
                        <td className="px-4 py-3 text-right text-[10px] text-slate-500">
                          {new Date(log.checkInTime).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StaffConsole;
