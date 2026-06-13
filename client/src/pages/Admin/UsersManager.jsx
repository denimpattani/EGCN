import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  UserCheck, 
  CreditCard, 
  Check, 
  Loader, 
  ShieldAlert, 
  ExternalLink, 
  X, 
  Clock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function UsersManager() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [experts, setExperts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);

  // Form States
  const [overridePlan, setOverridePlan] = useState('free');
  const [durationDays, setDurationDays] = useState(30);
  const [assignedExpertId, setAssignedExpertId] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/admin/users?search=${search}&page=${page}&limit=10`);
      setUsers(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error) {
      console.error('Failed to retrieve client users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [expertsRes, plansRes] = await Promise.all([
        api.get('/admin/experts'),
        api.get('/admin/plans')
      ]);
      setExperts(expertsRes.data.data);
      setPlans(plansRes.data.data);
    } catch (error) {
      console.error('Failed to load expert/plan dependencies:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const openPlanModal = (user) => {
    setSelectedUser(user);
    setOverridePlan(user.plan || 'free');
    setDurationDays(30);
    setIsPlanModalOpen(true);
  };

  const openExpertModal = (user) => {
    setSelectedUser(user);
    setAssignedExpertId(user.assignedExpert?._id || '');
    setIsExpertModalOpen(true);
  };

  const handlePlanOverride = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/users/${selectedUser._id}/plan`, {
        plan: overridePlan,
        durationDays: Number(durationDays),
      });
      setIsPlanModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Override plan allocation failed');
    }
  };

  const handleExpertAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/assign-expert', {
        userId: selectedUser._id,
        expertId: assignedExpertId || null,
      });
      setIsExpertModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Expert linkage assignment failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* Header and Search Lockup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1A1A] pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-cream hover:bg-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold font-display text-cream tracking-tight">
              User & Plan Registry
            </h1>
            <p className="text-xs text-[#8C8C8C]">
              Search through client accounts, manually assign premium consultation plans, and link expert advisors.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#8C8C8C] absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, business or email..."
            className="w-full bg-[#111] border border-[#222] rounded-xl pl-11 pr-4 py-3 text-xs text-cream outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1A1A1A] bg-[#111]/30">
                  <th className="text-[10px] uppercase font-bold text-[#8C8C8C] px-6 py-4">Client / Business</th>
                  <th className="text-[10px] uppercase font-bold text-[#8C8C8C] px-6 py-4">Scale & Type</th>
                  <th className="text-[10px] uppercase font-bold text-[#8C8C8C] px-6 py-4">Active Plan</th>
                  <th className="text-[10px] uppercase font-bold text-[#8C8C8C] px-6 py-4">Plan Expiration</th>
                  <th className="text-[10px] uppercase font-bold text-[#8C8C8C] px-6 py-4">Assigned Expert</th>
                  <th className="text-[10px] uppercase font-bold text-[#8C8C8C] px-6 py-4 text-center">Controls</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-xs text-[#8C8C8C]">
                      No business accounts found matching your search.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isExpired = user.planExpiry && new Date(user.planExpiry) < new Date();
                    
                    return (
                      <tr key={user._id} className="border-b border-[#151515] hover:bg-[#111]/10 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs text-cream font-bold">{user.businessName}</p>
                            <p className="text-[10px] text-[#8C8C8C] mt-0.5">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-[10px] text-cream bg-[#111] border border-[#222] px-2 py-0.5 rounded font-mono mr-1.5">
                              {user.businessScale}
                            </span>
                            <span className="text-[10px] text-[#8C8C8C]">
                              {user.businessType}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: user.plan === 'free' ? '#1F1F1F' : 'rgba(37,99,235,0.1)',
                              color: user.plan === 'free' ? '#8C8C8C' : '#60A5FA',
                              border: `1px solid ${user.plan === 'free' ? '#2A2A2A' : 'rgba(37,99,235,0.2)'}`
                            }}
                          >
                            {user.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.planExpiry ? (
                            <span className={`text-[10px] font-medium flex items-center gap-1.5 ${isExpired ? 'text-red-500' : 'text-[#8C8C8C]'}`}>
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {new Date(user.planExpiry).toLocaleDateString()} {isExpired && '(Expired)'}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#444] font-medium">Infinite (Free)</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.assignedExpert ? (
                            <div>
                              <p className="text-xs text-cream font-medium">{user.assignedExpert.fullName}</p>
                              <p className="text-[10px] text-primary mt-0.5 font-semibold uppercase tracking-wider">{user.assignedExpert.expertise}</p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-red-500/80 bg-red-950/10 border border-red-900/10 px-2 py-0.5 rounded-md font-semibold">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Plan manual override trigger */}
                            <button
                              onClick={() => openPlanModal(user)}
                              className="px-3 py-1.5 bg-[#111] hover:bg-[#222] border border-[#222] text-[10px] font-bold text-cream rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Override Plan"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-primary" />
                              <span>Plan</span>
                            </button>

                            {/* Expert manual assignment trigger */}
                            <button
                              onClick={() => openExpertModal(user)}
                              className="px-3 py-1.5 bg-[#111] hover:bg-[#222] border border-[#222] text-[10px] font-bold text-cream rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Assign Advisor"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-green-500" />
                              <span>Advisor</span>
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

          {/* Simple Pagination Footer */}
          {total > 10 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#1A1A1A] bg-[#111]/10">
              <span className="text-[10px] text-[#8C8C8C]">
                Showing {((page - 1) * 10) + 1} - {Math.min(page * 10, total)} of {total} business accounts
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3.5 py-1.5 bg-[#111] border border-[#222] text-[10px] font-bold text-cream rounded-lg disabled:opacity-40 disabled:cursor-default"
                >
                  Prev
                </button>
                <button
                  disabled={page * 10 >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3.5 py-1.5 bg-[#111] border border-[#222] text-[10px] font-bold text-cream rounded-lg disabled:opacity-40 disabled:cursor-default"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan Override Dialog modal */}
      <AnimatePresence>
        {isPlanModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-sm rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="absolute top-6 right-6 text-[#8C8C8C] hover:text-cream cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-cream">Manual Plan Override</h3>
              </div>

              <div className="mb-6 p-4 bg-[#111] rounded-2xl border border-[#1A1A1A]">
                <p className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider mb-1">Target Client</p>
                <p className="text-xs text-cream font-bold">{selectedUser.businessName}</p>
                <p className="text-[10px] text-[#555] font-mono mt-0.5">Current Tier: {selectedUser.plan.toUpperCase()}</p>
              </div>

              <form onSubmit={handlePlanOverride} className="space-y-4">
                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Choose Pricing Plan
                  </label>
                  <select
                    value={overridePlan}
                    onChange={(e) => setOverridePlan(e.target.value)}
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 text-xs text-cream outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="free">Free Tier (Base Fallback)</option>
                    {plans.map((p) => (
                      <option key={p._id} value={p.name}>
                        {p.displayName} (₹{p.price}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                {overridePlan !== 'free' && (
                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Active Cycle Duration (Days)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream focus:border-primary outline-none"
                    />
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#151515]">
                  <button
                    type="button"
                    onClick={() => setIsPlanModalOpen(false)}
                    className="px-4 py-2.5 bg-transparent border border-[#222] text-xs font-bold text-[#8C8C8C] hover:text-cream rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-[#1A1A1A] border border-primary text-xs font-bold text-cream rounded-xl transition-colors active:scale-95 cursor-pointer"
                  >
                    Save Override
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expert Assignment Dialog modal */}
      <AnimatePresence>
        {isExpertModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-sm rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsExpertModalOpen(false)}
                className="absolute top-6 right-6 text-[#8C8C8C] hover:text-cream cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <UserCheck className="w-5 h-5 text-green-500" />
                <h3 className="text-base font-bold text-cream">Assign Growth Expert</h3>
              </div>

              <div className="mb-6 p-4 bg-[#111] rounded-2xl border border-[#1A1A1A]">
                <p className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider mb-1">Target Client</p>
                <p className="text-xs text-cream font-bold">{selectedUser.businessName}</p>
                <p className="text-[10px] text-[#555] font-mono mt-0.5">Scale: {selectedUser.businessScale} turnover</p>
              </div>

              <form onSubmit={handleExpertAssignment} className="space-y-4">
                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Choose EGCN Advisor
                  </label>
                  <select
                    value={assignedExpertId}
                    onChange={(e) => setAssignedExpertId(e.target.value)}
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 text-xs text-cream outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Unassigned (None)</option>
                    {experts.map((exp) => (
                      <option key={exp._id} value={exp._id}>
                        {exp.fullName} ({exp.expertise})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-[11px] text-[#8C8C8C] bg-[#111] border border-[#1A1A1A] p-3.5 rounded-xl flex items-start gap-2 leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>
                    Saving this assignment dynamically links the client to the expert and automatically spawns a private consulting room.
                  </span>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#151515]">
                  <button
                    type="button"
                    onClick={() => setIsExpertModalOpen(false)}
                    className="px-4 py-2.5 bg-transparent border border-[#222] text-xs font-bold text-[#8C8C8C] hover:text-cream rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-[#1A1A1A] border border-primary text-xs font-bold text-cream rounded-xl transition-colors active:scale-95 cursor-pointer"
                  >
                    Save Assignment
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
