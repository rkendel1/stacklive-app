import { AlarmClock, Box, Palette, Zap } from 'lucide-react-native';
import React from 'react';

export type IconProps = {
  size?: number;
  color?: string;
};

export const NATIVE_ICONS: { [key: string]: React.ComponentType<IconProps> } = {
  Palette,
  Zap,
  Box,
  AlarmClock,
  // Add more mappings as needed based on API icons
};

// Fallback function to get icon component
export const getIconComponent = (iconName: string): React.ComponentType<IconProps> => {
  return NATIVE_ICONS[iconName] || Box;
};