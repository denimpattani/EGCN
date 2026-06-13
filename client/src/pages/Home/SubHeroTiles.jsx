import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { services } from '../../constants/services'

/* ── Service Modal ─────────────────────────────── */
function ServiceModal({ service, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-[#2A2A2A]"
          style={{ background: '#161616' }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#2A2A2A] flex items-center justify-center text-egcn-muted hover:text-cream hover:border-[#3A3A3A] transition-colors text-sm"
          >✕</button>

          <div className="mb-4 w-16 h-16">
            {service.icon.endsWith('.mp4') ? (
              <video
                src={`/Icons/${service.icon}`}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover mix-blend-screen rounded-2xl overflow-hidden"
              />
            ) : (
              <div className="text-4xl">{service.icon}</div>
            )}
          </div>
          <h3 className="font-display font-bold text-2xl text-cream mb-1.5">{service.title}</h3>
          <p className="text-primary font-semibold text-sm mb-4 tracking-wide">{service.tagline}</p>
          <p className="text-egcn-muted text-sm leading-relaxed mb-6">{service.detail}</p>

          <div className="flex flex-wrap gap-2">
            {service.stats.map((s) => (
              <span key={s} className="text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/25"
                style={{ background: 'rgba(192,57,43,0.08)' }}>
                {s}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Single Service Tile ───────────────────────── */
function ServiceTile({ service, index }) {
  const [hovered, setHovered] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 44 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="relative group rounded-2xl p-8 border flex flex-col h-full cursor-default overflow-hidden transition-all duration-300"
        style={{
          background: '#161616',
          borderColor: hovered ? 'rgba(192,57,43,0.35)' : '#2A2A2A',
          boxShadow: hovered ? '0 24px 64px rgba(192,57,43,0.12), 0 0 0 1px rgba(192,57,43,0.15)' : '0 4px 24px rgba(0,0,0,0.4)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Subtle top glow on hover */}
        <div
          className="absolute inset-x-0 top-0 h-px transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(192,57,43,0.6) 50%, transparent 100%)',
            opacity: hovered ? 1 : 0,
          }}
          aria-hidden="true"
        />

        {/* Icon */}
        <motion.div
          animate={hovered ? { scale: 1.08 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          className="mb-5 w-16 h-16"
        >
          {service.icon.endsWith('.mp4') ? (
            <video
              src={`/Icons/${service.icon}`}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover mix-blend-screen rounded-2xl overflow-hidden"
            />
          ) : (
            <div className="text-5xl">{service.icon}</div>
          )}
        </motion.div>

        <h3 className="font-display font-bold text-xl text-cream mb-1.5">{service.title}</h3>
        <p className="text-primary text-sm font-semibold mb-4 tracking-wide">{service.tagline}</p>
        <p className="text-egcn-muted text-sm leading-relaxed mb-6">{service.description}</p>

        {/* Stats */}
        <div className="flex flex-col gap-1.5 mb-8">
          {service.stats.map((stat) => (
            <div key={stat} className="flex items-center gap-2 text-xs text-egcn-muted">
              <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
              {stat}
            </div>
          ))}
        </div>

        {/* Read More */}
        <div className="mt-auto">
          <motion.button
            onClick={() => setModalOpen(true)}
            id={`service-readmore-${service.id}`}
            whileHover={{ x: 4 }}
            className="flex items-center gap-1.5 text-primary text-sm font-semibold tracking-wide group/btn"
          >
            Read More
            <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.button>
        </div>
      </motion.div>

      {modalOpen && <ServiceModal service={service} onClose={() => setModalOpen(false)} />}
    </>
  )
}

/* ── SubHeroTiles Section ──────────────────────── */
export default function SubHeroTiles() {
  return (
    <section id="services" className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-3"
          >What We Do</motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-cream"
          >
            Three Pillars of <span className="gradient-text-red">Business Growth</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-egcn-muted mt-4 max-w-2xl mx-auto text-lg"
          >
            EGCN covers the three areas that determine whether a business scales or stagnates.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => (
            <ServiceTile key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
