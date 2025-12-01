import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeContextType = {
  colorScheme: ColorSchemeName;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = Appearance.getColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(systemColorScheme);

  const toggleTheme = () => {
    setColorScheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useThemeOverride = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeOverride must be used within a ThemeProvider');
  }
  return context;
};