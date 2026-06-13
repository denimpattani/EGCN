import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, CalendarDays, Activity, Loader2, CheckCircle2, Save, Plus, AlertCircle, X, Percent, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from 'recharts';
import { submitMonthlyTarget, fetchMonthlyTarget, clearTargetError } from '../../store/targetSlice';
import CustomSelect from '../../components/CustomSelect';

const COLORS = ['#d74339', '#1A1A1A']; // Primary red vs dark surface

const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] p-4 rounded-xl shadow-xl">
        <p className="text-cream font-bold mb-2">Day {label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: {prefix}{entry.value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MonthlyTarget() {
  const dispatch = useDispatch();
  const { monthlyTarget, isMonthlyLoading, error } = useSelector((state) => state.target);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetBills, setTargetBills] = useState('');
  const [targetSales, setTargetSales] = useState('');
  const [workingDays, setWorkingDays] = useState('26');
  const [isSuccess, setIsSuccess] = useState(false);

  // Toggle between Sales and Bills charts
  const [chartMode, setChartMode] = useState('sales');

  useEffect(() => {
    dispatch(fetchMonthlyTarget({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  // Set form fields when target changes
  useEffect(() => {
    if (monthlyTarget?.target) {
      setTargetBills(monthlyTarget.target.targetBills.toString());
      setTargetSales(monthlyTarget.target.targetSales.toString());
      setWorkingDays(monthlyTarget.target.workingDays.toString());
    } else {
      setTargetBills('');
      setTargetSales('');
      setWorkingDays('26');
    }
  }, [monthlyTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearTargetError());

    const resultAction = await dispatch(submitMonthlyTarget({
      targetBills: Number(targetBills),
      targetSales: Number(targetSales),
      workingDays: Number(workingDays),
      month: selectedMonth,
      year: selectedYear
    }));

    if (submitMonthlyTarget.fulfilled.match(resultAction)) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
      }, 1500);
      dispatch(fetchMonthlyTarget({ month: selectedMonth, year: selectedYear }));
    }
  };

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

  // Helper values
  const hasTarget = !!monthlyTarget?.target;
  const target = monthlyTarget?.target;
  const achievedSales = monthlyTarget?.achievedSales || 0;
  const achievedBills = monthlyTarget?.achievedBills || 0;
  const projectedSales = monthlyTarget?.projectedSales || 0;
  const projectedBills = monthlyTarget?.projectedBills || 0;
  const insufficientData = monthlyTarget?.insufficientDataForProjection;

  // Donut chart logic
  const remainingSales = target ? Math.max(0, target.targetSales - achievedSales) : 0;
  const salesProgressPct = target ? Math.min(100, Math.round((achievedSales / target.targetSales) * 100)) : 0;

  const donutData = [
    { name: 'Achieved Sales', value: achievedSales },
    { name: 'Remaining Sales', value: remainingSales }
  ];

  const isProjectedOnTrack = target && projectedSales >= target.targetSales;

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
          <h1 className="text-3xl font-bold font-display text-cream mb-2">Monthly Analysis</h1>
          <p className="text-[#8C8C8C]">Set monthly goals, view regressions, and track cashflow targets.</p>
        </div>

        {/* Date Filter & Control */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 self-start md:self-end w-full md:w-auto">
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-cream px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-primary/10"
          >
            <Plus className="w-4 h-4" /> {hasTarget ? 'Update Goal' : 'Set Goal'}
          </button>
        </div>
      </motion.div>

      {isMonthlyLoading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-[#8C8C8C] text-sm">Aggregating Monthly Targets...</p>
        </div>
      ) : !hasTarget ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-[#1F1F1F] border-dashed rounded-[2rem] p-12 text-center max-w-lg mx-auto bg-[#0A0A0A]/50 mt-12 flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-cream font-display">No Target Configured</h3>
          <p className="text-[#8C8C8C] text-sm leading-relaxed">
            You haven't configured a monthly bills and sales goal for {months.find(m => m.value === selectedMonth)?.label} {selectedYear} yet.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-cream px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-primary/15 mt-2"
          >
            Set Goal Now
          </button>
        </motion.div>
      ) : (
        /* Dashboard Content */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >

          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Achieved Card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Monthly Progress</p>
                  <h3 className="text-2xl font-bold text-cream">₹{achievedSales.toLocaleString()}</h3>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Percent className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#8C8C8C] font-semibold">
                  <span>Target: ₹{target.targetSales.toLocaleString()}</span>
                  <span>{salesProgressPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${salesProgressPct}%` }} />
                </div>
              </div>
            </div>

            {/* Remaining Card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Remaining Target</p>
                  <h3 className="text-2xl font-bold text-cream">₹{remainingSales.toLocaleString()}</h3>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-[#8C8C8C]">
                {achievedSales >= target.targetSales
                  ? '🏆 Monthly target achieved!'
                  : `Requires ₹${Math.round(remainingSales / Math.max(1, target.workingDays)).toLocaleString()} daily sales average.`}
              </p>
            </div>

            {/* Projection Card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Projected End of Month</p>
                  <h3 className="text-2xl font-bold text-cream">
                    {insufficientData ? 'N/A' : `₹${projectedSales.toLocaleString()}`}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                {insufficientData ? (
                  <p className="text-xs text-yellow-500/80 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Requires at least 3 daily entries.
                  </p>
                ) : (
                  <p className={`text-xs font-semibold ${isProjectedOnTrack ? 'text-[#4ade80]' : 'text-primary'}`}>
                    {isProjectedOnTrack
                      ? '📈 On track to hit monthly goal!'
                      : `📉 Under-performing (Target: ₹${target.targetSales.toLocaleString()})`}
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Charts Rows */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Chart 1: Daily Comparison */}
            <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-cream">Daily Target Comparison</h3>
                  <p className="text-xs text-[#8C8C8C]">Compare actual results against required daily values</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartMode('sales')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'sales' ? 'bg-primary text-cream' : 'bg-[#111] text-[#8C8C8C] hover:text-cream'
                      }`}
                  >
                    Sales
                  </button>
                  <button
                    onClick={() => setChartMode('bills')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'bills' ? 'bg-primary text-cream' : 'bg-[#111] text-[#8C8C8C] hover:text-cream'
                      }`}
                  >
                    Bills
                  </button>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTarget.dailyComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                    <XAxis dataKey="day" stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => chartMode === 'sales' ? `₹${val / 1000}k` : val} />
                    <Tooltip content={<CustomTooltip prefix={chartMode === 'sales' ? '₹' : ''} />} cursor={{ fill: '#151515' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                    <Bar name={chartMode === 'sales' ? 'Actual Sales' : 'Actual Bills'} dataKey={chartMode === 'sales' ? 'actualSales' : 'actualBills'} fill="#d74339" radius={[3, 3, 0, 0]} maxBarSize={20} />
                    <Bar name={chartMode === 'sales' ? 'Required Sales' : 'Required Bills'} dataKey={chartMode === 'sales' ? 'requiredSales' : 'requiredBills'} fill="#2A2A2A" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Monthly Progress */}
            <div className="lg:col-span-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-xl flex flex-col">
              <h3 className="text-lg font-bold text-cream mb-2">Target Breakdown</h3>
              <p className="text-xs text-[#8C8C8C] mb-8">Achieved sales vs target gap</p>

              <div className="flex-1 flex justify-center items-center relative min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell fill="#d74339" />
                      <Cell fill="#1a1a1a" stroke="#222" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Percentage */}
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <span className="text-3xl font-extrabold text-cream font-display">{salesProgressPct}%</span>
                  <span className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-widest mt-1">Achieved</span>
                </div>
              </div>

              <div className="space-y-3 mt-6 pt-4 border-t border-[#1F1F1F]">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-[#8C8C8C]">Achieved Sales</span>
                  </div>
                  <span className="text-cream font-semibold">₹{achievedSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-[#222]" />
                    <span className="text-[#8C8C8C]">Remaining Target</span>
                  </div>
                  <span className="text-cream font-semibold">₹{remainingSales.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Chart 3: Cumulative Performance & Projections */}
          <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-xl">
            <div>
              <h3 className="text-lg font-bold text-cream mb-1">Cumulative Sales Projection Trend</h3>
              <p className="text-xs text-[#8C8C8C] mb-6">Compare actual cumulative sales against projections and targets</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={monthlyTarget.projectionTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                  <XAxis dataKey="day" stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                  {/* Baseline Target Line */}
                  <Line type="linear" dataKey={chartMode === 'sales' ? 'targetSalesBaseline' : 'targetBillsBaseline'} name="Target Trendline" stroke="#3A3A3A" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  {/* Actual Cumulative Line */}
                  <Line type="monotone" dataKey={chartMode === 'sales' ? 'actualSales' : 'actualBills'} name={chartMode === 'sales' ? 'Actual Cumulative Sales' : 'Actual Cumulative Bills'} stroke="#d74339" strokeWidth={3.5} dot={{ fill: '#d74339', r: 3 }} activeDot={{ r: 5 }} />
                  {/* Projected Regression Line */}
                  {!insufficientData && (
                    <Line type="monotone" dataKey={chartMode === 'sales' ? 'projectedSales' : 'projectedBills'} name={chartMode === 'sales' ? 'Projected Sales Trend' : 'Projected Bills Trend'} stroke="#d74339" strokeWidth={2} strokeDasharray="6 6" dot={false} />
                  )}
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </motion.div>
      )}

      {/* Goal Setting Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#000]"
              onClick={() => !isMonthlyLoading && setIsModalOpen(false)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] w-full max-w-md p-8 relative z-10 shadow-2xl flex flex-col"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-[#8C8C8C] hover:text-cream transition-colors"
                disabled={isMonthlyLoading}
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-cream font-display mb-2">
                Configure Monthly Goal
              </h3>
              <p className="text-xs text-[#8C8C8C] mb-6">
                Goal setting for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[#8C8C8C] mb-1.5 ml-1">Monthly Target Sales (INR)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#4A4A4A] font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={targetSales}
                      onChange={(e) => setTargetSales(e.target.value)}
                      className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl pl-9 pr-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                      placeholder="e.g. 150000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C8C8C] mb-1.5 ml-1">Monthly Target Bills</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#4A4A4A] pointer-events-none">
                      <FileText className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={targetBills}
                      onChange={(e) => setTargetBills(e.target.value)}
                      className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl pl-11 pr-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                      placeholder="e.g. 600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C8C8C] mb-1.5 ml-1">Working Days</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(e.target.value)}
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                    placeholder="e.g. 26"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-primary p-4 rounded-xl text-xs text-center font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isMonthlyLoading}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${isSuccess
                    ? 'bg-[#4ade80] text-[#0A0A0A] shadow-[0_0_20px_-5px_rgba(74,222,128,0.4)]'
                    : 'bg-primary text-cream hover:bg-primary-hover shadow-lg shadow-primary/20'
                    }`}
                >
                  {isMonthlyLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Goal...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Monthly Goal
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
