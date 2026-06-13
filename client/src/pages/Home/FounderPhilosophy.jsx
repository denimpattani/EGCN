import { useRef } from 'react'
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion'

function TiltCard({ children }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring physics for smooth return and movement
  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 30 })

  // Subtler, premium rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['3deg', '-3deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-3deg', '3deg'])

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div style={{ perspective: '1400px' }} className="w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.01 }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-full rounded-[2.5rem] border border-[#3A3A3A] p-10 lg:p-20 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] hover:border-primary/40 hover:shadow-[0_40px_100px_rgba(215,67,57,0.15)] transition-colors duration-500"
      >
        {/* Base dark background */}
        <div className="absolute inset-0 bg-[#0A0A0A] -z-30" />

        {/* Logo Background Image */}
        <div
          className="absolute inset-0 -z-20 opacity-15 mix-blend-lighten"
          style={{
            backgroundImage: "url('/egcn-logo-full.jpeg')",
            backgroundSize: '50%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />

        {/* Interactive Spotlight Glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[120px] pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(circle, rgba(215,67,57,0.3) 0%, transparent 60%)',
            x: useTransform(mouseXSpring, [-0.5, 0.5], ['-15%', '15%']),
            y: useTransform(mouseYSpring, [-0.5, 0.5], ['-15%', '15%']),
          }}
        />

        {children}
      </motion.div>
    </div>
  )
}

export default function FounderPhilosophy() {
  const sectionRef = useRef(null)

  // Split words for text reveal effect
  const text = "A business without data is like a ship without a compass — you might be moving, but you don't know if you're heading toward the shore or the storm."
  const words = text.split(" ")

  return (
    <section
      id="founder"
      ref={sectionRef}
      className="relative min-h-[90vh] py-24 lg:py-32 flex items-center justify-center overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Grid lines background */}
      <div className="absolute inset-0 grid-lines opacity-10" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary text-sm font-semibold uppercase tracking-[0.4em] mb-4"
          >
            Founder's Vision
          </motion.p>
        </div>

        <TiltCard>
          <div className="relative z-10 flex flex-col items-center text-center" style={{ transform: 'translateZ(60px)' }}>

            {/* Giant Floating Quotes */}
            <motion.div
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 1.5, bounce: 0.5 }}
              className="text-primary/30 font-display text-8xl md:text-9xl leading-none h-16 md:h-20 overflow-visible select-none mb-8"
            >
              "
            </motion.div>

            {/* Word-by-word reveal text */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-cream leading-tight mb-16 max-w-5xl mx-auto">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0.2, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ delay: i * 0.04, duration: 0.5 }}
                  className="inline-block mr-3 mb-2"
                >
                  {word === 'data' || word === 'compass' || word === 'storm.' ? (
                    <span className="gradient-text-red">{word}</span>
                  ) : word}
                </motion.span>
              ))}
            </h2>

            {/* Founder Profile */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-5 bg-[#1A1A1A]/90 p-4 pr-10 rounded-full border border-[#4A4A4A] backdrop-blur-md shadow-2xl"
            >
              <div
                className="w-16 h-16 rounded-full shadow-[0_0_30px_rgba(215,67,57,0.6)] border-2 border-primary overflow-hidden"
              >
                <img src="/Founder-Image.jpeg" alt="Param Joshi" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="font-display font-bold text-xl text-cream tracking-wide">Param Joshi</p>
                <p className="text-primary text-xs uppercase tracking-widest font-bold mt-1">Founder, EGC Network</p>
              </div>
            </motion.div>

          </div>
        </TiltCard>

      </div>
    </section>
  )
}
