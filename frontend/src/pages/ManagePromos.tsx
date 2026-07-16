import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Search, Plus, Edit2, Trash2, Calendar, CheckCircle, AlertCircle, Copy, Download, Percent, FileText, ToggleLeft, ToggleRight, X } from 'lucide-react';
import api from '../utils/api';

interface PromoCodeItem {
  id: number;
  code: string;
  campaignName: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscountAmount: number;
  minPurchaseAmount: number;
  startDate: string | null;
  expirationDate: string | null;
  maxTotalUses: number;
  maxUsesPerUser: number;
  currentUsageCount: number;
  active: boolean;
  createdBy: string;
  createdAt: string;
  applicableEvents: any[];
  applicableCategories: any[];
}

const ManagePromos: React.FC = () => {
  const [promos, setPromos] = useState<PromoCodeItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PERCENTAGE' | 'FIXED'>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCodeItem | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formCampaignName, setFormCampaignName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [formDiscountValue, setFormDiscountValue] = useState(0);
  const [formMaxDiscountAmount, setFormMaxDiscountAmount] = useState(0);
  const [formMinPurchaseAmount, setFormMinPurchaseAmount] = useState(0);
  const [formStartDate, setFormStartDate] = useState('');
  const [formExpirationDate, setFormExpirationDate] = useState('');
  const [formMaxTotalUses, setFormMaxTotalUses] = useState(0);
  const [formMaxUsesPerUser, setFormMaxUsesPerUser] = useState(1);
  const [formActive, setFormActive] = useState(true);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promoRes, eventRes, categoryRes] = await Promise.all([
        api.get('/api/admin/promos'),
        api.get('/api/events?size=100'),
        api.get('/api/categories'),
      ]);
      setPromos(promoRes.data || []);
      setEvents(eventRes.data.content || []);
      setCategories(categoryRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch promo campaign list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearForm = () => {
    setFormCode('');
    setFormCampaignName('');
    setFormDescription('');
    setFormDiscountType('PERCENTAGE');
    setFormDiscountValue(0);
    setFormMaxDiscountAmount(0);
    setFormMinPurchaseAmount(0);
    setFormStartDate('');
    setFormExpirationDate('');
    setFormMaxTotalUses(0);
    setFormMaxUsesPerUser(1);
    setFormActive(true);
    setSelectedEventIds([]);
    setSelectedCategoryIds([]);
    setEditingPromo(null);
  };

  const handleOpenCreate = () => {
    clearForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (promo: PromoCodeItem) => {
    setEditingPromo(promo);
    setFormCode(promo.code);
    setFormCampaignName(promo.campaignName);
    setFormDescription(promo.description);
    setFormDiscountType(promo.discountType);
    setFormDiscountValue(promo.discountValue);
    setFormMaxDiscountAmount(promo.maxDiscountAmount);
    setFormMinPurchaseAmount(promo.minPurchaseAmount);
    setFormStartDate(promo.startDate ? promo.startDate.substring(0, 16) : '');
    setFormExpirationDate(promo.expirationDate ? promo.expirationDate.substring(0, 16) : '');
    setFormMaxTotalUses(promo.maxTotalUses);
    setFormMaxUsesPerUser(promo.maxUsesPerUser);
    setFormActive(promo.active);
    setSelectedEventIds(promo.applicableEvents.map((e: any) => e.id));
    setSelectedCategoryIds(promo.applicableCategories.map((c: any) => c.id));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formCode.trim()) {
      setError('Promo code string is required.');
      return;
    }

    const payload = {
      code: formCode.trim().toUpperCase(),
      campaignName: formCampaignName.trim(),
      description: formDescription.trim(),
      discountType: formDiscountType,
      discountValue: formDiscountValue,
      maxDiscountAmount: formDiscountType === 'PERCENTAGE' ? formMaxDiscountAmount : 0,
      minPurchaseAmount: formMinPurchaseAmount,
      startDate: formStartDate ? formStartDate + ':00' : null,
      expirationDate: formExpirationDate ? formExpirationDate + ':00' : null,
      maxTotalUses: formMaxTotalUses,
      maxUsesPerUser: formMaxUsesPerUser,
      active: formActive,
      applicableEvents: selectedEventIds.map(id => ({ id })),
      applicableCategories: selectedCategoryIds.map(id => ({ id })),
    };

    try {
      if (editingPromo) {
        await api.put(`/api/admin/promos/${editingPromo.id}`, payload);
        setSuccess(`Promo code "${payload.code}" updated successfully.`);
      } else {
        await api.post('/api/admin/promos', payload);
        setSuccess(`Promo campaign "${payload.code}" registered successfully.`);
      }
      setIsModalOpen(false);
      clearForm();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to persist promo code settings.');
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Are you sure you want to delete promo code ${code}?`)) return;
    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/api/admin/promos/${id}`);
      setSuccess(`Promo code "${code}" deleted successfully.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete promo code.');
    }
  };

  const handleDuplicate = async (id: number, code: string) => {
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/api/admin/promos/${id}/duplicate`);
      setSuccess(`Duplicated promo campaign copied from ${code} successfully.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to duplicate promo.');
    }
  };

  const handleToggleActive = async (promo: PromoCodeItem) => {
    setError(null);
    setSuccess(null);
    try {
      const payload = { ...promo, active: !promo.active };
      await api.put(`/api/admin/promos/${promo.id}`, payload);
      setSuccess(`Promo code "${promo.code}" active status toggled.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to toggle active status.');
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/api/admin/promos/report/${format}`, {
        responseType: 'blob',
      });
      const file = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Promo-Campaigns-Report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download report.');
    }
  };

  const toggleEventSelection = (id: number) => {
    setSelectedEventIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleCategorySelection = (id: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter criteria
  const filteredPromos = promos.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.campaignName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status checks
    const now = new Date();
    const isExpired = p.expirationDate ? new Date(p.expirationDate) < now : false;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && p.active && !isExpired) ||
      (statusFilter === 'INACTIVE' && !p.active) ||
      (statusFilter === 'EXPIRED' && isExpired);

    // Type checks
    const matchesType = typeFilter === 'ALL' || p.discountType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Link to="/admin" className="text-xs hover:underline text-slate-400">Admin Dashboard</Link>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs font-semibold">Promo Campaigns</span>
          </div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Promo & Discount Codes</h1>
          <p className="text-sm text-slate-400">Create discount codes, set min limits, map events, and audit usage campaigns</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" /> Export PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export Excel
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Promo Campaign
          </button>
        </div>
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

      {/* Filters Area */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search promos by code or campaign name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-300 focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-850 rounded-xl">
            {(['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-850 rounded-xl">
            {(['ALL', 'PERCENTAGE', 'FIXED'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  typeFilter === type
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'ALL' ? 'ALL TYPES' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Promos Grid / Table */}
      {loading ? (
        <div className="flex py-20 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromos.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 text-slate-500 italic border border-dashed border-slate-850 rounded-3xl">
              No matching promo campaigns found.
            </div>
          ) : (
            filteredPromos.map((promo) => {
              const isExpired = promo.expirationDate ? new Date(promo.expirationDate) < new Date() : false;
              const hasUsageLimit = promo.maxTotalUses > 0;
              const usagePercent = hasUsageLimit ? (promo.currentUsageCount / promo.maxTotalUses) * 100 : 0;

              return (
                <div key={promo.id} className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between space-y-6 hover:border-slate-700/80 transition-all">
                  <div className="space-y-4">
                    {/* Header: Code & Active Toggle */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl tracking-widest font-mono">
                          <Tag className="w-3.5 h-3.5" /> {promo.code}
                        </span>
                        <h2 className="text-sm font-bold text-slate-200 font-outfit mt-2">{promo.campaignName}</h2>
                      </div>
                      
                      <button
                        onClick={() => handleToggleActive(promo)}
                        className={`text-slate-400 hover:text-white transition-colors`}
                        title={promo.active ? 'Deactivate Coupon' : 'Activate Coupon'}
                      >
                        {promo.active ? (
                          <ToggleRight className="w-9 h-9 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-slate-600" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{promo.description}</p>

                    {/* Value indicator */}
                    <div className="flex gap-4 items-center bg-slate-950/60 border border-slate-900 p-3 rounded-2xl">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <Percent className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Discount Value</p>
                        <p className="text-sm font-black text-slate-100 font-outfit mt-0.5">
                          {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% Off` : `$${promo.discountValue.toFixed(2)} Off`}
                        </p>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>USAGES: {promo.currentUsageCount}{hasUsageLimit && ` / ${promo.maxTotalUses}`}</span>
                        {hasUsageLimit && <span>{Math.round(usagePercent)}% USED</span>}
                      </div>
                      {hasUsageLimit && (
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              usagePercent >= 90 ? 'bg-rose-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    {/* Meta info dates */}
                    <div className="border-t border-slate-850 pt-4 grid grid-cols-2 gap-3 text-[10px] text-slate-500">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-600 uppercase tracking-wide">Min Order</p>
                        <p className="text-slate-300">${promo.minPurchaseAmount.toFixed(2)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-600 uppercase tracking-wide">Max Cap</p>
                        <p className="text-slate-300">{promo.maxDiscountAmount > 0 ? `$${promo.maxDiscountAmount.toFixed(2)}` : 'None'}</p>
                      </div>
                      <div className="space-y-0.5 col-span-2 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        <span>
                          {promo.expirationDate
                            ? `Expires ${new Date(promo.expirationDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}`
                            : 'No expiration date'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-850/60">
                    <button
                      onClick={() => handleDuplicate(promo.id, promo.code)}
                      className="p-2 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded-xl border border-transparent hover:border-slate-700/50 transition-colors"
                      title="Duplicate Campaign"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(promo)}
                      className="p-2 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-xl border border-transparent hover:border-slate-700/50 transition-colors"
                      title="Edit Campaign"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id, promo.code)}
                      className="p-2 hover:bg-red-950/20 text-slate-400 hover:text-rose-450 rounded-xl border border-transparent hover:border-red-900/20 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-400" /> {editingPromo ? 'Edit Promo Campaign' : 'Create Promo Campaign'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Promo Code</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all uppercase font-mono tracking-wider"
                    placeholder="e.g. SUMMER50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Campaign Name</label>
                  <input
                    type="text"
                    required
                    value={formCampaignName}
                    onChange={(e) => setFormCampaignName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. Summer Camp Promo"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all h-20"
                    placeholder="Provide details of discount conditions..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Discount Type</label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED">FIXED AMOUNT ($)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                {formDiscountType === 'PERCENTAGE' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Max Discount Cap ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formMaxDiscountAmount}
                      onChange={(e) => setFormMaxDiscountAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                      placeholder="0 for unlimited cap"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Min Purchase Required ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formMinPurchaseAmount}
                    onChange={(e) => setFormMinPurchaseAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Campaign Start Date</label>
                  <input
                    type="datetime-local"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Expiration Date</label>
                  <input
                    type="datetime-local"
                    value={formExpirationDate}
                    onChange={(e) => setFormExpirationDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Max Total Uses Limit</label>
                  <input
                    type="number"
                    value={formMaxTotalUses}
                    onChange={(e) => setFormMaxTotalUses(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                    placeholder="0 for unlimited"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Max Uses Per User Limit</label>
                  <input
                    type="number"
                    value={formMaxUsesPerUser}
                    onChange={(e) => setFormMaxUsesPerUser(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Mappings selection lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-850 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Applicable Events (Restricts scope)</label>
                  <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-3 max-h-36 overflow-y-auto space-y-1.5">
                    {events.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No events available.</p>
                    ) : (
                      events.map(e => (
                        <label key={e.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedEventIds.includes(e.id)}
                            onChange={() => toggleEventSelection(e.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                          />
                          <span>{e.title}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Applicable Categories</label>
                  <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-3 max-h-36 overflow-y-auto space-y-1.5">
                    {categories.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No categories available.</p>
                    ) : (
                      categories.map(c => (
                        <label key={c.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(c.id)}
                            onChange={() => toggleCategorySelection(c.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                          />
                          <span>{c.name}</span>
                        </label>
                      ))
                    )}
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
                  {editingPromo ? 'Save Coupon Changes' : 'Register Promo Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePromos;
