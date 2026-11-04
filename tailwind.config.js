/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hospital: {
          navy: '#0b1d3a',
          'navy-light': '#162e56',
          teal: '#0d9488',
          'teal-light': '#14b8a6',
          'teal-dark': '#0f766e',
          accent: '#eab308',
          surface: '#f8fafc',
          border: '#e2e8f0',
          danger: '#dc2626',
          warning: '#f59e0b',
          success: '#16a34a'
        }
      }
    },
  },
  plugins: [],
}
