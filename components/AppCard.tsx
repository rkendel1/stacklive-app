import { LinearGradient } from 'expo-linear-gradient';
import { MiniApp } from '@/src/lib/miniapps';
import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from './useColorScheme';

interface AppCardProps {
  app: MiniApp;
  onPress?: () => void;
  size?: 'small' | 'large';
}

const getEmojiForIcon = (icon: string): string => {
  switch (icon) {
    case 'palette': return '🎨';
    case 'clock': return '⏰';
    case 'music-note': return '🎵';
    case 'book-open': return '📖';
    case 'cloud': return '☁️';
    default: return '📱';
  }
};

export default function AppCard({ app, onPress, size = 'small' }: AppCardProps) {
  const colorScheme = useColorScheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const isDark = colorScheme === 'dark';

  const isLarge = size === 'large';
  const palette = ['orange', 'blue', 'green', 'purple', 'pink'];
  const hash = app.id.charCodeAt(0) % palette.length;
  const defaultColor = palette[hash];
  const cardBg = app.iconBackgroundColor?.replace('bg-', '') || defaultColor;
  const match = cardBg.match(/(\w+)-(\d+)/);
  const color = match ? match[1] : defaultColor;

  const colorMap: Record<string, Record<number, string>> = {
    orange: { 400: '#fed7aa', 500: '#f97316', 600: '#ea580c' },
    blue: { 400: '#dbeafe', 500: '#3b82f6', 600: '#2563eb' },
    green: { 400: '#d1fae5', 500: '#10b981', 600: '#059669' },
    pink: { 400: '#fce7f3', 500: '#ec4899', 600: '#db2777' },
    purple: { 400: '#f3e8ff', 500: '#a855f7', 600: '#9333ea' },
    indigo: { 400: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5' },
  };

  const gradientColors: readonly string[] = isLarge 
    ? [colorMap[color]?.[400] || '#fed7aa', colorMap[color]?.[600] || '#ea580c']
    : [colorMap[color]?.[500] || '#f97316', colorMap[color]?.[600] || '#ea580c'];

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const styles = StyleSheet.create({
    touchable: {
      width: '100%',
      marginBottom: 16,
    },
    cardContainer: {
      width: '100%',
      borderRadius: isLarge ? 24 : 16,
      overflow: 'hidden',
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderWidth: isLarge ? 0 : 1,
      borderColor: isDark ? '#374151' : '#e5e7eb',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isLarge ? 4 : 2 },
      shadowOpacity: 0.15,
      shadowRadius: isLarge ? 8 : 4,
      elevation: isLarge ? 8 : 4,
    },
    gradient: {
      width: '100%',
      padding: isLarge ? 24 : 16,
      borderRadius: isLarge ? 24 : 16,
      alignItems: 'center',
      minHeight: isLarge ? 280 : 180,
      justifyContent: 'center',
    },
    iconContainer: {
      width: isLarge ? 80 : 56,
      height: isLarge ? 80 : 56,
      borderRadius: isLarge ? 40 : 28,
      backgroundColor: 'rgba(255,255,255,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isLarge ? 16 : 12,
    },
    iconEmoji: {
      fontSize: isLarge ? 36 : 28,
    },
    contentContainer: {
      alignItems: 'center',
      width: '100%',
    },
    appName: {
      fontWeight: '700',
      fontSize: isLarge ? 22 : 16,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 4,
    },
    description: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 8,
      paddingHorizontal: 8,
      lineHeight: 20,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    stars: {
      color: '#fbbf24',
      fontWeight: 'bold',
      fontSize: 14,
    },
    ratingText: {
      color: 'rgba(255,255,255,0.75)',
      marginLeft: 4,
      fontSize: 12,
    },
    openButton: {
      backgroundColor: 'rgba(255,255,255,0.25)',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      marginTop: 8,
    },
    openButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 14,
    },
  });

  const cardContent = (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>{getEmojiForIcon(app.icon)}</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.appName}>{app.name}</Text>
          {isLarge && (
            <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
              {app.description}
            </Text>
          )}
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>
              {'★'.repeat(Math.floor(app.rating || 0))}{'☆'.repeat(5 - Math.floor(app.rating || 0))}
            </Text>
            <Text style={styles.ratingText}>({app.rating?.toFixed(1) || 'N/A'})</Text>
          </View>
          <TouchableOpacity
            style={styles.openButton}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.openButtonText}>Open</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <TouchableOpacity 
      style={styles.touchable}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {cardContent}
    </TouchableOpacity>
  );
}