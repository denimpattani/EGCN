import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, FileText, ArrowRight, Home } from 'lucide-react';

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const subscription = location.state?.subscription;

  // Format amount helper
  const formatAmount = (amt) => {
    return (amt / 100).toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-6 min-h-[calc(100vh-112px)] flex items-center justify-center"
    >
      <div className="max-w-md w-full bg-[#141414] border border-[#1F1F1F] rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Design glow background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center">
          {/* Animated check bubble */}
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mb-5 relative animate-pulse">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h1 className="text-2xl font-extrabold text-cream">Payment Successful!</h1>
          <p className="text-xs text-secondary mt-1.5 leading-normal max-w-xs">
            Your billing transaction was cryptographically verified. Your new consulting plan tier has been activated!
          </p>

          {/* Receipt details panel */}
          {subscription && (
            <div className="w-full bg-[#1A1A1A] border border-[#252525] rounded-2xl p-5 my-6 text-left space-y-3.5 text-xs">
              <div className="flex justify-between items-center border-b border-[#252525]/60 pb-2.5">
                <span className="text-secondary uppercase tracking-wide text-[10px] font-bold">Billing Receipt</span>
                <span className="text-[#8C8C8C]">EGCN Consulting</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8C8C]">Subscription Plan</span>
                <span className="text-cream font-bold capitalize">{subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8C8C]">Order ID</span>
                <span className="text-cream font-mono truncate max-w-[150px]">{subscription.razorpayOrderId}</span>
              </div>
              {subscription.razorpayPayId && (
                <div className="flex justify-between">
                  <span className="text-[#8C8C8C]">Transaction ID</span>
                  <span className="text-cream font-mono truncate max-w-[150px]">{subscription.razorpayPayId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#8C8C8C]">Amount Paid</span>
                <span className="text-primary font-bold">INR {formatAmount(subscription.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8C8C]">Active Expiry</span>
                <span className="text-cream font-medium">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="w-full space-y-3">
            {subscription?.invoiceUrl && (
              <a
                href={subscription.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#252525] text-cream py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm cursor-pointer"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>Download PDF Invoice</span>
                <Download className="w-4 h-4 text-secondary ml-1" />
              </a>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#c13a31] text-cream py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm cursor-pointer group"
            >
              <Home className="w-4 h-4" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
