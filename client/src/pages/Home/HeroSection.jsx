import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import AntiGravityNetwork from '../../components/AntiGravityNetwork'

/* ── Word-stagger variants ─────────────────────── */
const TAGLINE = 'Think Big. Grow With Expert Clarity.'
const words = TAGLINE.split(' ')

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
}
const wordVariants = {
  hidden: { opacity: 0, y: 36, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}


/* ── Floating Feature Cards Stack ──────────────── */
function FeatureCardsStack() {
  return (
    <div className="relative w-full max-w-[420px] h-[450px] flex items-center justify-center group perspective-1000">

      {/* Cashflow Card - Bottom */}
      <motion.div
        className="absolute w-[280px] h-[160px] rounded-2xl p-5 border border-[#2A2A2A] shadow-2xl backdrop-blur-md bg-[#0a0a0a]/80 flex flex-col justify-between overflow-hidden cursor-default"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ zIndex: 1, rotate: '-12deg', top: '55%', left: '10%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#d74339]/10 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-cream font-semibold">Cashflow</span>
          <span className="w-6 h-6 rounded-full bg-[#2A2A2A] flex items-center justify-center text-egcn-muted text-xs">₹</span>
        </div>
        <div className="h-12 w-full flex items-end gap-1.5 relative z-10">
          {[30, 45, 20, 60, 80, 50, 90, 75].map((h, i) => (
            <div key={i} className="flex-1 bg-[#d74339] rounded-t-sm" style={{ height: `${h}%`, opacity: 0.4 + h / 200 }} />
          ))}
        </div>
      </motion.div>

      {/* Finance Card - Middle */}
      <motion.div
        className="absolute w-[280px] h-[160px] rounded-2xl p-5 border border-[#3A3A3A] shadow-2xl backdrop-blur-md bg-[#0f0f0f]/90 flex flex-col justify-between overflow-hidden cursor-default"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ zIndex: 2, rotate: '5deg', top: '35%', left: '40%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#efeee9]/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-cream font-semibold">Finance</span>
          <span className="w-6 h-6 rounded-full bg-[#efeee9]/10 flex items-center justify-center text-cream text-xs">%</span>
        </div>
        <div className="flex justify-between items-end mt-4 relative z-10">
          <div>
            <div className="text-egcn-muted text-[11px] mb-1">Runway</div>
            <div className="text-cream text-xl font-bold">18 mo</div>
          </div>
          <div className="text-right">
            <div className="text-egcn-muted text-[11px] mb-1">Burn Rate</div>
            <div className="text-red-400 text-sm font-bold">▼ 12%</div>
          </div>
        </div>
      </motion.div>

      {/* Marketing Card - Top */}
      <motion.div
        className="absolute w-[280px] h-[160px] rounded-2xl p-5 border border-[#d74339]/40 shadow-[0_0_40px_-10px_rgba(215,67,57,0.3)] backdrop-blur-xl bg-black/80 flex flex-col justify-between overflow-hidden cursor-default"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ zIndex: 3, rotate: '-4deg', top: '15%', left: '20%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#d74339]/20 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-cream font-semibold">Marketing</span>
          <span className="w-2 h-2 rounded-full bg-[#d74339] animate-pulse" />
        </div>
        <div className="flex flex-col gap-3 mt-4 relative z-10">
          <div className="w-full h-1.5 rounded-full bg-[#2A2A2A] overflow-hidden">
            <motion.div className="h-full bg-[#d74339]" initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ delay: 0.5, duration: 1 }} />
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-egcn-muted">ROAS Target</span>
            <span className="text-cream font-bold">3.2x</span>
          </div>
        </div>
      </motion.div>

    </div>
  )
}

/* ── Magnetic Button ───────────────────────────── */
function MagneticButton({ children, to, href, variant = 'solid', id }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.22 })
  }
  const onLeave = () => setPos({ x: 0, y: 0 })

  const base = 'inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 group overflow-hidden relative'
  const styles = variant === 'solid'
    ? `${base} bg-primary text-[#efeee9] shadow-lg shadow-primary/20 glow-red-sm`
    : `${base} border border-[#3A3A3A] text-[#efeee9] hover:border-[#efeee9]/50 bg-transparent`

  const Tag = to ? Link : 'a'
  const linkProp = to ? { to } : { href }

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ x: pos.x, y: pos.y }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}>
      <Tag id={id} {...linkProp} className={styles}>
        {/* Animated Background sweep for all buttons */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />

        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </Tag>
    </motion.div>
  )
}

/* ── Scroll indicator ──────────────────────────── */
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 0.8 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="font-mono text-egcn-muted text-[9px] uppercase tracking-[0.2em]">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-5 h-8 border border-[#3A3A3A] rounded-full flex items-start justify-center pt-1.5"
      >
        <div className="w-1 h-1.5 rounded-full bg-primary" />
      </motion.div>
    </motion.div>
  )
}

/* ── Hero Section ──────────────────────────────── */
export default function HeroSection() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section id="main-content" className="relative min-h-screen flex items-center overflow-hidden pt-20">

      {/* Animated bg */}
      <div className="animated-mesh" aria-hidden="true" />

      {/* Subtle grid */}
      <div className="absolute inset-0 grid-lines opacity-25" aria-hidden="true" />

      {/* Noise */}
      <div className="noise-overlay absolute inset-0" aria-hidden="true" />

      {/* AntiGravity Network Background (moved above backgrounds to be visible) */}
      <AntiGravityNetwork />

      {/* Soft red glow orbs */}
      <div className="absolute top-1/3 left-[10%] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(192,57,43,0.10) 0%, transparent 70%)', filter: 'blur(50px)' }}
        aria-hidden="true" />

      {/* Parallax wrapper */}
      <motion.div style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* ── Left: text ──────────────────────── */}
          <div className="text-center lg:text-left">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 border border-[#2A2A2A]"
              style={{ background: 'rgba(192,57,43,0.08)' }}
            >
              {/* Logo-style red dot */}
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-primary text-[11px] font-semibold uppercase tracking-[0.18em]">
                B2B Consulting Platform
              </span>
            </motion.div>

            {/* Animated headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.75rem] xl:text-7xl leading-[1.06] text-balance mb-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap justify-center lg:justify-start gap-x-4"
                aria-label={TAGLINE}
              >
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    variants={wordVariants}
                    className={
                      word === 'Expert' || word === 'Clarity.'
                        ? 'gradient-text-red'
                        : 'text-cream'
                    }
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.div>
            </h1>

            {/* Sub tagline */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="text-egcn-muted text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              EGC Network digitises your marketing, finance, and cashflow advisory. Set targets, track daily performance, and grow — all in one platform.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.35, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <MagneticButton to="/signup" id="hero-get-started-btn">
                Get Started
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </MagneticButton>
              <MagneticButton to="/pricing" variant="ghost" id="hero-pricing-btn">
                Pricing
              </MagneticButton>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.65, duration: 0.6 }}
              className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {[
                  { init: 'RM', bg: '#C0392B' },
                  { init: 'PS', bg: '#5D4037' },
                  { init: 'AK', bg: '#37474F' },
                  { init: 'SJ', bg: '#1B5E20' },
                ].map(({ init, bg }, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0D0D0D] flex items-center justify-center text-xs font-bold text-cream"
                    style={{ background: bg }}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-egcn-muted text-xs mt-0.5">
                  Trusted by <span className="text-cream font-semibold">200+ businesses</span>
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: Feature Cards Stack ───────── */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <FeatureCardsStack />
          </motion.div>
        </div>
      </motion.div>

      <ScrollIndicator />
    </section>
  )
}
