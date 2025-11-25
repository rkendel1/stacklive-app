import React, { createContext, ReactNode, useContext, useState } from 'react';

type ThemeOverride = 'light' | 'dark' | null;
type ThemeContextType = {
  override: ThemeOverride;
  setOverride: (override: ThemeOverride) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, initialOverride }: { children: ReactNode; initialOverride?: ThemeOverride }) {
  const [override, setOverride] = useState<ThemeOverride>(initialOverride ?? null);

  return (
    <ThemeContext.Provider value={{ override, setOverride }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeOverride() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeOverride must be used within a ThemeProvider');
  }
  return context;
}