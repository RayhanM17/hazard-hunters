/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { borderColor: 'rgba(245, 158, 11, 0.3)' },
          '50%': { borderColor: 'rgba(245, 158, 11, 0.9)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'blob-drift-a': {
          '0%, 100%': { transform: 'translate(-5%, -8%) scale(1)' },
          '50%': { transform: 'translate(8%, 6%) scale(1.15)' },
        },
        'blob-drift-b': {
          '0%, 100%': { transform: 'translate(6%, 4%) scale(1.1)' },
          '50%': { transform: 'translate(-8%, -6%) scale(0.95)' },
        },
        'blob-drift-c': {
          '0%, 100%': { transform: 'translate(-4%, 6%) scale(0.95)' },
          '50%': { transform: 'translate(5%, -8%) scale(1.1)' },
        },
        'lane-scroll': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '160px 160px' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 3s ease-in-out infinite',
        'blob-drift-a': 'blob-drift-a 22s ease-in-out infinite',
        'blob-drift-b': 'blob-drift-b 26s ease-in-out infinite',
        'blob-drift-c': 'blob-drift-c 30s ease-in-out infinite',
        'lane-scroll': 'lane-scroll 12s linear infinite',
      },
      backgroundSize: {
        'gradient-pan': '200% 200%',
      },
      boxShadow: {
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.3)',
        'glow-indigo': '0 0 15px rgba(99, 102, 241, 0.35)',
        'glow-violet': '0 0 20px rgba(217, 70, 239, 0.4)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
