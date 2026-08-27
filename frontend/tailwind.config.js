/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        umeed: {
          'orange-500': '#F46B1F',
          'orange-700': '#C4491A',
          'orange-100': '#FDE3CE',
          'beige-50': '#FBF3E7',
          'beige-200': '#F2E4D0',
          'ink-900': '#3A2A1C',
          'ink-500': '#8C765F',
          'green-600': '#3F7D4E',
          'crisis-600': '#C0392B',
        },
        // Dark mode overrides
        'umeed-dark': {
          'beige-50': '#241811',
          'beige-200': '#342418',
          'ink-900': '#F5F0EA',
          'ink-500': '#C4B3A0',
          'orange-500': '#FF8A42',
          'orange-700': '#FFAA5F',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        nastaliq: ['var(--font-nastaliq)', 'serif'],
      },
      fontSize: {
        caption: ['13px', { lineHeight: '1.5' }],
        body: ['16px', { lineHeight: '1.5' }],
        lead: ['20px', { lineHeight: '1.5' }],
        section: ['28px', { lineHeight: '1.2' }],
        heading: ['44px', { lineHeight: '1.2' }],
        hero: ['64px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        lg: '0.5rem',
        '2xl': '1rem',
        card: '1.25rem',
        pill: '9999px',
      },
      transitionDuration: {
        quick: '300ms',
        standard: '400ms',
      },
      transitionTimingFunction: {
        umeed: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
