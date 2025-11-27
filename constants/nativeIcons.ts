import { AlarmClock, BookOpen, Box, Clock, Cloud, Music, Palette, Search, User, Zap } from 'lucide-react-native';
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
  Clock,
  Music,
  BookOpen,
  Cloud,
  User,
  Search,
  user: User,
  search: Search,
  'arrow-right': Zap, // Fallback
  // Add more mappings as needed based on API icons
};

// Fallback function to get icon component
export const getIconComponent = (iconName: string): React.ComponentType<IconProps> => {
  return NATIVE_ICONS[iconName] || Box;
};