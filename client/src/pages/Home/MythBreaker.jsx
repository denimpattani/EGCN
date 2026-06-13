import { useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { mythBreakerData } from '../../constants/mythBreaker'

export default function MythBreaker() {
  const [activeId, setActiveId] = useState(mythBreakerData[0].id)
  const [expanded, setExpanded] = useState(false)

  const active = mythBreakerData.find((m) => m.id === activeId)

  return (
    <section id="myth-breaker" className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: '#111111' }}>

      {/* Subtle red glow top-right */}
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(192,57,43,0.07) 0%, transparent 65%)', filter: 'blur(30px)' }}
        aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Myth vs. Reality
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-cream">
            Breaking Business <span className="gradient-text-red">Myths</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-egcn-muted mt-4 max-w-xl mx-auto">
            Common beliefs holding businesses back — and the truth behind each one.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

          {/* Left: Tabs */}
          <LayoutGroup>
            <div className="space-y-2.5">
              {mythBreakerData.map((myth) => (
                <motion.button
                  key={myth.id}
                  id={`myth-tab-${myth.id}`}
                  onClick={() => { setActiveId(myth.id); setExpanded(false) }}
                  whileHover={{ x: 3 }}
                  className={`w-full text-left px-5 py-4 rounded-xl border-l-2 transition-all duration-500 relative overflow-hidden ${activeId === myth.id ? 'opacity-100 translate-x-2' : 'opacity-50 hover:opacity-100'}`}
                  style={{
                    background: activeId === myth.id ? 'linear-gradient(to right, rgba(215,67,57,0.1), transparent)' : 'transparent',
                    borderColor: activeId === myth.id ? '#d74339' : 'transparent',
                    borderTop: 'none',
                    borderRight: 'none',
                    borderBottom: 'none'
                  }}
                >
                  <div className="flex items-start gap-3 pl-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{myth.icon}</span>
                    <div>
                      <p className={`text-xs uppercase tracking-widest mb-1 font-semibold transition-colors duration-300 ${activeId === myth.id ? 'text-primary' : 'text-egcn-muted'}`}>Myth #{myth.id}</p>
                      <p className={`text-sm font-medium leading-snug transition-colors duration-300 ${activeId === myth.id ? 'text-cream' : 'text-egcn-muted'}`}>
                        "{myth.myth}"
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </LayoutGroup>

          {/* Right: Fact panel */}
          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-8 border border-[#2A2A2A]"
                style={{ background: '#161616' }}
              >
                {/* Myth row */}
                <div className="flex items-start gap-3 mb-6 pb-6 border-b border-[#2A2A2A]">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-red-800/40"
                    style={{ background: 'rgba(192,57,43,0.12)' }}>
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1.5">The Myth</p>
                    <p className="text-egcn-muted text-sm italic">"{active.myth}"</p>
                  </div>
                </div>

                {/* Fact row */}
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-green-800/30"
                    style={{ background: 'rgba(34,197,94,0.08)' }}>
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">The Fact</p>
                    <p className="text-cream font-medium leading-relaxed text-sm">{active.fact}</p>
                  </div>
                </div>

                {/* Expandable detail */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.32, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-[#2A2A2A] mb-4">
                        <p className="text-egcn-muted text-sm leading-relaxed">{active.detail}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={() => setExpanded(!expanded)}
                  id={`myth-readmore-${active.id}`}
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-1.5 text-primary text-sm font-semibold tracking-wide"
                >
                  {expanded ? 'Show Less' : 'Read More'}
                  <motion.svg
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.28 }}
                    className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
