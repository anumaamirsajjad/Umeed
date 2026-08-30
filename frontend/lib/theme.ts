// Theme bootstrapping: prefers-color-scheme by default, with a manual override
// persisted to localStorage. Kept framework-agnostic so it can run as an inline
// script (see app/layout.tsx) before React hydrates, avoiding a flash of the
// wrong theme.

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'umeed-theme';

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore write failures (private browsing, storage disabled)
  }
  applyTheme(theme);
}

export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? 'light';
}

// Inlined into a <script> tag in the document head — must be a plain string,
// not a function reference, since it runs before any bundle loads.
export const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : 'light'; // Default to light mode, not system preference
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;
