import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Calendar,
  Plus,
  BookOpen,
  Loader
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to retrieve platform stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Monthly Recurring Revenue',
      value: `₹${stats?.mrr?.toLocaleString() || 0}`,
      subtitle: 'From active paid subscriptions',
      icon: DollarSign,
      color: '#3B82F6',
    },
    {
      title: 'Total Active Clients',
      value: stats?.totalUsers || 0,
      subtitle: 'Registered business accounts',
      icon: Users,
      color: '#60A5FA',
    },
    {
      title: 'Consulting Expert Roster',
      value: stats?.totalExperts || 0,
      subtitle: 'EGCN certified professionals',
      icon: Briefcase,
      color: '#34D399',
    },
    {
      title: 'Active Premium Seals',
      value: stats?.activeSubscriptionsCount || 0,
      subtitle: 'Billed subscription accounts',
      icon: ShieldCheck,
      color: '#FBBF24',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12"
    >
      {/* Executive Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0A0A0A] border border-[#1A1A1A] p-8 md:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] text-primary font-extrabold tracking-widest uppercase border border-primary/20 px-3 py-1 rounded-full bg-primary/5">
            EXECUTIVE CONTROL CONSOLE
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-cream mt-4">
            Platform <span className="text-primary">Overview</span>
          </h1>
          <p className="text-[#8C8C8C] text-sm md:text-base mt-3 leading-relaxed">
            Welcome to the EGCN Administrator Portal. Manage consulting plan pricing matrices, onboard professional advisors, link client accounts, and audit operational MRR metrics.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <TrendingUp className="w-80 h-80 text-primary" />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#8C8C8C] font-semibold uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${card.color}15`,
                    borderColor: `${card.color}30`,
                    color: card.color
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-cream tracking-tight mb-1">
                  {card.value}
                </h3>
                <p className="text-[11px] text-[#8C8C8C]">
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Administrative Control Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Action Navigation Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold font-display text-cream tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-primary rounded-full" />
            ADMINISTRATIVE ACTIONS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* User overrides management card */}
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] hover:border-primary/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between group transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-cream mb-2">User & Plan Registry</h4>
                <p className="text-xs text-[#8C8C8C] leading-relaxed mb-6">
                  Search through the business client directory, manually allocate pricing plan tiers, adjust subscription periods, and link advisory experts.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/users-manager')}
                className="w-full py-3 bg-[#111] hover:bg-primary border border-[#222] hover:border-primary text-xs font-bold text-cream rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 group-hover:translate-y-0"
              >
                <span>Manage Users</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Expert provision management card */}
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] hover:border-primary/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between group transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-cream mb-2">Advisory Expert Profiles</h4>
                <p className="text-xs text-[#8C8C8C] leading-relaxed mb-6">
                  Onboard expert growth advisors by generating custom platform login credentials, setting specialties (Finance, CashFlow, Marketing), and viewing statistics.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/experts-manager')}
                className="w-full py-3 bg-[#111] hover:bg-primary border border-[#222] hover:border-primary text-xs font-bold text-cream rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Provision Advisors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dynamic Plans Pricing CRUD card */}
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] hover:border-primary/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between group transition-all duration-300 sm:col-span-2">
              <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-cream">Subscription Plans Manager</h4>
                    <p className="text-xs text-[#8C8C8C] leading-relaxed">
                      Modify, create, or delete active platform subscription plan matrices dynamically.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard/plans-manager')}
                  className="py-3 px-6 bg-primary hover:bg-[#111] border border-primary text-xs font-bold text-cream rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 self-start md:self-auto"
                >
                  <span>Build Plans</span>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Dynamic Subscription Active Breakdown list */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-sm font-bold text-cream tracking-wider uppercase mb-5 pb-3 border-b border-[#1A1A1A]">
            Plans Active Split
          </h3>

          <div className="space-y-4">
            {Object.entries(stats?.planBreakdown || {}).map(([planName, count]) => {
              // Custom layout badges
              const accents = {
                free: '#8C8C8C',
                business: '#3B82F6',
                pro: '#d74339',
                vip: '#D4AF37'
              };
              const color = accents[planName.toLowerCase()] || '#10B981';

              return (
                <div key={planName} className="flex items-center justify-between p-3 bg-[#111] rounded-xl border border-[#151515]">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-cream capitalize font-medium">
                      {planName} Tier
                    </span>
                  </div>
                  <span className="text-xs text-secondary bg-[#1A1A1A] border border-[#222] px-2.5 py-1 rounded-lg font-bold">
                    {count} clients
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-5 border-t border-[#1a1a1a] flex items-center justify-between text-[11px] text-[#8C8C8C]">
            <span>Secured Admin Gateway</span>
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
