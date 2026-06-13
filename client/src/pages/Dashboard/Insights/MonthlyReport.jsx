import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FileDown, AlertCircle, BarChart3, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { fetchMonthlyReport } from '../../../store/insightsSlice';
import { exportToPDF } from '../../../utils/pdfExport';
import CustomSelect from '../../../components/CustomSelect';

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] p-4 rounded-xl shadow-xl">
        <p className="text-cream font-bold mb-2">Day {label}</p>
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

export default function MonthlyReport() {
  const dispatch = useDispatch();
  const { monthlyReport, isLoading, error } = useSelector((state) => state.insights);
  const { user } = useSelector((state) => state.auth);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  useEffect(() => {
    dispatch(fetchMonthlyReport({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  const handleExport = () => {
    exportToPDF('monthly-report-container', `monthly-report-${selectedMonth}-${selectedYear}.pdf`);
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

  const monthLabel = months.find(m => m.value === selectedMonth)?.label || 'Current';

  // Aggregate fallbacks
  const target = monthlyReport?.target;
  const totalSales = monthlyReport?.totalSales ?? 0;
  const totalBills = monthlyReport?.totalBills ?? 0;
  const targetSales = monthlyReport?.targetSales ?? 0;
  const targetBills = monthlyReport?.targetBills ?? 0;
  const workingDays = monthlyReport?.workingDays ?? 26;
  const salesProgressPct = monthlyReport?.salesProgressPct ?? 0;
  const billsProgressPct = monthlyReport?.billsProgressPct ?? 0;
  const averageDailySales = monthlyReport?.averageDailySales ?? 0;
  const averageDailyBills = monthlyReport?.averageDailyBills ?? 0;
  const dailyListings = monthlyReport?.dailyListings ?? [];

  // Generate cumulative dataset for Line Chart
  const cumulativeData = [];
  let cumSales = 0;
  let cumTarget = 0;

  dailyListings.forEach(day => {
    cumSales += day.actualSales;
    cumTarget += day.requiredSales;
    cumulativeData.push({
      day: day.day,
      actualSales: cumSales,
      targetSales: cumTarget,
    });
  });

  return (
    <div className="space-y-6 pt-4">
      {/* Filters and Control header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]/40 no-pdf-export">
        <div>
          <h1 className="text-3xl font-bold font-display text-cream">Monthly Report</h1>
          <p className="text-[#8C8C8C] text-sm">Aggregated month-level metrics and target analytics.</p>
        </div>

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
          <button
            onClick={handleExport}
            disabled={isLoading || !monthlyReport}
            className="bg-[#111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-cream px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 shadow-md disabled:opacity-50"
          >
            <FileDown className="w-4 h-4 text-primary" /> Export PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#8C8C8C] text-sm">Aggregating Monthly Insights...</p>
        </div>
      ) : error ? (
        <div className="border border-red-500/20 bg-red-500/10 rounded-[2rem] p-8 text-center max-w-lg mx-auto flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-primary" />
          <h3 className="text-lg font-bold text-cream">Failed to Load Report</h3>
          <p className="text-sm text-[#8C8C8C]">{error}</p>
        </div>
      ) : (
        /* Report Wrapper for PDF Capture */
        <motion.div
          id="monthly-report-container"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4 md:p-8 bg-[#050505] rounded-[2rem] border border-[#1F1F1F]/40 space-y-8"
        >

          {/* PDF Report Header */}
          <div className="hidden pdf-only flex justify-between items-center pb-6 border-b border-[#1F1F1F] mb-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-cream">EGCN Monthly Performance Report</h2>
              <p className="text-xs text-[#8C8C8C] mt-1">{monthLabel} {selectedYear}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-cream">{user?.businessName}</p>
              <p className="text-[10px] text-[#8C8C8C] tracking-widest uppercase font-bold">{user?.plan} plan</p>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-cream font-display">Monthly Performance Overview</h3>
              <p className="text-xs text-[#8C8C8C] mt-1">Generated for: {monthLabel} {selectedYear}</p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Sales Card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Monthly Sales</p>
              <h3 className="text-2xl font-bold text-cream">₹{totalSales.toLocaleString('en-IN')}</h3>
              <div className="space-y-1 mt-4 pt-4 border-t border-[#1F1F1F]">
                <div className="flex justify-between text-xs text-[#8C8C8C]">
                  <span>Target: ₹{targetSales.toLocaleString('en-IN')}</span>
                  <span>{salesProgressPct}%</span>
                </div>
                <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${salesProgressPct}%` }} />
                </div>
              </div>
            </div>

            {/* Bills Card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Monthly Bills</p>
              <h3 className="text-2xl font-bold text-cream">{totalBills}</h3>
              <div className="space-y-1 mt-4 pt-4 border-t border-[#1F1F1F]">
                <div className="flex justify-between text-xs text-[#8C8C8C]">
                  <span>Target: {targetBills} Bills</span>
                  <span>{billsProgressPct}%</span>
                </div>
                <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${billsProgressPct}%` }} />
                </div>
              </div>
            </div>

            {/* Avg Daily Sales */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Daily Sales Average</p>
              <h3 className="text-2xl font-bold text-cream">₹{averageDailySales.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-[#8C8C8C] mt-4 pt-4 border-t border-[#1F1F1F]">
                Operating Days: {workingDays} Days
              </p>
            </div>

            {/* Avg Daily Bills */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Daily Bills Average</p>
              <h3 className="text-2xl font-bold text-cream">{averageDailyBills} Bills</h3>
              <p className="text-xs text-[#8C8C8C] mt-4 pt-4 border-t border-[#1F1F1F]">
                Target/Day: {target ? target.requiredDaily.bills : 20} Bills
              </p>
            </div>

          </div>

          {/* Charts block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Chart 1: Daily Comparison Bar */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-cream mb-1">Daily Performance Comparison</h4>
                <p className="text-xs text-[#8C8C8C] mb-4">Actual sales vs daily targets</p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyListings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                    <XAxis dataKey="day" stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip cursor={{ fill: '#151515' }} content={<CustomTooltip prefix="₹" />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                    <Bar name="Actual Sales" dataKey="actualSales" fill="#d74339" radius={[2, 2, 0, 0]} maxBarSize={15} />
                    <Bar name="Target Sales" dataKey="requiredSales" fill="#2A2A2A" radius={[2, 2, 0, 0]} maxBarSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Cumulative Progress Line */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-cream mb-1">Cumulative Sales Trend</h4>
                <p className="text-xs text-[#8C8C8C] mb-4">Tracking target baseline vs cumulative sales</p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cumulativeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                    <XAxis dataKey="day" stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                    <Line type="monotone" name="Cumulative Sales" dataKey="actualSales" stroke="#d74339" strokeWidth={3.5} dot={false} />
                    <Line type="linear" name="Cumulative Target" dataKey="targetSales" stroke="#3A3A3A" strokeWidth={2} strokeDasharray="4 4" dot={false} />
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
