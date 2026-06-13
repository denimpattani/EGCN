import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  PlusCircle, 
  Loader, 
  Award, 
  Send, 
  Check, 
  Trash 
} from 'lucide-react';
import api from '../../services/api';

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [advices, setAdvices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state to post new advice bulletin
  const [targetClientId, setTargetClientId] = useState('');
  const [adviceMessage, setAdviceMessage] = useState('');
  const [isSubmittingAdvice, setIsSubmittingAdvice] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [clientsRes, meetingsRes, advicesRes] = await Promise.all([
        api.get('/expert/clients'),
        api.get('/expert/meetings'),
        api.get('/expert/advices')
      ]);
      setClients(clientsRes.data.data);
      setMeetings(meetingsRes.data.data);
      setAdvices(advicesRes.data.data);

      if (clientsRes.data.data.length > 0) {
        setTargetClientId(clientsRes.data.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to load expert dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePostAdvice = async (e) => {
    e.preventDefault();
    if (!adviceMessage.trim()) return;

    try {
      setIsSubmittingAdvice(true);
      await api.post('/expert/advices', {
        clientId: targetClientId,
        message: adviceMessage,
      });
      setAdviceMessage('');
      fetchData();
      alert('Advisory bullet successfully published to client dashboard feed!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to publish recommendation');
    } finally {
      setIsSubmittingAdvice(false);
    }
  };

  const handleDeleteAdvice = async (id) => {
    if (!window.confirm('Delete this advice bulletin from client feed?')) return;
    try {
      await api.delete(`/expert/advices/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete advice');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled' && new Date(m.scheduledAt) > new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12"
    >
      {/* Advisor Welcome Card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0A0A0A] border border-[#1A1A1A] p-8 md:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] text-primary font-extrabold tracking-widest uppercase border border-primary/20 px-3 py-1 rounded-full bg-primary/5">
            CERTIFIED EGCN CONSULTANT
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-cream mt-4">
            Advisory <span className="text-primary">Console</span>
          </h1>
          <p className="text-[#8C8C8C] text-sm md:text-base mt-3 leading-relaxed">
            Manage your corporate roster of assigned client businesses, lead direct PeerJS video consulting sessions, schedule site visits, and publish operational diagnostics.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Award className="w-80 h-80 text-primary" />
        </div>
      </div>

      {/* Stats Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-cream leading-tight">{clients.length}</h3>
            <p className="text-[11px] text-[#8C8C8C] mt-0.5">Assigned Businesses</p>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-cream leading-tight">{upcomingMeetings.length}</h3>
            <p className="text-[11px] text-[#8C8C8C] mt-0.5">Upcoming Bookings</p>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-cream leading-tight">{advices.length}</h3>
            <p className="text-[11px] text-[#8C8C8C] mt-0.5">Published Advices</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assigned Client Roster & Bookings list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Directory */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5 border-b border-[#111] pb-3">
              <h3 className="text-sm font-bold text-cream tracking-wider uppercase">
                Assigned Clients Directory
              </h3>
              <button 
                onClick={() => navigate('/dashboard/workspace')}
                className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Enter Chatroom</span>
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>

            {clients.length === 0 ? (
              <p className="text-center py-6 text-xs text-[#8C8C8C]">
                You do not have any assigned clients at this moment. Contact platform administrators.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clients.map(c => (
                  <div key={c._id} className="p-4 bg-[#111] border border-[#1C1C1C] rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs text-cream font-bold">{c.businessName}</h4>
                      <p className="text-[10px] text-[#8C8C8C] mt-0.5 capitalize">{c.businessType} sector</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#1C1C1C] pt-3 mt-4 text-[10px] text-[#60A5FA]">
                      <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-mono">
                        Scale: {c.businessScale}
                      </span>
                      <span>Plan: {c.plan.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advice bulletins history */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-cream tracking-wider uppercase mb-5 border-b border-[#111] pb-3">
              Published Advisory Logs
            </h3>

            {advices.length === 0 ? (
              <p className="text-center py-6 text-xs text-[#8C8C8C]">
                No business recommendations published yet.
              </p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {advices.map(a => (
                  <div key={a._id} className="p-4 bg-[#111]/30 border border-[#1C1C1C] rounded-2xl flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] text-primary font-bold capitalize">To: {a.userId?.businessName || 'Client'}</p>
                      <p className="text-xs text-cream leading-relaxed font-medium">
                        {a.message}
                      </p>
                      <p className="text-[9px] text-[#555] font-mono">
                        Posted on: {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAdvice(a._id)}
                      className="p-1.5 bg-[#141414] hover:bg-red-950/20 border border-[#222] hover:border-red-900/30 text-[#8C8C8C] hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Publish advice bulletin and quick meetings roster */}
        <div className="space-y-6">
          {/* Advice Posting Form */}
          {clients.length > 0 && (
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-cream tracking-wider uppercase mb-5 pb-3 border-b border-[#1A1A1A] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-primary" />
                Publish Bulletins
              </h3>

              <form onSubmit={handlePostAdvice} className="space-y-4">
                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Select Target Client
                  </label>
                  <select
                    value={targetClientId}
                    onChange={(e) => setTargetClientId(e.target.value)}
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 text-xs text-cream outline-none focus:border-primary cursor-pointer"
                  >
                    {clients.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.businessName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Diagnostic Bulletin
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={adviceMessage}
                    onChange={(e) => setAdviceMessage(e.target.value)}
                    placeholder="Provide localized B2B advice, warning signals, or growth recommendations..."
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream outline-none focus:border-primary resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAdvice || !adviceMessage.trim()}
                  className="w-full py-3.5 bg-primary hover:bg-[#1A1A1A] border border-primary text-xs font-bold text-cream rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-default"
                >
                  {isSubmittingAdvice ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Publish to Dashboard</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Quick Schedule meetings deck */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5 border-b border-[#1A1A1A] pb-3">
              <h3 className="text-sm font-bold text-cream tracking-wider uppercase">
                Sessions Calendar
              </h3>
              <button 
                onClick={() => navigate('/dashboard/expert-calendar')}
                className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Big Scheduler</span>
                <Calendar className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingMeetings.length === 0 ? (
              <p className="text-center py-6 text-xs text-[#8C8C8C]">
                No upcoming consultation sessions booked.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.slice(0, 3).map(m => (
                  <div key={m._id} className="p-3.5 bg-[#111] border border-[#1C1C1C] rounded-xl">
                    <p className="text-xs text-cream font-bold capitalize">{m.title}</p>
                    <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-wider">{m.type.replace('_', ' ')}</p>
                    <div className="flex items-center justify-between mt-3 text-[10px] text-[#8C8C8C]">
                      <span>Client: {m.clientId?.businessName}</span>
                      <span>{new Date(m.scheduledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
