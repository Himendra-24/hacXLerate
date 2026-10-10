/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#090A0D',
          900: '#0B0C10',
          850: '#141720',
          800: '#1B1E2B',
          700: '#262A3B',
          600: '#383E54',
          500: '#525B78',
        },
        electric: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          900: '#4C1D95',
        },
        brand: {
          purple: '#6366F1',
          hover: '#4F46E5',
          dark: '#0B0C10',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
        handwriting: ['Caveat', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
        'glow-violet': '0 0 25px -5px rgba(99, 102, 241, 0.45)',
      }
    },
  },
  plugins: [],
}
