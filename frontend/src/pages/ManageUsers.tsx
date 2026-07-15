import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Plus, Edit2, Trash2, Mail, Phone, Calendar, UserPlus, X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';

interface UserItem {
  id: number;
  username: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  createdAt: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Modal Form States
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('USER');
  const [formPassword, setFormPassword] = useState('');

  // Delete Confirm Modal
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    userId: number | null;
    username: string;
  }>({
    isOpen: false,
    userId: null,
    username: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/all');
      setUsers(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const clearForm = () => {
    setFormUsername('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('USER');
    setFormPassword('');
  };

  const handleOpenCreate = () => {
    clearForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPhone(user.phoneNumber || '');
    setFormRole(user.role);
    setFormPassword(''); // blank implies no password update
    setIsEditOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formUsername.trim() || !formEmail.trim() || !formPassword.trim()) {
      setError('Username, email, and password are required.');
      return;
    }

    try {
      const payload = {
        username: formUsername.trim(),
        email: formEmail.trim(),
        phoneNumber: formPhone.trim() || null,
        role: formRole,
        password: formPassword,
      };

      await api.post('/user/admin-create', payload);
      setSuccess(`User account "${formUsername}" created successfully.`);
      setIsCreateOpen(false);
      clearForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user account.');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedUser) return;
    if (!formUsername.trim() || !formEmail.trim()) {
      setError('Username and email are required.');
      return;
    }

    try {
      const payload: any = {
        username: formUsername.trim(),
        email: formEmail.trim(),
        phoneNumber: formPhone.trim() || null,
        role: formRole,
      };
      if (formPassword) {
        payload.password = formPassword;
      }

      await api.put(`/user/${selectedUser.id}`, payload);
      setSuccess(`User account "${formUsername}" updated successfully.`);
      setIsEditOpen(false);
      clearForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user account.');
    }
  };

  const handleDeleteClick = (user: UserItem) => {
    setConfirmDelete({
      isOpen: true,
      userId: user.id,
      username: user.username,
    });
  };

  const confirmDeleteUser = async () => {
    if (confirmDelete.userId === null) return;
    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/user/${confirmDelete.userId}`);
      setSuccess(`User account "${confirmDelete.username}" deleted successfully.`);
      setConfirmDelete({ isOpen: false, userId: null, username: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user.');
      setConfirmDelete({ isOpen: false, userId: null, username: '' });
    }
  };

  // Filter users based on query and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || u.role.toUpperCase() === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Link to="/admin" className="text-xs hover:underline text-slate-400">Admin Dashboard</Link>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs font-semibold">User Accounts</span>
          </div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Manage User Accounts</h1>
          <p className="text-sm text-slate-400">Monitor registrations, update access roles, create or reset user credentials</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Account
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

      {/* Filters Card */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search accounts by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-300 focus:outline-none transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-2">Role:</span>
          {(['ALL', 'ADMIN', 'USER'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === role
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-850'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table Section */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <div className="flex py-20 items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800/80 bg-slate-950/40">
                  <th className="px-6 py-4 font-semibold">User details</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Registered</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const joinDate = user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A';

                    return (
                      <tr key={user.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-900 text-indigo-400 rounded-xl flex items-center justify-center border border-slate-800">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-200">{user.username}</div>
                              <div className="text-[10px] text-slate-500">ID: #{user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{user.email}</span>
                          </div>
                          {user.phoneNumber && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Phone className="w-3.5 h-3.5 text-slate-600" />
                              <span>{user.phoneNumber}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                            user.role === 'ADMIN'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-550/20'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                            <span>{joinDate}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors border border-transparent hover:border-slate-700/50"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="p-1.5 hover:bg-red-950/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-red-900/20"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ACCOUNT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" /> Create Account
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Username</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  placeholder="e.g. johndoe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  placeholder="e.g. john@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  placeholder="e.g. +123456789"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Account Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                >
                  <option value="USER">USER (Regular User)</option>
                  <option value="ADMIN">ADMIN (System Admin)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  placeholder="Create temporary password"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 font-semibold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACCOUNT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-400" /> Edit User Account
              </h2>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Username</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Account Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                >
                  <option value="USER">USER (Regular User)</option>
                  <option value="ADMIN">ADMIN (System Admin)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reset Password</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  placeholder="Leave blank to keep unchanged"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 font-semibold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-sm w-full rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-md font-bold font-outfit text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" /> Confirm Deletion
              </h2>
              <button onClick={() => setConfirmDelete({ isOpen: false, userId: null, username: '' })} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete the user account <strong className="text-slate-200">"{confirmDelete.username}"</strong>?
              This action cannot be undone, and will affect all actions, notifications, reviews, and bookings associated with this user.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
              <button
                type="button"
                onClick={() => setConfirmDelete({ isOpen: false, userId: null, username: '' })}
                className="px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                No, Keep Account
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
