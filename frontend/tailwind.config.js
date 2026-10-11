/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unframe: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C3AED',
          600: '#5B46F6', // Reference primary violet
          700: '#4F46E5',
          800: '#4338CA',
          900: '#3730A3',
          950: '#1E1B4B',
        },
        charcoal: {
          950: '#08090D', // Deep cinematic section background
          900: '#0D0E15',
          850: '#12141D',
          800: '#1A1C28',
          700: '#252838',
          600: '#383E54',
          500: '#525B78',
        },
        surface: {
          light: '#FFFFFF',
          muted: '#F8F9FA',
          subtle: '#FAFAFC',
          border: '#E2E8F0',
        },
        electric: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#5B46F6',
          700: '#4F46E5',
          900: '#4C1D95',
        },
        brand: {
          purple: '#5B46F6',
          hover: '#4F46E5',
          dark: '#08090D',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
        handwriting: ['Caveat', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 12px 36px -8px rgba(0, 0, 0, 0.12)',
        'glow-violet': '0 0 28px -4px rgba(91, 70, 246, 0.4)',
        'glow-violet-sm': '0 0 15px -2px rgba(91, 70, 246, 0.3)',
      }
    },
  },
  plugins: [],
}
