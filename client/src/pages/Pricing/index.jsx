import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import SiteHeader from '../Home/SiteHeader'
import AntiGravityNetwork from '../../components/AntiGravityNetwork'

const plans = [
  {
    name: 'Free Tier',
    price: 0,
    description: 'Essential tools for early-stage tracking and insights.',
    features: [
      'Basic target metrics and forecasts',
      'Daily input tracking (Limited)',
      'Community forum access',
      'Standard email support',
    ],
    accent: '#5A5A5A',
    recommended: false,
  },
  {
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
    recommended: false,
  },
  {
    name: 'Pro Plan',
    price: 1499,
    description: 'Complete advisory suite with local physical consulting site visits.',
    features: [
      'All features in Business Enhancement',
      'Physical advisory site visits scheduling',
      'Advanced linear trend projections',
      'Priority expert response windows',
      'Custom taxation & invoicing details',
    ],
    accent: '#d74339',
    recommended: true,
  },
  {
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
    accent: '#D4AF37',
    recommended: false,
  },
]

export default function PublicPricing() {
  return (
    <div className="min-h-screen bg-black text-cream selection:bg-primary/30 selection:text-white font-sans overflow-x-hidden pt-24">
      {/* Navbar */}
      <SiteHeader />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#000000]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(215,67,57,0.15)_0%,transparent_50%)]" />
        <AntiGravityNetwork />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-[#2A2A2A] bg-primary/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-primary text-[11px] font-semibold uppercase tracking-[0.18em]">
              Transparent Pricing
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white"
          >
            Invest in <span className="text-primary">Strategic Growth</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-egcn-muted text-lg md:text-xl"
          >
            Choose the advisory tier that aligns with your scale. No hidden fees. Total financial clarity.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-3xl border backdrop-blur-md transition-all duration-300 ${
                plan.recommended
                  ? 'bg-gradient-to-b from-[#1a0a0a] to-[#0A0A0A] border-primary/50 shadow-[0_0_40px_-10px_rgba(215,67,57,0.2)] md:-translate-y-4'
                  : 'bg-[#0A0A0A]/60 border-[#1F1F1F] hover:border-[#2A2A2A] hover:bg-[#111111]/80'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-primary/20">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2" style={{ color: plan.recommended ? '#fff' : plan.accent }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-display font-bold text-white">₹{plan.price}</span>
                  <span className="text-egcn-muted text-sm">/ month</span>
                </div>
                <p className="text-[#8C8C8C] text-sm leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${plan.accent}15` }}>
                        <Check className="w-3.5 h-3.5" style={{ color: plan.accent }} />
                      </div>
                      <span className="text-sm text-[#CCCCCC]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/signup"
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 text-center ${
                  plan.recommended
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-[#b0352c] hover:shadow-primary/40'
                    : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
                }`}
              >
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
