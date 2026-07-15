import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield, Save, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface UserProfileDetails {
  id: number;
  username: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { updateProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfileDetails | null>(null);
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/profile');
      const data = res.data;
      setProfile(data);
      setUsername(data.username);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber || '');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        username,
        email,
        phoneNumber: phoneNumber.trim() || null,
      };
      if (password) {
        payload.password = password;
      }

      const updatedUser = await updateProfile(payload);
      
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          username: updatedUser.username,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber || null,
        });
      }

      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const formattedDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-3xl font-extrabold font-outfit text-white">Account Settings</h1>
        <p className="text-sm text-slate-400">View and update your personal details and change your password</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Account Card Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-600/10">
              <User className="w-10 h-10" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-slate-100 font-outfit">{profile?.username}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{profile?.email}</p>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
              profile?.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            }`}>
              {profile?.role} Account
            </span>

            <div className="w-full border-t border-slate-800/50 pt-4 text-left space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>ID: #{profile?.id}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Joined {formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Details Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdate} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 space-y-6">
            
            <h3 className="text-lg font-bold font-outfit text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" /> Personal Info
            </h3>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Username field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none transition-all"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none transition-all"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              {/* Phone field */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none transition-all"
                    placeholder="Enter phone number (e.g. +1234567890)"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold font-outfit text-white border-b border-slate-800 pt-4 pb-3 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-400" /> Security Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none transition-all"
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>

              {/* Confirm password field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Confirm New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none transition-all"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/50 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/10 active:scale-95 transition-all duration-150"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
