import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, TrendingUp, CalendarDays, Activity, FileBarChart, PieChart, MessagesSquare, LogOut, UserCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { fetchUnreadCount } from '../../store/workspaceSlice';
import { useEffect } from 'react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const unreadCount = useSelector((state) => state.workspace.unreadCount);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/signin');
  };

  const user = useSelector((state) => state.auth.user);
  const role = user?.role || 'client';

  let navGroups = [];

  if (role === 'admin') {
    navGroups = [
      {
        title: '',
        links: [
          { name: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
        ]
      },
      {
        title: 'Platform Control',
        links: [
          { name: 'User & Plan Registry', path: '/dashboard/users-manager', icon: Activity },
          { name: 'Advisory Experts', path: '/dashboard/experts-manager', icon: MessagesSquare },
          { name: 'Plans Builder', path: '/dashboard/plans-manager', icon: PieChart },
        ]
      }
    ];
  } else if (role === 'expert') {
    navGroups = [
      {
        title: '',
        links: [
          { name: 'Advisor Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
        ]
      },
      {
        title: 'Consultations',
        links: [
          { name: 'Client Chatrooms', path: '/dashboard/workspace', icon: MessagesSquare },
          { name: 'Advisory Calendar', path: '/dashboard/expert-calendar', icon: CalendarDays },
        ]
      }
    ];
  } else {
    navGroups = [
      {
        title: '',
        links: [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
          { name: 'My Profile', path: '/dashboard/profile', icon: UserCircle },
        ]
      },
      {
        title: 'Target',
        links: [
          { name: 'Target Analysis', path: '/dashboard/target/analysis', icon: Activity },
          { name: 'Monthly Target', path: '/dashboard/target/monthly', icon: CalendarDays },
          { name: 'Daily Input', path: '/dashboard/target/daily', icon: Target },
        ]
      },
      {
        title: 'Insights',
        links: [
          { name: 'Daily Report', path: '/dashboard/insights/daily', icon: FileBarChart },
          { name: 'Monthly Report', path: '/dashboard/insights/monthly', icon: TrendingUp },
          { name: 'Annual Report', path: '/dashboard/insights/annual', icon: PieChart },
        ]
      },
      {
        title: 'Workspace',
        links: [
          { name: 'Consult Agency', path: '/dashboard/workspace', icon: MessagesSquare },
        ]
      }
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`w-64 bg-[#0A0A0A] h-screen fixed left-0 top-0 flex flex-col pb-6 shadow-2xl z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Right border starting below header */}
        <div className="absolute right-0 top-20 bottom-0 w-[1px] bg-[#1F1F1F]" />

        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-4 mb-6">
          <img src="/egcn-logo.png" alt="EGCN Logo" className="h-12 w-auto object-contain" />
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-[#8C8C8C] hover:text-cream transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {group.title && (
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-3 px-4">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.exact}
                    onClick={() => setIsOpen && setIsOpen(false)}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group ${isActive
                        ? 'text-cream bg-gradient-to-r from-primary/20 to-transparent'
                        : 'text-[#8C8C8C] hover:text-cream hover:bg-[#151515]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Left border indicator for active state */}
                        {isActive && (
                          <motion.div
                            layoutId="activeNavIndicator"
                            className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}

                        {/* Glow behind the icon for active state */}
                        {isActive && (
                          <div className="absolute left-4 w-6 h-6 bg-primary/40 blur-md rounded-full z-0" />
                        )}

                        <div className="relative z-10 flex items-center gap-3 w-full justify-between">
                          <div className="flex items-center gap-3">
                            <link.icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-primary' : 'group-hover:text-cream'}`} />
                            <span className="tracking-wide text-sm">{link.name}</span>
                          </div>
                          {link.path === '/dashboard/workspace' && unreadCount > 0 && (
                            <span className="bg-primary text-cream text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md animate-pulse shrink-0">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Footer */}
        <div className="px-4 mt-auto pt-4 border-t border-[#1F1F1F]">
          <button
            onClick={() => {
              handleLogout();
              setIsOpen && setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#8C8C8C] hover:text-primary hover:bg-primary/10 rounded-xl font-medium transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="tracking-wide text-sm">Sign out</span>
          </button>
        </div>

      </aside>
    </>
  );
}

