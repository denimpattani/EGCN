import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Trash, 
  Briefcase, 
  User, 
  Mail, 
  Key, 
  Phone, 
  FileText, 
  Loader, 
  ShieldCheck, 
  Users 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ExpertsManager() {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Expert Provision Form States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [expertise, setExpertise] = useState('General Growth');
  const [bio, setBio] = useState('');

  const fetchExperts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/experts');
      setExperts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch experts list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const openProvisionModal = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setExpertise('General Growth');
    setBio('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete the expert: "${name}"? This will terminate their account credentials and unlink them from all active clients.`)) {
      return;
    }

    try {
      await api.delete(`/admin/experts/${id}`);
      fetchExperts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to revoke expert account');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username,
      email,
      password,
      fullName,
      phone,
      expertise,
      bio,
    };

    try {
      await api.post('/admin/experts', payload);
      setIsModalOpen(false);
      fetchExperts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to provision expert advisor');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* Header and Button Block */}
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
              Advisory Expert Profiles
            </h1>
            <p className="text-xs text-[#8C8C8C]">
              Onboard certification consultants, manage expertise specialties, and generate secure login credentials.
            </p>
          </div>
        </div>

        <button
          onClick={openProvisionModal}
          className="px-5 py-3 bg-primary hover:bg-[#1A1A1A] border border-primary text-xs font-bold text-cream rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Expert Advisor</span>
        </button>
      </div>

      {/* Roster display */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experts.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl text-xs text-[#8C8C8C]">
              No consulting expert advisors onboarded yet. Use the onboard button to provision credentials.
            </div>
          ) : (
            experts.map((exp) => (
              <div 
                key={exp._id}
                className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-primary/10 transition-all duration-300 group"
              >
                <div>
                  {/* Title and delete */}
                  <div className="flex items-start justify-between border-b border-[#111] pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-cream capitalize">{exp.fullName}</h4>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/5 border border-primary/10 px-2 py-0.5 rounded">
                          {exp.expertise}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(exp._id, exp.fullName)}
                      className="p-2 bg-[#141414] hover:bg-red-950/20 border border-[#222] hover:border-red-900/30 text-[#8C8C8C] hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Revoke Credentials"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Profile info details */}
                  <p className="text-xs text-[#8C8C8C] leading-relaxed mb-5 italic min-h-[50px]">
                    "{exp.bio}"
                  </p>

                  <div className="space-y-2 border-t border-[#111] pt-4 mb-5">
                    <div className="flex items-center gap-2.5 text-[11px] text-[#8C8C8C]">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{exp.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[11px] text-[#8C8C8C]">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{exp.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Assigned client count footer */}
                <div className="flex items-center justify-between border-t border-[#111] pt-4 bg-[#111]/10 px-2 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-cream">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">{exp.assignedClients?.length || 0} clients</span>
                  </div>
                  <span className="text-[9px] text-[#555] font-mono uppercase">
                    Code: {exp.username}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Onboard Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              <div className="flex items-center gap-2.5 mb-6">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-cream">Provision Expert Credentials</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Full Advisor Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#555] absolute left-4 top-3.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Param Joshi"
                        className="w-full bg-[#111] border border-[#222] rounded-xl pl-11 pr-4 py-3 text-xs text-cream outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Expertise Specialty
                    </label>
                    <select
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 text-xs text-cream outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="General Growth">General Growth Strategy</option>
                      <option value="Marketing">B2B Product Marketing</option>
                      <option value="Finance">Corporate Taxation & Finance</option>
                      <option value="CashFlow">CashFlow Auditing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Advisor Email (Login ID)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#555] absolute left-4 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="advisor@egcn.in"
                        className="w-full bg-[#111] border border-[#222] rounded-xl pl-11 pr-4 py-3 text-xs text-cream outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Advisor Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. param_growth"
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#555] absolute left-4 top-3.5" />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full bg-[#111] border border-[#222] rounded-xl pl-11 pr-4 py-3 text-xs text-cream outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Login Password
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-[#555] absolute left-4 top-3.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Secure Password"
                        className="w-full bg-[#111] border border-[#222] rounded-xl pl-11 pr-4 py-3 text-xs text-cream outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Advisor Professional Bio
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-[#555] absolute left-4 top-3.5" />
                    <textarea
                      required
                      rows="3"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Short professional summary of certificates and advisory fields..."
                      className="w-full bg-[#111] border border-[#222] rounded-xl pl-11 pr-4 py-3 text-xs text-cream outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#151515]">
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
                    Generate Credentials
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
