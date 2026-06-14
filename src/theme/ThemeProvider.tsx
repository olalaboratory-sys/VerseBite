import React, { createContext, useContext, useMemo } from 'react';
import { buildTheme, Theme } from './tokens';

const ThemeContext = createContext<Theme>(buildTheme(false));

export function ThemeProvider({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  const theme = useMemo(() => buildTheme(dark), [dark]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
