import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Plus, X, Check, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchMeetings, createMeeting, updateMeetingStatus } from '../../../store/workspaceSlice';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspaceCalendar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { room, meetings } = useSelector((state) => state.workspace);

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDateString, setSelectedDateString] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState('video'); // 'video' | 'site_visit'

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Load meetings
  useEffect(() => {
    dispatch(fetchMeetings());
  }, [dispatch]);

  // Calculate calendar month layout grid
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayIndex = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayIndex(currentYear, currentMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper: check if a specific day has meetings
  const getMeetingsForDay = (day) => {
    return meetings.filter(meet => {
      const meetDate = new Date(meet.scheduledAt);
      return (
        meetDate.getFullYear() === currentYear &&
        meetDate.getMonth() === currentMonth &&
        meetDate.getDate() === day
      );
    });
  };

  // Month click handler
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayClick = (day) => {
    const evs = getMeetingsForDay(day);
    setSelectedDayEvents(evs);
    setSelectedDateString(`${day} ${monthNames[currentMonth]} ${currentYear}`);
  };

  // Schedule meeting submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !meetDate || !meetTime) {
      alert('Please fill in all required fields.');
      return;
    }

    // Site visit gating
    if (type === 'site_visit' && !['pro', 'vip'].includes(user.plan)) {
      alert('Site visit consulting is only available for Pro & VIP subscribers!');
      return;
    }

    setIsSubmitting(true);

    const scheduledAt = new Date(`${meetDate}T${meetTime}`);
    const meetingData = {
      roomId: room.roomId,
      partnerId: room.partner._id,
      title: title.trim(),
      description: description.trim(),
      scheduledAt: scheduledAt.toISOString(),
      duration: parseInt(duration),
      type,
    };

    try {
      await dispatch(createMeeting(meetingData)).unwrap();
      
      // Reset form
      setTitle('');
      setDescription('');
      setMeetDate('');
      setMeetTime('');
      setDuration(60);
      setType('video');
      setShowModal(false);

      // Refresh selection
      const day = new Date(scheduledAt).getDate();
      setTimeout(() => handleDayClick(day), 100);
    } catch (err) {
      alert('Scheduling error: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete/Cancel meeting triggers
  const handleUpdateStatus = (id, status) => {
    dispatch(updateMeetingStatus({ id, status }))
      .unwrap()
      .then(() => {
        // Refresh day view
        setSelectedDayEvents(prev => prev.map(m => m._id === id ? { ...m, status } : m));
      })
      .catch(err => alert('Failed to update: ' + err));
  };

  // Initial load selection (today)
  useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === currentYear && today.getMonth() === currentMonth) {
      handleDayClick(today.getDate());
    } else {
      handleDayClick(1);
    }
  }, [meetings, currentDate]);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-[#0F0F0F] text-cream">
      {/* Left pane: Calendar layout grid */}
      <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[#1F1F1F] flex flex-col">
        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-cream">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="w-9 h-9 bg-[#141414] hover:bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl flex items-center justify-center text-secondary hover:text-cream transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="w-9 h-9 bg-[#141414] hover:bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl flex items-center justify-center text-secondary hover:text-cream transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d} className="text-xs font-bold text-secondary tracking-widest uppercase py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Monthly Grid Grid */}
        <div className="flex-1 grid grid-cols-7 gap-2 min-h-[300px]">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[#141414]/30 rounded-xl border border-transparent" />
          ))}

          {/* Days cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getMeetingsForDay(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === currentMonth &&
              new Date().getFullYear() === currentYear;

            return (
              <button
                key={`day-${day}`}
                onClick={() => handleDayClick(day)}
                className={`relative group bg-[#141414] hover:bg-[#1C1C1C] border rounded-2xl p-2.5 flex flex-col items-start justify-between min-h-[60px] text-left transition-all active:scale-95 cursor-pointer ${
                  isToday ? 'border-primary shadow-lg shadow-primary/5' : 'border-[#1F1F1F]'
                }`}
              >
                <span className={`text-xs font-extrabold ${isToday ? 'text-primary' : 'text-cream'}`}>
                  {day}
                </span>

                {/* Micro Event Indicators */}
                <div className="flex flex-wrap gap-1 mt-1.5 w-full">
                  {dayEvents.slice(0, 3).map(meet => (
                    <div
                      key={meet._id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        meet.status === 'completed'
                          ? 'bg-green-500'
                          : meet.status === 'cancelled'
                          ? 'bg-secondary'
                          : meet.type === 'site_visit'
                          ? 'bg-orange-500'
                          : 'bg-primary'
                      }`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] text-secondary font-bold leading-none">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right pane: Selected Day Events list */}
      <div className="w-full md:w-80 p-6 flex flex-col min-h-0 bg-[#0A0A0A]/40">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-cream">Consulting Sessions</h3>
            <p className="text-xs text-secondary mt-0.5">{selectedDateString || 'Advisory agenda'}</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-9 h-9 bg-primary hover:bg-[#c13a31] rounded-xl flex items-center justify-center text-cream shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Date Meetings Scroll list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
          {selectedDayEvents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <CalendarIcon className="w-10 h-10 text-[#1F1F1F] mb-2" />
              <p className="text-xs text-secondary">No calls scheduled for this date</p>
            </div>
          ) : (
            selectedDayEvents.map(meet => (
              <div
                key={meet._id}
                className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-4 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                      meet.status === 'completed'
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : meet.status === 'cancelled'
                        ? 'bg-[#1F1F1F] text-[#8C8C8C]'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}
                  >
                    {meet.status}
                  </span>
                  
                  {/* Event Type Icon */}
                  {meet.type === 'video' ? (
                    <Video className="w-4 h-4 text-primary" />
                  ) : (
                    <MapPin className="w-4 h-4 text-orange-500" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-cream truncate pr-4">{meet.title}</h4>
                  {meet.description && (
                    <p className="text-xs text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {meet.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-secondary border-t border-[#1F1F1F]/60 pt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(meet.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({meet.duration}m)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {meet.type === 'video' ? (
                      <>
                        <Video className="w-3.5 h-3.5" />
                        <span className="text-primary truncate max-w-[150px]">Secure P2P WebRTC Call</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span className="truncate max-w-[150px]">Advisory Site Visit</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status action buttons */}
                {meet.status === 'scheduled' && (
                  <div className="flex gap-2 border-t border-[#1F1F1F]/60 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleUpdateStatus(meet._id, 'completed')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(meet._id, 'cancelled')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#252525] text-[#8C8C8C] hover:text-cream text-xs font-bold transition-all cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interactive Schedule Meeting Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-[#1F1F1F] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-[#8C8C8C] hover:text-cream transition-colors p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-cream mb-2">Schedule Consulting Session</h2>
              <p className="text-xs text-secondary mb-6">Arrange a video conference or local site visit with your consultant.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                    Topic / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q2 Sales Target Review"
                    className="w-full bg-[#1A1A1A] border border-[#252525] hover:border-[#353535] focus:border-primary/50 text-cream px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief agenda or consultation notes..."
                    rows={3}
                    className="w-full bg-[#1A1A1A] border border-[#252525] hover:border-[#353535] focus:border-primary/50 text-cream px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={meetDate}
                      onChange={(e) => setMeetDate(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#252525] text-cream px-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={meetTime}
                      onChange={(e) => setMeetTime(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#252525] text-cream px-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                      Duration (Mins)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#252525] text-cream px-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={60}>60 Minutes</option>
                      <option value={90}>90 Minutes</option>
                      <option value={120}>120 Minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                      Meeting Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#252525] text-cream px-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                    >
                      <option value="video">Video Call (Standard)</option>
                      <option value="site_visit">Site Visit (Pro/VIP)</option>
                    </select>
                  </div>
                </div>

                {type === 'site_visit' && !['pro', 'vip'].includes(user.plan) && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-primary">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>Advisory Site Visits are restricted to Pro & VIP plan tiers. Please select Video Call or upgrade.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || (type === 'site_visit' && !['pro', 'vip'].includes(user.plan))}
                  className="w-full bg-primary hover:bg-[#c13a31] disabled:bg-[#1A1A1A] disabled:text-secondary text-cream py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 cursor-pointer mt-4"
                >
                  {isSubmitting ? 'Scheduling call...' : 'Schedule Call'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
