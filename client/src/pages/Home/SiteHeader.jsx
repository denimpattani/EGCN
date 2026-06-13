import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useScrollY } from '../../hooks/useScrollY'

const navLinks = [
  { label: 'Services', href: '/#services' },
  { label: 'Why EGC Network', href: '/#myth-breaker' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'About', href: '/#founder' },
]

export default function SiteHeader() {
  const scrollY = useScrollY()
  const [menuOpen, setMenuOpen] = useState(false)
  const isScrolled = scrollY > 60

  return (
    <>
      {/* ── Main header bar ─────────────────────────── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${isScrolled
          ? 'bg-[#000000]/90 backdrop-blur-sm border-[#2A2A2A] py-2 shadow-lg shadow-black/20'
          : 'bg-transparent border-transparent py-4'
          }`}
      >


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Logo ──────────────────────────────── */}
            <motion.a
              href="/"
              layout
              className="flex items-center group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <img
                src="/egcn-logo.png"
                alt="EGC Network — Think Big"
                className="w-32 md:w-48 h-auto object-contain"
              />
            </motion.a>

            {/* ── Desktop nav & CTA ───────────────────────── */}
            <motion.div
              layout
              className={`hidden md:flex items-center justify-end flex-1 transition-all duration-500 ease-in-out ${isScrolled ? 'gap-2' : 'gap-8'}`}
            >

              {/* Nav Links Container */}
              <motion.nav
                layout
                className={`flex items-center gap-8 transition-all duration-500 ease-in-out ${isScrolled ? 'bg-[#111111] rounded-full px-6 py-2 mr-4' : ''
                  }`}
                aria-label="Main navigation"
              >
                {navLinks.map((link, i) => (
                  <motion.a
                    layout
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative hover:text-[#efeee9] text-base font-medium tracking-wide transition-colors duration-200 group ${isScrolled ? 'text-[#9d9d9d]' : 'text-[#9d9d9d]'
                      }`}
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#d74339] transition-all duration-300 group-hover:w-full rounded-full" />
                  </motion.a>
                ))}
              </motion.nav>

              {/* Login CTA */}
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Link
                  to="/signin"
                  id="header-login-btn"
                  className="inline-flex items-center gap-2 bg-[#d74339] hover:bg-[#bd3a31] text-[#efeee9] text-base font-semibold px-7 py-3 rounded-full transition-all duration-200 shadow-lg shadow-[#d74339]/20 hover:shadow-[#d74339]/40 hover:scale-105 active:scale-95 tracking-wide"
                >
                  Login
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>

            {/* ── Mobile hamburger ───────────────────── */}
            <div className="flex items-center gap-4 md:hidden">
              <button
                id="mobile-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="flex flex-col items-center justify-center gap-1.5 w-10 h-10"
              >
                <motion.span animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="w-5 h-px bg-[#efeee9] rounded-full origin-center" />
                <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-px bg-[#efeee9] rounded-full" />
                <motion.span animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="w-5 h-px bg-[#efeee9] rounded-full origin-center" />
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* ── Mobile full-screen drawer ──────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-40 bg-[#000000] flex flex-col"
          >
            {/* Top bar inside drawer */}
            <div className="flex items-center justify-between px-6 pt-6">
              <img
                src="/egcn-logo.png"
                alt="EGCN"
                className="h-12 w-auto object-contain"
              />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 rounded-full border border-[#2A2A2A] flex items-center justify-center text-[#9d9d9d] hover:text-[#efeee9] hover:border-[#3A3A3A] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                  onClick={() => setMenuOpen(false)}
                  className="font-display text-3xl font-bold text-[#efeee9] hover:text-[#d74339] transition-colors duration-200 tracking-tight"
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="mt-2"
              >
                <Link
                  to="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 bg-[#d74339] text-[#efeee9] font-semibold px-8 py-3 rounded-full shadow-lg shadow-[#d74339]/20 text-base tracking-wide"
                >
                  Login
                </Link>
              </motion.div>
            </div>

            {/* Bottom tagline */}
            <p className="text-center text-[#9d9d9d] text-xs tracking-[0.2em] uppercase pb-8">
              Think Big.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
