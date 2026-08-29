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

        // Generic design-system aliases used across components/newer pages
        // (Button, Card, Input, mood/resources/safety-plan screens). Derived
        // from the umeed brand palette above so both naming schemes stay in sync.
        // Muted sage (primary) / dusty blue (accent) — calm, sensory-neutral
        // palette. Values only; the umeed-* brand scale above is untouched
        // (still orange) since inline-style pages read that one directly.
        primary: {
          50: '#F2F6F2',
          100: '#E2EBE3',
          200: '#C9DACB',
          300: '#ACC2AE',
          400: '#93AC97',
          500: '#7C9885',
          600: '#6C8874',
          700: '#56705F',
          800: '#42574B',
          900: '#2F3F37',
        },
        accent: {
          50: '#F1F4F8',
          100: '#E2E8F0',
          200: '#C9D5E1',
          300: '#ADBFD3',
          400: '#93A7C4',
          500: '#7C93B8',
          600: '#6A80A3',
          700: '#566A87',
          800: '#42536A',
          900: '#303D4E',
        },
        ink: {
          light: '#44403A',
          dark: '#EDEBE7',
          muted: 'var(--umeed-ink-500)',
        },
        // Crisis mode ONLY — deliberately outside the calm sage/blue system so
        // it stays universally recognizable as urgent. One shade, used flat.
        crisis: {
          DEFAULT: '#C0392B',
          600: '#C0392B',
          700: '#A6301F',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          light: '#F7F4EF',
          dark: '#23262B',
          darker: '#17181C',
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
        micro: '150ms',
        quick: '300ms',
        standard: '400ms',
        overlay: '250ms',
      },
      transitionTimingFunction: {
        umeed: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
