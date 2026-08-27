// Umeed Design Tokens
// Use these in TypeScript/JavaScript code instead of hardcoding color values

export const designTokens = {
  colors: {
    orange: {
      500: '#F46B1F',
      700: '#C4491A',
      100: '#FDE3CE',
    },
    beige: {
      50: '#FBF3E7',  // Canvas/background
      200: '#F2E4D0', // Surface/panels
    },
    ink: {
      900: '#3A2A1C', // Primary text
      500: '#8C765F', // Secondary/muted
    },
    semantic: {
      green600: '#3F7D4E',  // Pattern insight ONLY
      crisis600: '#C0392B', // Crisis mode ONLY
    },
  },
  typography: {
    scale: {
      caption: '13px',
      body: '16px',
      lead: '20px',
      section: '28px',
      heading: '44px',
      hero: '64px',
    },
    fonts: {
      display: "'Fraunces', Georgia, serif",
      body: "'Inter', system-ui, sans-serif",
      nastaliq: "'Noto Nastaliq Urdu', serif",
    },
  },
  motion: {
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    duration: {
      quick: '300ms',
      standard: '400ms',
    },
  },
  spacing: {
    sidebar: '80px',
  },
};

// Dark mode variants (apply when .dark class is on html)
export const darkModeOverrides = {
  colors: {
    beige: {
      50: '#241811',
      200: '#342418',
    },
    ink: {
      900: '#F5F0EA',
      500: '#C4B3A0',
    },
    orange: {
      500: '#FF8A42',
      700: '#FFAA5F',
    },
  },
};
