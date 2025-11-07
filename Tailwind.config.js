/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
