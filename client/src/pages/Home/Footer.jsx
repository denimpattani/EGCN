import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const socialLinks = [
  {
    id: 'footer-linkedin',
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    id: 'footer-twitter',
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'footer-instagram',
    label: 'Instagram',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
]

const footerLinks = {
  Company: [
    { label: 'About Us', href: '#founder' },
    { label: 'Our Services', href: '#services' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Blog', href: '#' },
  ],
  Support: [
    { label: 'Contact Us', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Help Centre', href: '#' },
    { label: 'Status', href: '#' },
  ],
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const inputRef = useRef(null)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      inputRef.current?.classList.add('animate-shake')
      setTimeout(() => inputRef.current?.classList.remove('animate-shake'), 600)
      return
    }
    setStatus('loading')
    try {
      await axios.post('/api/newsletter', { email })
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <footer className="border-t border-[#1F1F1F] relative overflow-hidden bg-[#050505]">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-primary/10 rounded-[100%] blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Col */}
          <div className="lg:col-span-4 pr-0 lg:pr-8">
            <a href="/" className="flex items-center gap-2 mb-6 group w-fit relative">
              <img
                src="/egcn-logo.png"
                alt="EGCN"
                className="h-12 w-auto object-contain relative z-10"
              />
              <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-colors duration-500 rounded-full" />
            </a>
            <p className="text-[#8C8C8C] text-sm leading-relaxed mb-8">
              Digitising business advisory for marketing, finance, and cashflow. Empowering India's SMEs to grow with absolute clarity.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  id={social.id}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full border border-[#2A2A2A] flex items-center justify-center text-[#8C8C8C] hover:text-white hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
                  style={{ background: '#111' }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Cols */}
          <div className="lg:col-span-4 flex gap-16 lg:justify-center">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h3 className="text-cream font-bold text-sm uppercase tracking-widest mb-6">
                  {heading}
                </h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="relative text-[#8C8C8C] font-medium text-sm hover:text-white transition-colors duration-300 group inline-block w-fit"
                      >
                        {link.label}
                        <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Col */}
          <div className="lg:col-span-4 w-full lg:pl-4">
            <h3 className="text-cream font-bold text-sm uppercase tracking-widest mb-6">
              Stay Updated
            </h3>
            <p className="text-[#8C8C8C] text-sm mb-6 leading-relaxed">
              Get premium business growth insights and <br /> EGC Network updates directly in your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2" id="newsletter-form">
              <input
                ref={inputRef}
                id="newsletter-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-[#2A2A2A] rounded-full pl-6 pr-[120px] py-3.5 text-sm text-cream placeholder-[#5C5C5C] focus:outline-none focus:border-primary/60 transition-all duration-300 shadow-inner"
                style={{ background: '#0D0D0D' }}
                aria-label="Email address for newsletter"
              />
              <motion.button
                type="submit"
                id="newsletter-submit-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === 'loading' || status === 'success'}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary hover:bg-primary-hover text-cream font-semibold text-xs px-5 rounded-full transition-colors duration-300 shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center min-w-[90px]"
              >
                {status === 'loading' ? '...' : status === 'success' ? 'Done!' : 'Subscribe'}
              </motion.button>

              {/* Status messages */}
              <div className="absolute -bottom-7 left-4">
                {status === 'error' && (
                  <p className="text-primary text-xs font-semibold tracking-wide">Something went wrong. Try again.</p>
                )}
                {status === 'success' && (
                  <p className="text-green-500 text-xs font-semibold tracking-wide">Thank you for subscribing!</p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-[#1F1F1F] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#6C6C6C] text-sm font-medium tracking-wide">
            © {new Date().getFullYear()} EGC Network. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label) => (
              <a
                key={label}
                href="#"
                className="text-[#6C6C6C] text-sm font-medium hover:text-white transition-colors duration-300"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
