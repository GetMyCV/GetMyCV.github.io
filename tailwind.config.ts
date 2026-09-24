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
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'step-in': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'dialog-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'menu-in': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '60%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-30px, 24px) scale(1.12)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.45)' },
          '50%': { boxShadow: '0 0 0 8px rgba(245, 158, 11, 0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        'fade-in': 'fade-in 0.35s ease-out both',
        'step-in': 'step-in 0.4s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        'dialog-in': 'dialog-in 0.28s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        'menu-in': 'menu-in 0.22s ease-out both',
        pop: 'pop 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        drift: 'drift 14s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
