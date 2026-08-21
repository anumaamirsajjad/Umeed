/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm, gentle palette for mental health context
        primary: {
          50: '#faf6f1',
          100: '#f4ede3',
          200: '#e9dbc7',
          300: '#dcc4a8',
          400: '#d4af8e',
          500: '#c99a75',
          600: '#b87e5c',
          700: '#9e6a4e',
          800: '#845840',
          900: '#6d4a36',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
