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
        // Muted sage — the calm, primary voice. Unchanged: it was already
        // right, and every page is already wired to it.
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
        // Warm clay, replacing the cool dusty blue that used to sit here. The
        // blue was the one thing fighting the earthy direction — swapping the
        // values (not the token name) re-tunes every `accent-*` usage already
        // in the pages without touching a single line of markup.
        accent: {
          50: '#FAF6F1',
          100: '#F2E9DF',
          200: '#E5D5C3',
          300: '#D4BCA3',
          400: '#C2A184',
          500: '#B08968',
          600: '#97724F',
          700: '#7A5C41',
          800: '#5C4633',
          900: '#3F3125',
        },
        ink: {
          light: '#3D3A33',  // warm brown-grey, never pure black
          dark: '#EDEBE7',
          muted: 'var(--umeed-ink-500)',
        },
        // Crisis mode ONLY — deliberately outside the calm system so it stays
        // universally recognizable as urgent. One shade, used flat.
        crisis: {
          DEFAULT: '#C0392B',
          600: '#C0392B',
          700: '#A6301F',
        },
        surface: {
          DEFAULT: '#FFFDFA',   // tinted off-white, not #FFF
          light: '#F7F4EF',     // page canvas, light
          dark: '#1F1D1A',      // page canvas, dark — warm, was cool #23262B
          // Elevated surface in dark mode (cards, bubbles, modals). Deliberately
          // LIGHTER than `dark`: dark-mode elevation lifts a surface off the
          // page, it doesn't sink it below.
          darker: '#2A2724',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        nastaliq: ['var(--font-nastaliq)', 'serif'],
      },
      // Fluid scale. Body and caption stay fixed — fluid body text hurts
      // readability; only display sizes need to scale with the viewport.
      fontSize: {
        caption: ['0.8125rem', { lineHeight: '1.5' }],
        body: ['1rem', { lineHeight: '1.6' }],
        lead: ['clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)', { lineHeight: '1.55' }],
        section: ['clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem)', { lineHeight: '1.25' }],
        heading: ['clamp(1.6rem, 1.25rem + 1.75vw, 2.75rem)', { lineHeight: '1.15' }],
        hero: ['clamp(2rem, 1.4rem + 3vw, 4rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        lg: '0.5rem',
        '2xl': '1rem',
        card: '1.25rem',
        pill: '9999px',
      },
      // Warm-tinted and diffuse. Overriding the default keys means every
      // existing `shadow-sm` / `shadow-md` in the app softens automatically,
      // with no markup churn.
      boxShadow: {
        sm: '0 1px 2px 0 rgb(61 58 51 / 0.04)',
        DEFAULT: '0 2px 8px -2px rgb(61 58 51 / 0.06)',
        md: '0 6px 20px -6px rgb(61 58 51 / 0.10)',
        lg: '0 16px 40px -12px rgb(61 58 51 / 0.12)',
        glass: '0 8px 32px -10px rgb(61 58 51 / 0.18)',
        none: 'none',
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
