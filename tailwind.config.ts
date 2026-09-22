import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F2A4A',
          50: '#EEF3F9',
          100: '#D6E2F0',
          600: '#173A63',
          700: '#0F2A4A',
          800: '#0B1F37',
          900: '#0B1220',
        },
        teal: {
          DEFAULT: '#14B8A6',
          600: '#0E9488',
          700: '#0B7A70',
        },
        amber: {
          DEFAULT: '#F59E0B',
        },
        surface: {
          light: '#F8FAFC',
          dark: '#0B1220',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '72rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
