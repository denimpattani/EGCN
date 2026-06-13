import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import { testimonials } from '../../constants/testimonials'

/* ── Star Rating ──────────────────────────────────── */
function Stars({ count = 5 }) {
  return (
    <div className="flex gap-1">
      {[...Array(count)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-primary fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

/* ── TestimonialCard ─────────────────────────────── */
function TestimonialCard({ testimonial, isActive }) {
  return (
    <div className="rounded-2xl p-8 border flex flex-col h-full min-h-[320px] relative overflow-hidden transition-all duration-500"
         style={{ 
           background: '#161616',
           borderWidth: isActive ? '2px' : '1px',
           borderColor: isActive ? 'rgba(192,57,43,0.6)' : '#2A2A2A',
           boxShadow: isActive ? '0 24px 64px rgba(192,57,43,0.12), 0 0 0 1px rgba(192,57,43,0.15)' : '0 4px 24px rgba(0,0,0,0.4)',
         }}>
         
      {/* Subtle top glow on active */}
      <div
        className="absolute inset-x-0 top-0 h-px transition-opacity duration-500"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(192,57,43,0.6) 50%, transparent 100%)',
          opacity: isActive ? 1 : 0,
        }}
        aria-hidden="true"
      />
      {/* Quote icon */}
      <div
        className="absolute top-6 right-6 text-8xl font-display text-primary/10 select-none leading-none"
        aria-hidden="true"
      >
        "
      </div>

      {/* Stars */}
      <Stars count={testimonial.rating} />

      {/* Review */}
      <p className="text-cream text-sm leading-relaxed mt-4 mb-6 flex-1">
        "{testimonial.review}"
      </p>

      {/* Client info */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#2A2A2A]">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-cream text-sm font-bold flex-shrink-0"
          style={{ background: '#0D0D0D', border: '1px solid #C0392B' }}
        >
          {testimonial.initials}
        </div>
        <div>
          <p className="text-cream font-semibold text-sm">{testimonial.name}</p>
          <p className="text-egcn-muted text-xs">{testimonial.role} · {testimonial.company}</p>
        </div>
      </div>
    </div>
  )
}

/* ── TestimonialsCarousel ─────────────────────────── */
export default function TestimonialsCarousel() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 relative overflow-hidden" style={{ background: '#0D0D0D' }}>
      {/* Decorative spotlight behind cards */}
      <div
        className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(215,67,57,0.2) 0%, transparent 70%)',
          filter: 'blur(70px)'
        }}
        aria-hidden="true"
      />
      {/* Spotlight behind stats */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(215,67,57,0.15) 0%, transparent 60%)',
          filter: 'blur(50px)'
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary text-sm font-semibold uppercase tracking-widest mb-3"
          >
            Client Stories
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-cream"
          >
            What Our Clients <span className="gradient-text-red">Say</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-egcn-muted mt-4 max-w-xl mx-auto"
          >
            Real results from real businesses across India.
          </motion.p>
        </div>

        {/* Swiper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Swiper
            modules={[Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            slideToClickedSlide={true}
            coverflowEffect={{
              rotate: 15,
              stretch: 0,
              depth: 350,
              modifier: 1.5,
              slideShadows: false,
            }}
            autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop
            loopedSlides={6}
            className="testimonials-swiper pb-16 pt-8"
          >
            {[...testimonials, ...testimonials].map((t, index) => (
              <SwiperSlide
                key={`${t.id}-${index}`}
                style={{ width: '400px', maxWidth: '90vw' }}
                id={`testimonial-slide-${t.id}-${index}`}
              >
                {({ isActive }) => (
                  <TestimonialCard testimonial={t} isActive={isActive} />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          {[
            { label: 'Active Businesses', value: '200+' },
            { label: 'Avg. Revenue Lift', value: '18%' },
            { label: 'Expert Sessions', value: '1,400+' },
            { label: 'Client Satisfaction', value: '98%' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-xl py-6 px-4 border border-[#2A2A2A]"
              style={{ background: '#161616' }}
            >
              <div className="font-mono font-bold text-3xl text-cream mb-1">{stat.value}</div>
              <div className="text-egcn-muted text-xs">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
