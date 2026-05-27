/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          purple: '#7c3aed',
          pink: '#ec4899',
        }
      }
    },
  },
  plugins: [],
}
