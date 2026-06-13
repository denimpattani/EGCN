import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash, 
  Edit, 
  Check, 
  ArrowLeft, 
  Loader, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PlansManager() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [isRecommended, setIsRecommended] = useState(false);
  const [accentHex, setAccentHex] = useState('#d74339');

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/plans');
      setPlans(response.data.data);
    } catch (error) {
      console.error('Failed to load plans:', error);
      alert('Failed to retrieve plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setDisplayName('');
    setPrice(0);
    setDescription('');
    setFeatures('');
    setDurationDays(30);
    setIsRecommended(false);
    setAccentHex('#d74339');
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDisplayName(plan.displayName);
    setPrice(plan.price);
    setDescription(plan.description);
    setFeatures(plan.features.join('\n'));
    setDurationDays(plan.durationDays);
    setIsRecommended(plan.isRecommended);
    setAccentHex(plan.accentHex || '#d74339');
    setIsModalOpen(true);
  };

  const handleDelete = async (id, planName) => {
    if (planName === 'free') {
      alert('Cannot delete base free plan');
      return;
    }
    if (!window.confirm(`Are you absolutely sure you want to delete the plan: "${planName}"? This will terminate checkout listings for this plan.`)) {
      return;
    }

    try {
      await api.delete(`/admin/plans/${id}`);
      fetchPlans();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedFeatures = features.split('\n').filter(f => f.trim() !== '');

    const payload = {
      name,
      displayName,
      price: Number(price),
      description,
      features: formattedFeatures,
      durationDays: Number(durationDays),
      isRecommended,
      accentHex,
    };

    try {
      if (editingPlan) {
        await api.put(`/admin/plans/${editingPlan._id}`, payload);
      } else {
        await api.post('/admin/plans', payload);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save subscription plan');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A] pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-cream hover:bg-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold font-display text-cream tracking-tight">
              Subscription Plans Builder
            </h1>
            <p className="text-xs text-[#8C8C8C]">
              Build, modify, and delete pricing plans visible to standard users.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-primary hover:bg-[#1A1A1A] border border-primary text-xs font-bold text-cream rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Pricing Plan</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="relative bg-[#0A0A0A] border rounded-3xl p-6 flex flex-col justify-between shadow-xl group transition-all duration-300"
              style={{ borderColor: plan.isRecommended ? plan.accentHex : '#1F1F1F' }}
            >
              {plan.isRecommended && (
                <span 
                  className="absolute top-0 right-6 -translate-y-1/2 text-cream text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg"
                  style={{ backgroundColor: plan.accentHex }}
                >
                  Recommended
                </span>
              )}

              <div>
                {/* Title */}
                <div className="flex items-center justify-between mb-4 border-b border-[#111] pb-4">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: plan.accentHex }}
                    />
                    <h3 className="text-cream text-base font-extrabold capitalize">{plan.displayName}</h3>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-2 bg-[#141414] hover:bg-[#222] border border-[#222] text-[#8C8C8C] hover:text-cream rounded-lg transition-colors cursor-pointer"
                      title="Edit Plan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {plan.name !== 'free' && (
                      <button
                        onClick={() => handleDelete(plan._id, plan.name)}
                        className="p-2 bg-[#141414] hover:bg-red-950/20 border border-[#222] hover:border-red-900/30 text-[#8C8C8C] hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[#8C8C8C] leading-normal min-h-[35px] mb-5">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6 border-b border-[#111] pb-4">
                  <span className="text-2xl font-extrabold text-cream">₹{plan.price}</span>
                  <span className="text-[10px] text-[#8C8C8C]">/ {plan.durationDays} days</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#8C8C8C]">
                      <Check
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: plan.accentHex }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Identifier tag */}
              <div className="text-[9px] text-[#555] uppercase font-mono tracking-widest text-right">
                ID: {plan.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plans creation and edit dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold font-display text-cream">
                  {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Plan Code (lowercase ID)
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingPlan}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. enterprise"
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream focus:border-primary outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Enterprise Advisory"
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Price in INR"
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream focus:border-primary outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Duration Cycle (Days)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Brief Description
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary describing ideal businesses for this plan..."
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Features (one feature per line)
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="feature 1&#10;feature 2&#10;feature 3"
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream focus:border-primary outline-none transition-colors font-sans resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Accent Color Hex
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={accentHex}
                        onChange={(e) => setAccentHex(e.target.value)}
                        className="w-10 h-10 rounded-lg bg-[#111] border border-[#222] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={accentHex}
                        onChange={(e) => setAccentHex(e.target.value)}
                        placeholder="#ffffff"
                        className="w-24 bg-[#111] border border-[#222] rounded-xl px-2 py-3 text-xs text-cream focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      id="isRecommended"
                      checked={isRecommended}
                      onChange={(e) => setIsRecommended(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded bg-[#111] border-[#222]"
                    />
                    <label htmlFor="isRecommended" className="text-xs text-cream font-medium cursor-pointer">
                      Flag as Recommended
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-[#151515]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 bg-transparent border border-[#222] text-xs font-bold text-[#8C8C8C] hover:text-cream rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary hover:bg-[#1A1A1A] border border-primary text-xs font-bold text-cream rounded-xl transition-colors active:scale-95 cursor-pointer"
                  >
                    Save Plan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
