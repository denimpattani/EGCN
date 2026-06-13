import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FileDown, AlertCircle, Calendar, Sparkles, TrendingUp, TrendingDown, Target, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchAnnualReport } from '../../../store/insightsSlice';
import { exportToPDF } from '../../../utils/pdfExport';
import CustomSelect from '../../../components/CustomSelect';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] p-4 rounded-xl shadow-xl">
        <p className="text-cream font-bold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: ₹{entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnnualReport() {
  const dispatch = useDispatch();
  const { annualReport, isLoading, error } = useSelector((state) => state.insights);
  const { user } = useSelector((state) => state.auth);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchAnnualReport(selectedYear));
  }, [dispatch, selectedYear]);

  const handleExport = () => {
    exportToPDF('annual-report-container', `annual-report-${selectedYear}.pdf`);
  };

  const years = [2025, 2026, 2027];
  const yearOptions = years.map(y => ({ value: y, label: y.toString() }));

  // Aggregate fallbacks
  const totalSales = annualReport?.totalAnnualSales ?? 0;
  const totalBills = annualReport?.totalAnnualBills ?? 0;
  const targetSales = annualReport?.targetAnnualSales ?? 0;
  const targetBills = annualReport?.targetAnnualBills ?? 0;
  const bestMonth = annualReport?.bestMonth;
  const worstMonth = annualReport?.worstMonth;
  const monthsData = annualReport?.months ?? [];
  const turnoverBaseline = annualReport?.turnoverBaseline ?? 'N/A';

  // Format Recharts data
  const chartData = monthsData.map(m => ({
    name: m.monthName,
    'Actual Sales': m.actualSales,
    'Target Sales': m.targetSales,
  }));

  return (
    <div className="space-y-6 pt-4">
      {/* Selector & Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]/40 no-pdf-export">
        <div>
          <h1 className="text-3xl font-bold font-display text-cream">Annual Report</h1>
          <p className="text-[#8C8C8C] text-sm">Full-year performance summaries, targets, and highlights.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <CustomSelect
            value={selectedYear}
            onChange={setSelectedYear}
            options={yearOptions}
            size="sm"
            containerClassName="w-28"
          />
          <button
            onClick={handleExport}
            disabled={isLoading || !annualReport}
            className="bg-[#111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-cream px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 shadow-md disabled:opacity-50"
          >
            <FileDown className="w-4 h-4 text-primary" /> Export PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#8C8C8C] text-sm">Aggregating Annual Insights...</p>
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
          id="annual-report-container"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4 md:p-8 bg-[#050505] rounded-[2rem] border border-[#1F1F1F]/40 space-y-8"
        >

          {/* PDF Report Header */}
          <div className="hidden pdf-only flex justify-between items-center pb-6 border-b border-[#1F1F1F] mb-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-cream">EGCN Annual Performance Report</h2>
              <p className="text-xs text-[#8C8C8C] mt-1">Year {selectedYear}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-cream">{user?.businessName}</p>
              <p className="text-[10px] text-[#8C8C8C] tracking-widest uppercase font-bold">{user?.plan} plan</p>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-cream font-display">Annual Performance Summary</h3>
              <p className="text-xs text-[#8C8C8C] mt-1">Full-year analytics for {selectedYear}</p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Total Sales Card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Annual Sales Turnover</p>
              <h3 className="text-2xl font-bold text-cream">₹{totalSales.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-[#8C8C8C] mt-4 pt-4 border-t border-[#1F1F1F]">
                Target: ₹{targetSales.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Total Bills Card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Total Bills Generated</p>
              <h3 className="text-2xl font-bold text-cream">{totalBills.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-[#8C8C8C] mt-4 pt-4 border-t border-[#1F1F1F]">
                Target: {targetBills.toLocaleString('en-IN')} Bills
              </p>
            </div>

            {/* Turnover Scale reference */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-1">Scale Turnover Goal</p>
              <h3 className="text-2xl font-bold text-cream">{turnoverBaseline} scale</h3>
              <p className="text-xs text-[#8C8C8C] mt-4 pt-4 border-t border-[#1F1F1F]">
                Registered target scale baseline
              </p>
            </div>

            {/* Highlight Performance */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/5 to-transparent pointer-events-none" />
              <div>
                <p className="text-xs text-[#8C8C8C] uppercase font-bold tracking-wider mb-2">Annual Highlights</p>
                <div className="space-y-2">
                  {bestMonth && bestMonth.monthName !== 'N/A' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-3.5 h-3.5 text-[#4ade80]" />
                      <span className="text-[#8C8C8C]">Best:</span>
                      <span className="text-[#4ade80] font-bold">{bestMonth.monthName} (₹{Math.round(bestMonth.actualSales / 1000)}k)</span>
                    </div>
                  ) : null}
                  {worstMonth && worstMonth.monthName !== 'N/A' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingDown className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[#8C8C8C]">Worst:</span>
                      <span className="text-primary font-bold">{worstMonth.monthName} (₹{Math.round(worstMonth.actualSales / 1000)}k)</span>
                    </div>
                  ) : null}
                  {(!bestMonth || bestMonth.monthName === 'N/A') && (
                    <p className="text-xs text-[#8C8C8C]">No performance data logged yet.</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Chart Block */}
          <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-xl">
            <h4 className="text-base font-bold text-cream mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Month-by-Month Annual Sales
            </h4>
            <p className="text-xs text-[#8C8C8C] mb-8">Compare monthly performance vs monthly target goals</p>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                  <XAxis dataKey="name" stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#8C8C8C" tick={{ fill: '#8C8C8C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#151515' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                  <Bar name="Actual Sales" dataKey="Actual Sales" fill="#d74339" radius={[3, 3, 0, 0]} maxBarSize={30} />
                  <Bar name="Target Sales" dataKey="Target Sales" fill="#2A2A2A" radius={[3, 3, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}
