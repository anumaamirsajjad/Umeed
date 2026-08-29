'use client';

import { useCallback, useEffect, useState } from 'react';
import { applyTheme, resolveInitialTheme, setTheme, type Theme } from './theme';

// For the settings screen's manual override toggle. The inline script in
// layout.tsx already set the DOM class before hydration; this re-applies it
// so DOM and React state can never disagree, then exposes a setter that
// also persists the choice.
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const initial = resolveInitialTheme();
    applyTheme(initial);
    setThemeState(initial);
  }, []);

  const update = useCallback((next: Theme) => {
    setTheme(next);
    setThemeState(next);
  }, []);

  return [theme, update];
}
