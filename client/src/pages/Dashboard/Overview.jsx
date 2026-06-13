import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, CreditCard, FileText, Target, Activity, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDashboardSummary } from '../../store/dashboardSlice';
import { fetchDailyHistory, fetchMonthlyTarget } from '../../store/targetSlice';
import AdminDashboard from '../Admin/index.jsx';
import ExpertDashboard from '../Expert/index.jsx';

const StatCard = ({ title, value, icon: Icon, type, delay }) => {
  const isOverall = type === 'overall';
  const themeColor = isOverall ? 'text-[#4ade80]' : 'text-primary';
  const themeBg = isOverall ? 'bg-[#4ade80]/10' : 'bg-primary/10';
  const themeBorder = isOverall ? 'group-hover:border-[#4ade80]/30' : 'group-hover:border-primary/30';
  const themeGlow = isOverall ? 'from-[#4ade80]/5' : 'from-primary/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-[#0A0A0A] border border-[#1F1F1F] p-6 rounded-2xl relative overflow-hidden group transition-colors ${themeBorder}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${themeGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-[#8C8C8C] text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-cream">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center border border-[#1F1F1F] transition-colors`}>
          <Icon className={`w-5 h-5 ${themeColor}`} />
        </div>
      </div>

      <div className="mt-4 relative z-10 flex items-center gap-2">
        <span className={`text-xs font-bold ${themeBg} ${themeColor} px-2 py-1 rounded-md uppercase`}>
          {isOverall ? 'All Time' : 'Today'}
        </span>
      </div>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111]/95 backdrop-blur-md border border-[#1F1F1F] p-4 rounded-xl shadow-2xl">
        <p className="text-[#8C8C8C] text-xs font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.stroke || entry.color }} className="text-sm font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke || entry.color }} />
            {entry.name}: ₹{entry.value?.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { summary, isLoading } = useSelector((state) => state.dashboard);
  const { history = [], monthlyTarget, isHistoryLoading, isMonthlyLoading } = useSelector((state) => state.target);

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (user?.role === 'client') {
      dispatch(fetchDashboardSummary());
      dispatch(fetchDailyHistory());

      const today = new Date();
      dispatch(fetchMonthlyTarget({ month: today.getMonth() + 1, year: today.getFullYear() }));
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [dispatch, user]);

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'expert') {
    return <ExpertDashboard />;
  }

  const { overall, daily, recentSuggestions = [], adviceFeed = [] } = summary;

  // Format 30-day history trend data
  const historyChartData = (history || []).map(entry => {
    const d = new Date(entry.date);
    return {
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      Sales: entry.sales,
      Target: entry.targetSales || 50000
    };
  });

  // Calculate Monthly target & progress details
  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysRemaining = totalDays - todayDate.getDate();

  const targetSales = monthlyTarget?.target?.targetSales || 0;
  const achievedSales = monthlyTarget?.achievedSales || 0;
  const remainingTarget = Math.max(0, targetSales - achievedSales);
  const dailyNeeded = daysRemaining > 0 ? remainingTarget / daysRemaining : remainingTarget;

  // Best Day
  const last7Days = (history || []).slice(0, 7);
  const bestDayEntry = last7Days.reduce((best, curr) => (curr.sales > (best?.sales || 0) ? curr : best), null);
  const bestDayVal = bestDayEntry ? `₹${bestDayEntry.sales.toLocaleString('en-IN')}` : 'N/A';
  const bestDayLabel = bestDayEntry
    ? new Date(bestDayEntry.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'No logs this week';

  // Avg Sales
  const validEntries = (history || []).filter(e => e.sales > 0);
  const avgDailySales = validEntries.length > 0 ? Math.round(validEntries.reduce((sum, e) => sum + e.sales, 0) / validEntries.length) : 0;
  const avgSalesText = avgDailySales > 0 ? `₹${avgDailySales.toLocaleString('en-IN')}` : 'N/A';

  // Projection
  const projectedEOM = monthlyTarget?.projectedSales ?? 0;
  const projectedSalesText = projectedEOM > 0 ? `₹${projectedEOM.toLocaleString('en-IN')}` : 'N/A';
  const projectionStatus = monthlyTarget?.insufficientDataForProjection
    ? 'Needs 3 daily entries'
    : projectedEOM >= targetSales
      ? 'On track for EOM goal'
      : 'Below target projection';
  const projectionColor = monthlyTarget?.insufficientDataForProjection
    ? 'text-yellow-500'
    : projectedEOM >= targetSales
      ? 'text-[#4ade80]'
      : 'text-primary';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1F1F1F]/40"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-cream mb-2">
            Hi {user?.businessName || user?.username}, {greeting}!
          </h1>
          <p className="text-[#8C8C8C]">
            Here is your executive dashboard.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-lg font-bold text-cream">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-sm font-bold text-primary tracking-wider uppercase">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-8 pt-4"
        >
          {/* Overall Row */}
          <div>
            <h2 className="text-sm font-bold text-[#8C8C8C] uppercase tracking-wider mb-4 pl-1">Overall Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Bills"
                value={overall?.totalBills || 0}
                icon={FileText}
                type="overall"
                delay={0.1}
              />
              <StatCard
                title="Total Sales"
                value={`₹${(overall?.totalSales || 0).toLocaleString('en-IN')}`}
                icon={TrendingUp}
                type="overall"
                delay={0.2}
              />
              <StatCard
                title="Active Plan"
                value={user?.plan?.toUpperCase() || 'FREE'}
                icon={CreditCard}
                type="overall"
                delay={0.3}
              />
            </div>
          </div>

          {/* Daily Row */}
          <div>
            <h2 className="text-sm font-bold text-[#8C8C8C] uppercase tracking-wider mb-4 pl-1">Daily Targets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Today's Bills"
                value={daily?.todayBills || 0}
                icon={FileText}
                type="daily"
                delay={0.4}
              />
              <StatCard
                title="Today's Sales"
                value={`₹${(daily?.todaySales || 0).toLocaleString('en-IN')}`}
                icon={TrendingUp}
                type="daily"
                delay={0.5}
              />
              <StatCard
                title="Target Achieved"
                value={`${daily?.targetAchievedPercent || 0}%`}
                icon={Target}
                type="daily"
                delay={0.6}
              />
            </div>
          </div>

          {/* Main Chart & Monthly Progress Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart: Performance Trend */}
            <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 min-h-[400px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-cream">Performance Trend</h3>
                  <p className="text-xs text-[#8C8C8C]">Daily sales vs targets over the last 30 entries</p>
                </div>
                <Link
                  to="/dashboard/target/analysis"
                  className="text-xs text-primary hover:text-[#ff6358] font-semibold transition-colors flex items-center gap-1"
                >
                  Detailed Analysis &rarr;
                </Link>
              </div>

              <div className="flex-1 min-h-[280px] w-full flex items-center justify-center">
                {isHistoryLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : historyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d74339" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#d74339" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#8C8C8C"
                        tick={{ fill: '#8C8C8C', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={20}
                      />
                      <YAxis
                        stroke="#8C8C8C"
                        tick={{ fill: '#8C8C8C', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `₹${val / 1000}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="Sales"
                        name="Actual Sales"
                        stroke="#d74339"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#salesGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="Target"
                        name="Daily Target"
                        stroke="#4A4A4A"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        fill="none"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-cream font-bold text-base mb-1">No performance data yet</h4>
                    <p className="text-[#8C8C8C] text-xs mb-4">
                      Log your daily sales and target details inside the Daily Input section to start tracking performance.
                    </p>
                    <button
                      onClick={() => navigate('/dashboard/target/daily')}
                      className="px-4 py-2 bg-primary hover:bg-[#b0352c] text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary/20"
                    >
                      Go to Daily Input
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Progress Tracker */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 flex flex-col justify-between min-h-[400px]">
              <div>
                <h3 className="text-lg font-bold text-cream mb-1">Monthly Goal Progress</h3>
                <p className="text-xs text-[#8C8C8C] mb-6">Cumulative goal vs actuals for {todayDate.toLocaleString('default', { month: 'long' })}</p>
              </div>

              {isMonthlyLoading ? (
                <div className="flex items-center justify-center py-12 flex-1">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : monthlyTarget?.target ? (
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#8C8C8C] font-semibold uppercase tracking-wider">Target Met</span>
                    <span className="text-2xl font-bold text-cream">
                      {((achievedSales / targetSales) * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-[#111] h-3 rounded-full border border-[#1F1F1F] overflow-hidden relative">
                    <div
                      className="bg-gradient-to-r from-primary to-[#ff6358] h-full rounded-full transition-all duration-500 shadow-md shadow-primary/20"
                      style={{ width: `${Math.min(100, (achievedSales / targetSales) * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-[#8C8C8C] font-medium">
                    <span>₹{achievedSales.toLocaleString('en-IN')} achieved</span>
                    <span>Goal: ₹{targetSales.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-4 border-t border-[#1F1F1F]/60 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#8C8C8C] tracking-wider">Days Left</p>
                      <p className="text-lg font-bold text-cream mt-0.5">{daysRemaining} days</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#8C8C8C] tracking-wider">Daily Needed</p>
                      <p className="text-lg font-bold text-[#4ade80] mt-0.5">
                        ₹{Math.round(dailyNeeded).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 flex-1 flex items-center justify-center">
                  <p className="text-[#8C8C8C] text-sm leading-relaxed">
                    No active target configured for this month.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lower Section: Recent Logs Table & Actions/Suggestions Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Recent Daily Logs */}
            <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 flex flex-col justify-between min-h-[380px]">
              <div>
                <h3 className="text-lg font-bold text-cream mb-1">Recent Daily Logs</h3>
                <p className="text-xs text-[#8C8C8C] mb-6">Your latest logged sales activity and targets</p>
              </div>

              <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
                {isHistoryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : history.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#1F1F1F] text-[#8C8C8C] font-semibold text-xs uppercase tracking-wider pb-2">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Bills</th>
                        <th className="pb-3">Sales</th>
                        <th className="pb-3">Daily Target</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F]/40">
                      {history.slice(0, 4).map((entry, idx) => {
                        const d = new Date(entry.date);
                        const dateFormatted = d.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        });
                        const hasTarget = entry.targetSales > 0;
                        const metGoal = hasTarget ? entry.sales >= entry.targetSales : false;
                        const pct = hasTarget ? (entry.sales / entry.targetSales) * 100 : 0;

                        return (
                          <tr key={entry.id || idx} className="hover:bg-[#111111]/30 transition-colors">
                            <td className="py-3.5 font-medium text-cream">{dateFormatted}</td>
                            <td className="py-3.5 text-cream">{entry.bills}</td>
                            <td className="py-3.5 text-cream">₹{entry.sales.toLocaleString('en-IN')}</td>
                            <td className="py-3.5 text-[#8C8C8C]">
                              {hasTarget ? `₹${entry.targetSales.toLocaleString('en-IN')}` : 'N/A'}
                            </td>
                            <td className="py-3.5 text-right">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${!hasTarget
                                  ? 'bg-[#1F1F1F] text-[#8C8C8C] border-transparent'
                                  : metGoal
                                    ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20'
                                    : 'bg-primary/10 text-primary border-primary/20'
                                  }`}
                              >
                                {!hasTarget ? 'No Target' : metGoal ? 'Goal Met' : `${pct.toFixed(0)}% Achieved`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-[#8C8C8C] text-sm">
                    No entries logged yet.
                  </div>
                )}
              </div>
            </div>

            {/* Right Stack: Quick Actions & Recent Suggestions */}
            <div className="space-y-6 flex flex-col justify-between">
              {/* Quick Actions Panel */}
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 flex flex-col justify-between h-[135px]">
                <div>
                  <h3 className="text-sm font-bold text-[#8C8C8C] uppercase tracking-wider mb-2">Quick Actions</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/dashboard/target/daily')}
                    className="py-2.5 bg-primary hover:bg-[#b0352c] text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary/15 flex flex-col items-center justify-center gap-1.5 text-xs border border-transparent"
                  >
                    <Target className="w-4 h-4" />
                    Log Today
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/target/monthly')}
                    className="py-2.5 bg-[#111111] hover:bg-[#1A1A1A] text-cream border border-[#1F1F1F] font-bold rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-1.5 text-xs"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Set Targets
                  </button>
                </div>
              </div>

              {/* Expert Advisory Bulletins Feed */}
              {adviceFeed && adviceFeed.length > 0 && (
                <div className="bg-[#0A0A0A] border border-primary/20 rounded-2xl p-6 flex flex-col justify-between min-h-[180px] shadow-xl">
                  <div>
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      Advisor Bulletins
                    </h3>
                    <p className="text-[10px] text-[#8C8C8C] mb-4">Direct business recommendations from your EGCN expert</p>
                  </div>
                  
                  <div className="space-y-3 max-h-[140px] overflow-y-auto scrollbar-hide pr-1">
                    {adviceFeed.map((advice) => (
                      <div key={advice.id} className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex flex-col gap-1">
                        <span className="text-[9px] text-[#8c8c8c] font-bold">
                          {advice.expertName} ({advice.expertise})
                        </span>
                        <p className="text-cream text-xs font-semibold leading-relaxed">
                          {advice.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions Box */}
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 flex flex-col justify-between flex-1 min-h-[220px]">
                <div>
                  <h3 className="text-sm font-bold text-[#8C8C8C] uppercase tracking-wider mb-1">Recent Suggestions</h3>
                  <p className="text-[11px] text-[#8C8C8C] mb-4">Performance feedback based on actual daily inputs</p>
                </div>

                {recentSuggestions && recentSuggestions.length > 0 ? (
                  <div className="flex-1 overflow-y-auto space-y-3 max-h-[160px] scrollbar-hide pr-1">
                    {recentSuggestions.slice(0, 2).map((item, idx) => {
                      const itemDate = new Date(item.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      });
                      const isSuccessful = item.achievedPct >= 100;
                      const isWarning = item.achievedPct < 50;
                      const statusBg = isSuccessful
                        ? 'bg-[#4ade80]/10 border-[#4ade80]/20'
                        : isWarning
                          ? 'bg-primary/10 border-primary/20'
                          : 'bg-yellow-500/10 border-yellow-500/20';
                      const statusText = isSuccessful
                        ? 'text-[#4ade80]'
                        : isWarning
                          ? 'text-primary'
                          : 'text-yellow-500';

                      return (
                        <div
                          key={item.id || idx}
                          className="p-3 rounded-lg border border-[#1F1F1F] bg-[#111111]/40 hover:bg-[#111111] transition-all duration-300 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#8C8C8C]">{itemDate}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${statusBg} ${statusText}`}>
                              {item.achievedPct?.toFixed(0)}% Target
                            </span>
                          </div>
                          <p className="text-cream text-xs font-medium leading-relaxed">
                            {item.suggestion}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 opacity-50 py-4">
                    <Activity className="w-8 h-8 text-[#4A4A4A]" />
                    <p className="text-[#8C8C8C] text-xs">No recent activity to show.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
