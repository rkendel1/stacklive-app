import { useThemeOverride } from '../contexts/ThemeContext';
import { useColorScheme as nativeUseColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' | null {
  const themeContext = useThemeOverride();
  if (themeContext?.colorScheme) {
    return themeContext.colorScheme;
  }
  return nativeUseColorScheme() ?? 'light';
}