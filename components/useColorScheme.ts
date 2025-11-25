import { useThemeOverride } from '../contexts/ThemeContext';
import { useColorScheme as nativeUseColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' | null {
  const override = useThemeOverride()?.override;
  if (override) {
    return override;
  }
  return nativeUseColorScheme() ?? 'light';
}