'use client';

import { useCallback, useEffect, useState } from 'react';
import { resolveInitialTheme, setTheme, type Theme } from './theme';

// For the settings screen's manual override toggle. The inline script in
// layout.tsx already set the DOM class before hydration; this just syncs
// React state to it and exposes a setter that also persists the choice.
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    setThemeState(resolveInitialTheme());
  }, []);

  const update = useCallback((next: Theme) => {
    setTheme(next);
    setThemeState(next);
  }, []);

  return [theme, update];
}
