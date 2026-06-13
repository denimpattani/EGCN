import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, CalendarDays, Activity as ChartIcon, AlertCircle, Loader2 } from 'lucide-react';
import { fetchMonthlyTarget, fetchDailyHistory } from '../../store/targetSlice';
import CustomSelect from '../../components/CustomSelect';

const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] p-4 rounded-xl shadow-xl">
        <p className="text-cream font-bold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: {prefix}{entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TargetAnalysis() {
  const dispatch = useDispatch();
  const { monthlyTarget, history, isMonthlyLoading, isHistoryLoading, error } = useSelector((state) => state.target);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  useEffect(() => {
    dispatch(fetchMonthlyTarget({ month: selectedMonth, year: selectedYear }));
    dispatch(fetchDailyHistory());
  }, [dispatch, selectedMonth, selectedYear]);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = [2025, 2026, 2027];
  const yearOptions = years.map(y => ({ value: y, label: y.toString() }));

  const hasTarget = !!monthlyTarget?.target;
  const target = monthlyTarget?.target;
  const achievedSales = monthlyTarget?.achievedSales ?? 0;
  const achievedBills = monthlyTarget?.achievedBills ?? 0;
  const projectedSales = monthlyTarget?.projectedSales ?? 0;
  const insufficientData = monthlyTarget?.insufficientDataForProjection;

  // Format 30-day history trend data
  const historyChartData = history.map(entry => {
    const d = new Date(entry.date);
    return {
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      Sales: entry.sales,
      Target: entry.targetSales || 50000
    };
  });

  const cumulativeTrend = monthlyTarget?.projectionTrend ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4">
      {/* Header Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1F1F1F]/40"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-cream mb-2 flex items-center gap-2">
            <ChartIcon className="w-8 h-8 text-primary" /> Target Analysis
          </h1>
          <p className="text-[#8C8C8C]">Compare 30-day performance trends and monthly cumulative projections.</p>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <CustomSelect
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={months}
            size="sm"
            containerClassName="w-36"
          />
          <CustomSelect
            value={selectedYear}
            onChange={setSelectedYear}
            options={yearOptions}
            size="sm"
            containerClassName="w-28"
          />
        </div>
      </motion.div>

      {isMonthlyLoading || isHistoryLoading ? (
        <div className="flex flex-col items-center justify-center h-80">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-[#8C8C8C] text-sm">Loading target analytics...</p>
        </div>
      ) : !hasTarget ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-[#1F1F1F] border-dashed rounded-[2rem] p-12 text-center max-w-lg mx-auto bg-[#0A0A0A]/50 mt-12 flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-cream font-display">Target Required</h3>
          <p className="text-[#8C8C8C] text-sm leading-relaxed">
            Please configure a Monthly Target first to view analytical trend charts and projections.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6">
              <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Monthly Goal Sales</p>
              <h3 className="text-2xl font-bold text-cream">₹{target.targetSales.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-[#8C8C8C] mt-2">Required Daily: ₹{target.requiredDaily.sales.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6">
              <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Monthly Achieved Sales</p>
              <h3 className="text-2xl font-bold text-[#4ade80]">₹{achievedSales.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-[#8C8C8C] mt-2">Remaining Goal: ₹{Math.max(0, target.targetSales - achievedSales).toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6">
              <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Projected End of Month</p>
              <h3 className="text-2xl font-bold text-cream">
                {insufficientData ? 'N/A' : `₹${projectedSales.toLocaleString('en-IN')}`}
              </h3>
              {insufficientData ? (
                <p className="text-xs text-yellow-500/80 flex items-center gap-1.5 mt-2 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Requires at least 3 daily entries.
                </p>
              ) : (
                <p className={`text-xs font-semibold mt-2 ${projectedSales >= target.targetSales ? 'text-[#4ade80]' : 'text-primary'}`}>
                  {projectedSales >= target.targetSales ? '📈 On track to hit monthly goal!' : '📉 Under-performing against monthly target.'}
                </p>
              )}
            </div>
          </div>

          {/* Charts Rows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Chart 1: 30-Day Trend */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-cream mb-1">30-Day Trend Analysis</h3>
                <p className="text-xs text-[#8C8C8C] mb-6">Historical daily performance logs vs daily targets</p>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                    <XAxis dataKey="date" stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={20} />
                    <YAxis stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Sales" name="Actual Sales" stroke="#d74339" strokeWidth={3} dot={{ fill: '#d74339', r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Target" name="Daily Target" stroke="#4A4A4A" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Cumulative Progress Line */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-cream mb-1">Cumulative Projection Trend</h3>
                <p className="text-xs text-[#8C8C8C] mb-6">Tracking actual cumulative sales against projections and goals</p>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cumulativeTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                    <XAxis dataKey="day" stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="actualSales" name="Actual Cumulative Sales" stroke="#d74339" strokeWidth={3.5} dot={false} />
                    <Line type="linear" dataKey="targetSalesBaseline" name="Target Trendline" stroke="#3A3A3A" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    {!insufficientData && (
                      <Line type="monotone" dataKey="projectedSales" name="Projected Sales Trend" stroke="#d74339" strokeWidth={2} strokeDasharray="6 6" dot={false} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </motion.div>
      )}
    </div>
  );
}
