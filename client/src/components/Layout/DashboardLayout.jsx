import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, CheckCheck, X, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import AntiGravityNetwork from '../AntiGravityNetwork';
import AppTour from '../AppTour';
import { logout } from '../../store/authSlice';
import { fetchNotifications, markAsRead, markAllAsRead, addLiveNotification } from '../../store/notificationSlice';
import socketService from '../../services/socket';
import api from '../../services/api';

export default function DashboardLayout() {
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [manualTourRun, setManualTourRun] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    // Fetch initial notifications
    dispatch(fetchNotifications());

    // Socket.io listeners
    socketService.connect();
    socketService.on('new_notification', (notif) => {
      dispatch(addLiveNotification(notif));
      toast.custom((t) => (
        <div className="flex items-start gap-3 p-3 bg-[#1F1F1F] border border-[#333] rounded-lg shadow-xl text-cream max-w-sm">
          <div className="flex-1">
            <h4 className="font-bold text-sm text-primary mb-1">{notif.title}</h4>
            <p className="text-xs text-[#8C8C8C]">{notif.message}</p>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="text-[#8C8C8C] hover:text-cream">
            <X className="w-4 h-4" />
          </button>
        </div>
      ), { duration: 5000 });
    });

    return () => {
      socketService.off('new_notification');
    };
  }, [dispatch]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = (notif) => {
    if (!notif.isRead) {
      dispatch(markAsRead(notif._id));
    }
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      dispatch(logout());
      navigate('/signin');
    }
  };

  return (
    <div className={`theme-${user?.role || 'client'} h-screen bg-[#050505] flex text-cream relative overflow-hidden`}>
      {/* Dashboard Ambience */}
      <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
        <AntiGravityNetwork />
      </div>
      <AppTour manualRun={manualTourRun} onTourEnd={() => setManualTourRun(false)} />
      <div className="fixed top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col relative z-10 h-screen overflow-y-auto">
        {/* Top Navigation */}
        <header className="h-20 bg-[#0A0A0A]/80 backdrop-blur-md fixed top-0 right-0 left-0 md:left-64 z-30 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-[#8C8C8C] hover:text-cream transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold font-display tracking-tight text-cream capitalize hidden sm:block">
              {window.location.pathname.split('/').pop() === 'dashboard' ? 'Dashboard' : window.location.pathname.split('/').pop()}
            </h2>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Take a Tour Button */}
            <button
              onClick={() => setManualTourRun(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 text-sm font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Take a Tour</span>
            </button>

            <div className="flex items-center gap-5" ref={notifRef}>
              <div className="relative">
                <button
                  className="text-[#8C8C8C] hover:text-cream transition-colors duration-300 relative group p-2"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  <Bell className="w-8 h-8" />
                  {unreadCount > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0A0A]"></div>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-14 right-0 w-96 max-h-[500px] bg-[#111111] border border-[#222] rounded-xl shadow-2xl overflow-hidden flex flex-col z-50"
                    >
                      <div className="p-5 border-b border-[#222] flex items-center justify-between bg-[#0A0A0A]">
                        <h3 className="font-bold text-lg text-cream">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => dispatch(markAllAsRead())}
                            className="text-xs text-primary hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <CheckCheck className="w-3 h-3" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                        {(!notifications || notifications.length === 0) ? (
                          <div className="text-center text-[#8C8C8C] py-10 text-base">
                            No notifications yet.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {notifications.map((notif) => (
                              <button
                                key={notif._id}
                                onClick={() => handleNotifClick(notif)}
                                className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 relative ${notif.isRead ? 'hover:bg-[#1A1A1A]' : 'bg-primary/5 hover:bg-primary/10'
                                  }`}
                              >
                                {!notif.isRead && (
                                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                                )}
                                <div className="flex-1 ml-2">
                                  <h4 className={`text-base mb-1 ${notif.isRead ? 'text-cream/80' : 'text-primary font-bold'}`}>
                                    {notif.title}
                                  </h4>
                                  <p className="text-sm text-[#8C8C8C] line-clamp-3">{notif.message}</p>
                                  <span className="text-xs text-[#555] mt-2 inline-block font-medium">
                                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Spacer to push content below fixed header */}
        <div className="h-20 flex-shrink-0" />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
