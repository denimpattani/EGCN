import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Save, CheckCircle2, Loader2, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { submitDailyEntry, fetchTodayEntry, fetchDailyHistory, clearTargetError, fetchMonthlyTarget } from '../../store/targetSlice';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] p-4 rounded-xl shadow-xl">
        <p className="text-cream font-bold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DailyInput() {
  const dispatch = useDispatch();
  const { todayEntry, history, isLoading, isHistoryLoading, error, monthlyTarget } = useSelector((state) => state.target);
  const { user } = useSelector((state) => state.auth);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [bills, setBills] = useState('');
  const [sales, setSales] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchTodayEntry(selectedDate));
    dispatch(fetchDailyHistory());
    const dateObj = new Date(selectedDate);
    dispatch(fetchMonthlyTarget({ month: dateObj.getMonth() + 1, year: dateObj.getFullYear() }));
  }, [dispatch, selectedDate]);

  useEffect(() => {
    if (todayEntry) {
      setBills(todayEntry.bills.toString());
      setSales(todayEntry.sales.toString());
    } else {
      setBills('');
      setSales('');
    }
  }, [todayEntry]);

  const activeDailySales = monthlyTarget?.target?.requiredDaily?.sales ?? 50000;
  const activeDailyBills = monthlyTarget?.target?.requiredDaily?.bills ?? 20;

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearTargetError());

    const resultAction = await dispatch(submitDailyEntry({
      date: selectedDate,
      bills: Number(bills),
      sales: Number(sales)
    }));

    if (submitDailyEntry.fulfilled.match(resultAction)) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      dispatch(fetchDailyHistory()); // Refresh history charts
    }
  };

  // Prepare data for charts
  const todayChartData = [
    {
      name: 'Bills',
      Actual: Number(bills) || 0,
      Target: todayEntry?.targetBills || activeDailyBills // Fallback mock target
    },
    {
      name: 'Sales (k)',
      Actual: (Number(sales) || 0) / 1000,
      Target: (todayEntry?.targetSales || activeDailySales) / 1000 // Fallback mock target
    }
  ];

  const historyChartData = history.map(entry => {
    const d = new Date(entry.date);
    return {
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      sales: entry.sales,
      target: entry.targetSales || activeDailySales
    };
  });

  // Safe date formatter helper
  const formattedSelectedDate = () => {
    try {
      const dateParts = selectedDate.split('-');
      if (dateParts.length === 3) {
        const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {
      // noop
    }
    return selectedDate;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-cream mb-2">Daily Input</h1>
          <p className="text-[#8C8C8C]">Log your daily performance and track against your monthly targets.</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-3">
          <Target className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider">Required Daily</p>
            <p className="text-sm text-cream font-medium">
              ₹{activeDailySales.toLocaleString('en-IN')} / {activeDailyBills} Bill{activeDailyBills !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Input Form & Suggestion Column */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-xl"
          >
            <h3 className="text-lg font-bold text-cream mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Daily Entry
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-[#8C8C8C] mb-1.5 ml-1">Log Date</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8C8C8C] mb-1.5 ml-1">Total Bills Generated</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={bills}
                  onChange={(e) => setBills(e.target.value)}
                  className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                  placeholder="e.g. 24"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8C8C8C] mb-1.5 ml-1">Total Sales (INR)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-[#4A4A4A] font-bold">₹</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    value={sales}
                    onChange={(e) => setSales(e.target.value)}
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl pl-9 pr-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                    placeholder="e.g. 45000"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <p className="text-primary text-sm font-medium text-center">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${isSuccess
                    ? 'bg-[#4ade80] text-[#0A0A0A] shadow-[0_0_20px_-5px_rgba(74,222,128,0.4)]'
                    : 'bg-primary text-cream hover:bg-primary-hover shadow-lg shadow-primary/20'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Saved!
                  </div>
                ) : (
                  'Submit Daily Entry'
                )}
              </button>
            </form>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {todayEntry?.suggestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-[2rem] p-6 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Daily Insight
                </h4>
                <p className="text-cream font-medium leading-relaxed italic">
                  "{todayEntry.suggestion}"
                </p>
                <div className="mt-4 pt-4 border-t border-[#2A2A2A] flex justify-between items-center">
                  <span className="text-xs text-[#8C8C8C]">Target Achieved:</span>
                  <span className={`text-sm font-bold ${todayEntry.achievedPct >= 100 ? 'text-[#4ade80]' : todayEntry.achievedPct >= 80 ? 'text-[#facc15]' : 'text-primary'}`}>
                    {todayEntry.achievedPct}%
                  </span>
                </div>
                {(!user?.plan || user?.plan === 'free') && (
                  <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                    <Link
                      to="/dashboard/plans"
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-cream text-xs font-bold flex items-center justify-center gap-1 transition-all duration-300 shadow-md"
                    >
                      Upgrade Plan to Access Expert Advisory
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-xl"
          >
            <h3 className="text-lg font-bold text-cream mb-6">Comparison for {formattedSelectedDate()}</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={todayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                  <XAxis dataKey="name" stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#151515' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                  <Bar dataKey="Actual" fill="#d74339" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Target" fill="#2A2A2A" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-xl"
          >
            <h3 className="text-lg font-bold text-cream mb-6">30-Day Trend</h3>
            {isHistoryLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4A4A4A]" />
              </div>
            ) : history.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                    <XAxis dataKey="date" stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={20} />
                    <YAxis stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="sales" name="Actual Sales" stroke="#d74339" strokeWidth={3} dot={{ fill: '#d74339', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#cream' }} />
                    <Line type="monotone" dataKey="target" name="Target Sales" stroke="#4A4A4A" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center border border-dashed border-[#2A2A2A] rounded-xl bg-[#111]">
                <p className="text-[#8C8C8C] text-sm font-medium">No history data available yet.</p>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
