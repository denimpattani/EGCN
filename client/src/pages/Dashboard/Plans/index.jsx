import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Zap, Star, Shield, ArrowRight, Loader } from 'lucide-react';
import { updateUser } from '../../../store/authSlice';
import api from '../../../services/api';

const PLANS = [
  {
    id: 'business',
    name: 'Business Enhancement',
    price: 799,
    description: 'Perfect for growing businesses needing direct expert advice.',
    features: [
      'Access to target metrics and forecasts',
      'Direct real-time expert advisory chat',
      'PDF target sheets & media sharing',
      'Interactive consulting calendar',
      'Pulsing unread notification badges',
    ],
    accent: '#8C8C8C',
    icon: Shield,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 1499,
    recommended: true,
    description: 'Complete advisory suite with local physical consulting site visits.',
    features: [
      'All features in Business Enhancement',
      'Physical advisory site visits scheduling',
      'Advanced linear trend projections',
      'Priority expert response windows',
      'Custom taxation & invoicing details',
    ],
    accent: '#d74339', // Crimson Red Accent
    icon: Zap,
  },
  {
    id: 'vip',
    name: 'VIP Advisory',
    price: 2999,
    description: 'Sovereign resource optimization and dedicated consulting agents.',
    features: [
      'All features in Pro Plan',
      'Dedicated elite consulting expert',
      'Monthly structural strategy reviews',
      'Resource utilization auditing',
      '24/7 custom phone advisory direct',
    ],
    accent: '#D4AF37', // Gold Accent
    icon: Star,
  },
];

export default function Plans() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  
  const [activePlanId, setActivePlanId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (planId, amount) => {
    if (user?.plan === planId) {
      alert('You are already subscribed to this plan.');
      return;
    }

    setActivePlanId(planId);
    setIsLoading(true);

    try {
      // 1. Request Order creation from backend
      const response = await api.post('/payment/create-order', { plan: planId });
      const { orderId, amount: rzpAmount, currency } = response.data.data;

      // 2. Configure Razorpay checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder_id', // Test Key
        amount: rzpAmount,
        currency: currency,
        name: 'EGCN Advisory',
        description: `Upgrade to ${planId.toUpperCase()} Plan`,
        image: '/egcn-logo.png',
        order_id: orderId,
        handler: async (paymentResponse) => {
          setIsLoading(true);
          try {
            // 3. Verify Payment signature on backend
            const verifyResponse = await api.post('/payment/verify', {
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPayId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });

            const { user: updatedUser, subscription } = verifyResponse.data.data;
            
            // 4. Update Redux user profile state
            dispatch(updateUser({ plan: updatedUser.plan, planExpiry: updatedUser.planExpiry }));
            
            // 5. Navigate to Success view passing subscription details
            navigate('/dashboard/plans/success', { state: { subscription } });
          } catch (verifyErr) {
            console.error('Payment signature verification failure:', verifyErr);
            alert('Verification failed: ' + (verifyErr.response?.data?.message || verifyErr.message));
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user?.businessName || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#d74339', // Theme Crimson Red
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setActivePlanId(null);
          },
        },
      };

      // 3. Trigger Razorpay Overlay checkout modal
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment order creation failure:', err);
      alert('Failed to initiate checkout: ' + (err.response?.data?.message || err.message));
      setIsLoading(false);
      setActivePlanId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-6 min-h-[calc(100vh-112px)] flex flex-col justify-center items-center"
    >
      <div className="text-center max-w-xl mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-cream">
          Pricing <span className="text-primary">Plans</span>
        </h1>
        <p className="text-secondary text-sm mt-3 leading-relaxed">
          Unlock the Consulting Workspace, direct advisory chats, P2P video consultations, site visits, and structural audits. Upgrade to fit your scale.
        </p>
      </div>

      {/* Grid of pricing cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full mb-10">
        {PLANS.map((plan) => {
          const PlanIcon = plan.icon;
          const isCurrentPlan = user?.plan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-[#141414] border rounded-3xl p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 group hover:translate-y-[-6px] ${
                plan.recommended
                  ? 'border-primary shadow-primary/5'
                  : 'border-[#1F1F1F] hover:border-[#353535]'
              }`}
            >
              {plan.recommended && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-cream text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
                  Most Popular
                </span>
              )}

              <div>
                {/* Header Lockup */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all"
                    style={{
                      backgroundColor: `${plan.accent}1A`,
                      borderColor: `${plan.accent}33`,
                      color: plan.accent,
                    }}
                  >
                    <PlanIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-cream text-lg font-extrabold">{plan.name}</h3>
                </div>

                <p className="text-xs text-secondary leading-normal mb-6 min-h-[40px]">
                  {plan.description}
                </p>

                {/* Price Label */}
                <div className="flex items-baseline gap-1 mb-8 border-b border-[#1F1F1F] pb-6">
                  <span className="text-3xl font-extrabold text-cream">₹{plan.price}</span>
                  <span className="text-xs text-secondary">/ month</span>
                </div>

                {/* Features List */}
                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-secondary leading-relaxed">
                      <Check
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: plan.accent }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleUpgrade(plan.id, plan.price)}
                disabled={isCurrentPlan || (isLoading && activePlanId === plan.id)}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                  isCurrentPlan
                    ? 'bg-[#1A1A1A] text-secondary border border-[#252525] cursor-default'
                    : plan.recommended
                    ? 'bg-primary text-cream hover:bg-[#c13a31] shadow-lg shadow-primary/10 group-hover:shadow-primary/20'
                    : 'bg-[#1A1A1A] hover:bg-[#252525] border border-[#252525] text-cream hover:text-cream'
                }`}
              >
                {isLoading && activePlanId === plan.id ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin text-cream" />
                    <span>Processing...</span>
                  </>
                ) : isCurrentPlan ? (
                  <span>Current Plan Active</span>
                ) : (
                  <>
                    <span>Subscribe Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust banner */}
      <div className="flex items-center gap-3 text-xs text-secondary bg-[#141414] border border-[#1F1F1F] px-6 py-3.5 rounded-2xl">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        <span>Secured Indian standard transactions backed by Razorpay payments engine</span>
      </div>
    </motion.div>
  );
}
