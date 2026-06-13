import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileDown, Calendar, AlertCircle, Info, FileText, CheckCircle2, DollarSign, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchDailyReport } from '../../../store/insightsSlice';
import { exportToPDF } from '../../../utils/pdfExport';

export default function DailyReport() {
  const dispatch = useDispatch();
  const { dailyReport, isLoading, error } = useSelector((state) => state.insights);
  const { user } = useSelector((state) => state.auth);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  useEffect(() => {
    dispatch(fetchDailyReport(selectedDate));
  }, [dispatch, selectedDate]);

  const handleExport = () => {
    exportToPDF('daily-report-container', `daily-report-${selectedDate}.pdf`);
  };

  const formattedDate = () => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    } catch (e) {
      // noop
    }
    return selectedDate;
  };

  // Safe fallback values
  const entry = dailyReport?.entry;
  const targetSales = dailyReport?.targetSales ?? 50000;
  const targetBills = dailyReport?.targetBills ?? 20;
  const achievedPct = dailyReport?.achievedPct ?? 0;
  const actualSales = entry ? entry.sales : 0;
  const actualBills = entry ? entry.bills : 0;
  const suggestion = dailyReport?.suggestion || 'No insights generated.';

  // Format data for Recharts Bar Chart
  const chartData = [
    {
      name: 'Sales (k)',
      Actual: actualSales / 1000,
      Target: targetSales / 1000,
    },
    {
      name: 'Bills',
      Actual: actualBills,
      Target: targetBills,
    }
  ];

  return (
    <div className="space-y-6 pt-4">
      {/* Date Filter & Export Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]/40 no-pdf-export">
        <div>
          <h1 className="text-3xl font-bold font-display text-cream">Daily Report</h1>
          <p className="text-[#8C8C8C] text-sm">Review detailed daily performance stats and exports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl pl-10 pr-4 py-2.5 text-cream text-sm focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors cursor-pointer"
            />
          </div>
          <button
            onClick={handleExport}
            disabled={isLoading || !dailyReport}
            className="bg-[#111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-cream px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 shadow-md disabled:opacity-50"
          >
            <FileDown className="w-4 h-4 text-primary" /> Export PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#8C8C8C] text-sm">Aggregating Daily Insights...</p>
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
          id="daily-report-container"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4 md:p-8 bg-[#050505] rounded-[2rem] border border-[#1F1F1F]/40 space-y-8"
        >
          
          {/* PDF Report Header (hidden in normal app UI, visible in PDF) */}
          <div className="hidden pdf-only flex justify-between items-center pb-6 border-b border-[#1F1F1F] mb-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-cream">EGCN Daily Performance Report</h2>
              <p className="text-xs text-[#8C8C8C] mt-1">{formattedDate()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-cream">{user?.businessName}</p>
              <p className="text-[10px] text-[#8C8C8C] tracking-widest uppercase font-bold">{user?.plan} plan</p>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-cream font-display">Daily Summary Overview</h3>
              <p className="text-xs text-[#8C8C8C] mt-1">Generated for: {formattedDate()}</p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sales Card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Sales Generated</p>
                  <h3 className="text-2xl font-bold text-cream">₹{actualSales.toLocaleString('en-IN')}</h3>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-[#8C8C8C] font-semibold mt-2">
                Target Expectation: ₹{targetSales.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Bills Card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Bills Generated</p>
                  <h3 className="text-2xl font-bold text-cream">{actualBills}</h3>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-[#8C8C8C] font-semibold mt-2">
                Target Expectation: {targetBills} Bills
              </p>
            </div>

            {/* Achievement Card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Daily Achievement</p>
                  <h3 className="text-2xl font-bold text-cream">{Math.round(achievedPct)}%</h3>
                </div>
                <div className="w-10 h-10 bg-[#4ade80]/10 rounded-xl flex items-center justify-center">
                  <Percent className="w-5 h-5 text-[#4ade80]" />
                </div>
              </div>
              <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden mt-3">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, achievedPct)}%` }} />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Block */}
            <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-6 shadow-xl flex flex-col justify-between">
              <h4 className="text-base font-bold text-cream mb-4">Actual performance vs Expected target</h4>
              
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                    <XAxis dataKey="name" stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#151515' }} contentStyle={{ backgroundColor: '#1F1F1F', border: '1px solid #2A2A2A', borderRadius: '8px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                    <Bar dataKey="Actual" fill="#d74339" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    <Bar dataKey="Target" fill="#2A2A2A" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Advice Insight Block */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-[2rem] p-6 shadow-xl relative overflow-hidden group flex-1 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Daily Insight
                  </h4>
                  <p className="text-cream font-medium leading-relaxed italic text-base">
                    "{suggestion}"
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-[#2A2A2A] flex justify-between items-center">
                  <span className="text-xs text-[#8C8C8C]">Daily Target Status:</span>
                  <span className={`text-sm font-bold ${achievedPct >= 100 ? 'text-[#4ade80]' : achievedPct >= 80 ? 'text-[#facc15]' : 'text-primary'}`}>
                    {achievedPct >= 100 ? 'Achieved 🏆' : achievedPct >= 80 ? 'On Track 📈' : 'Pending Target ⚠️'}
                  </span>
                </div>

                {user?.plan === 'free' && (
                  <div className="mt-4 pt-4 border-t border-[#2A2A2A] no-pdf-export">
                    <Link
                      to="/dashboard/plans"
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-cream text-xs font-bold flex items-center justify-center gap-1 transition-all duration-300 shadow-md"
                    >
                      Upgrade Plan to Access Expert Advisory
                    </Link>
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
