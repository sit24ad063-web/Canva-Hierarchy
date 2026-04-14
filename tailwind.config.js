/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#04060f',
          900: '#0d1324',
          800: '#18213a',
          700: '#27355a',
          500: '#5d94ff',
          400: '#78b7ff',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(120,183,255,0.3), 0 16px 60px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};
