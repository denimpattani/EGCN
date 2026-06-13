import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  Video, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  Loader, 
  AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ExpertCalendar() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState('video'); // 'video' | 'site_visit'

  const fetchMeetingsData = async () => {
    try {
      setIsLoading(true);
      const [meetingsRes, clientsRes] = await Promise.all([
        api.get('/expert/meetings'),
        api.get('/expert/clients')
      ]);
      setMeetings(meetingsRes.data.data);
      setClients(clientsRes.data.data);

      if (clientsRes.data.data.length > 0) {
        setClientId(clientsRes.data.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to load consultation calendar bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingsData();
  }, []);

  const openBookingModal = () => {
    setTitle('');
    setDescription('');
    setScheduledAt('');
    setDuration(60);
    setType('video');
    if (clients.length > 0) {
      setClientId(clients[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      clientId,
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      duration: Number(duration),
      type,
    };

    try {
      await api.post('/expert/meetings', payload);
      setIsModalOpen(false);
      fetchMeetingsData();
      alert('Consultation meeting scheduled successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book consultation session');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/expert/meetings/${id}`, { status });
      fetchMeetingsData();
    } catch (error) {
      alert('Failed to update meeting status');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* Header and Booking CTA */}
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
              Advisory Sessions Calendar
            </h1>
            <p className="text-xs text-[#8C8C8C]">
              Schedule face-to-face video consultation calls or physical site visits with assigned clients.
            </p>
          </div>
        </div>

        {clients.length > 0 && (
          <button
            onClick={openBookingModal}
            className="px-5 py-3 bg-primary hover:bg-[#1A1A1A] border border-primary text-xs font-bold text-cream rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns: Booked Appointments Roster */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-cream tracking-wider uppercase mb-2">
              Booked Consultations Directory
            </h3>

            {meetings.length === 0 ? (
              <div className="text-center py-12 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl text-xs text-[#8C8C8C]">
                No consultation appointments booked yet.
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((m) => {
                  const isUpcoming = new Date(m.scheduledAt) > new Date();
                  const isSiteVisit = m.type === 'site_visit';

                  return (
                    <div 
                      key={m._id}
                      className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex gap-4">
                        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                          isSiteVisit 
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                            : 'bg-primary/10 border-primary/20 text-primary'
                        }`}>
                          {isSiteVisit ? <MapPin className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-cream capitalize">{m.title}</h4>
                          <p className="text-[10px] text-[#8C8C8C] leading-normal">{m.description || 'No summary text provided.'}</p>
                          
                          <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-[#8C8C8C]">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              <span className="font-semibold text-cream capitalize">{m.clientId?.businessName}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{new Date(m.scheduledAt).toLocaleString()} ({m.duration} mins)</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Action Buttons */}
                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 border-t border-[#111] pt-3 sm:border-t-0 sm:pt-0">
                        {m.status === 'scheduled' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(m._id, 'completed')}
                              className="p-2 bg-[#111] hover:bg-green-950/20 border border-[#222] hover:border-green-900/30 text-green-500 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                              title="Mark as Completed"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(m._id, 'cancelled')}
                              className="p-2 bg-[#111] hover:bg-red-950/20 border border-[#222] hover:border-red-900/30 text-red-500 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                              title="Cancel Session"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 border rounded-full ${
                            m.status === 'completed' 
                              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                              : 'bg-[#151515] border-[#252525] text-[#555]'
                          }`}>
                            {m.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Roster of Assigned Clients */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl h-fit">
            <h3 className="text-sm font-bold text-cream tracking-wider uppercase mb-4 pb-3 border-b border-[#1A1A1A]">
              Roster client directory
            </h3>

            {clients.length === 0 ? (
              <p className="text-xs text-[#8C8C8C] py-4 text-center">
                Contact Admin to associate client business accounts.
              </p>
            ) : (
              <div className="space-y-3">
                {clients.map(c => (
                  <div key={c._id} className="p-3.5 bg-[#111]/45 border border-[#181818] rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-cream font-bold capitalize">{c.businessName}</p>
                      <p className="text-[10px] text-[#8C8C8C] mt-0.5 capitalize">{c.businessType} sector</p>
                    </div>
                    <span className="text-[9px] text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded uppercase font-bold">
                      {c.plan}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Form Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-sm rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-[#8C8C8C] hover:text-cream cursor-pointer"
              >
                <AlertTriangle className="w-5 h-5 text-[#333]" />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-cream">Schedule Session</h3>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Choose Client
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 text-xs text-cream outline-none focus:border-primary cursor-pointer"
                  >
                    {clients.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.businessName} ({c.plan.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Session Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q3 Growth Strategy Review"
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 text-xs text-cream outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide meeting summary details..."
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                      Duration (Mins)
                    </label>
                    <input
                      type="number"
                      required
                      min="15"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-xs text-cream focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mb-1.5 block">
                    Session Format
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 text-xs text-cream outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="video">Secure Video Call (PeerJS RTC)</option>
                    <option value="site_visit">Physical On-Site Advisory Visit</option>
                  </select>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#151515]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-transparent border border-[#222] text-xs font-bold text-[#8C8C8C] hover:text-cream rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-[#1A1A1A] border border-primary text-xs font-bold text-cream rounded-xl transition-colors active:scale-95 cursor-pointer"
                  >
                    Book Session
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
