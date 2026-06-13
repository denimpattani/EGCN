/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── EGCN Logo Palette ─────────────────────────
        bg: '#000000',   // Pure black
        surface: '#111111',
        card: '#161616',
        primary: {
          DEFAULT: 'var(--clr-primary)',
          hover: 'var(--clr-primary-h)',
          light: 'var(--clr-primary-l)',
        },
        cream: '#efeee9',   // Offwhite
        muted: '#9d9d9d',   // Gray
        egcn: {
          text: '#F0EDE5',  // Primary text — logo cream
          muted: '#8C8C8C',  // Secondary text — mid grey
          subtle: '#3A3A3A',  // Very subtle — borders, dividers
          border: '#2A2A2A',  // Thin borders
          white: '#FFFFFF',  // Pure white for special use
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
      },
    },
  },
  plugins: [],
}
