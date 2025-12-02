import { getIconComponent } from '@/constants/nativeIcons';
import { MiniApp } from '@/src/lib/miniapps';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import { Animated, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from './useColorScheme';

interface AppCardProps {
  app: MiniApp;
  onPress?: () => void;
  size?: 'compact' | 'small' | 'large';
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

const colorMap: Record<string, Record<number, string>> = {
  orange: { 400: '#fed7aa', 500: '#f97316', 600: '#ea580c' },
  blue: { 400: '#dbeafe', 500: '#3b82f6', 600: '#2563eb' },
  green: { 400: '#d1fae5', 500: '#10b981', 600: '#059669' },
  pink: { 400: '#fce7f3', 500: '#ec4899', 600: '#db2777' },
  purple: { 400: '#f3e8ff', 500: '#a855f7', 600: '#9333ea' },
  indigo: { 400: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5' },
};

const getGradientColors = (app: MiniApp, isLarge?: boolean): readonly [string, string] => {
  if (app.primaryColor && app.secondaryColor) {
    return [app.primaryColor, app.secondaryColor];
  }
  if (app.primaryColor) {
    return [app.primaryColor, app.primaryColor];
  }
  const iconBgColor = app.iconBackgroundColor;
  const cardBg = iconBgColor?.replace('bg-', '') || 'blue';
  const match = cardBg.match(/(\w+)-(\d+)/);
  const color = match ? match[1] : 'blue';
  return isLarge 
    ? [colorMap[color]?.[400] || '#fed7aa', colorMap[color]?.[600] || '#ea580c']
    : [colorMap[color]?.[500] || '#f97316', colorMap[color]?.[600] || '#ea580c'];
};

// Base styles that don't depend on props
const baseStyles = StyleSheet.create({
  touchable: {
    width: '100%',
    marginBottom: 16,
  },
  compactTouchable: {
    width: '100%',
    marginBottom: 12,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  compactContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 14,
  },
  compactStars: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 12,
  },
  ratingText: {
    color: 'rgba(255,255,255,0.75)',
    marginLeft: 4,
    fontSize: 12,
  },
  compactRatingText: {
    color: 'rgba(255,255,255,0.75)',
    marginLeft: 4,
    fontSize: 11,
  },
  openButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  compactOpenButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  openButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  compactOpenButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
    lineHeight: 20,
  },
  compactDescription: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
});

export default function AppCard({ app, onPress, size = 'small' }: AppCardProps) {
  const colorScheme = useColorScheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const isDark = colorScheme === 'dark';

  const isLarge = size === 'large';
  const isCompact = size === 'compact';

  const IconComponent = getIconComponent(app.icon);
  const gradientColors = getGradientColors(app, isLarge);

  const [iconError, setIconError] = useState(false);

  // Default handler if onPress is not provided
  const handlePress = onPress || (() => {
    if (app.launchUrl) {
      Linking.openURL(app.launchUrl);
    }
  });

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

  // Memoize dynamic styles based on props
  const dynamicStyles = useMemo(() => {
    if (isCompact) {
      return {
        cardContainer: {
          width: '100%' as const,
          borderRadius: 12,
          overflow: 'hidden' as const,
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderWidth: 1,
          borderColor: isDark ? '#374151' : '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        },
        gradient: {
          width: '100%' as const,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          minHeight: 80, // About 1 inch tall
        },
        iconContainer: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: 'transparent',
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          marginRight: 12,
        },
        iconEmoji: {
          fontSize: 24,
        },
        appName: {
          fontWeight: '700' as const,
          fontSize: 15,
          color: '#ffffff',
          marginBottom: 2,
        },
      };
    }
    return {
      cardContainer: {
        width: '100%' as const,
        borderRadius: isLarge ? 24 : 16,
        overflow: 'hidden' as const,
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
        width: '100%' as const,
        padding: isLarge ? 24 : 16,
        borderRadius: isLarge ? 24 : 16,
        alignItems: 'center' as const,
        minHeight: isLarge ? 280 : 180,
        justifyContent: 'center' as const,
      },
      iconContainer: {
        width: isLarge ? 80 : 56,
        height: isLarge ? 80 : 56,
        borderRadius: isLarge ? 40 : 28,
        backgroundColor: 'transparent',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        marginBottom: isLarge ? 16 : 12,
      },
      iconEmoji: {
        fontSize: isLarge ? 36 : 28,
      },
      appName: {
        fontWeight: '700' as const,
        fontSize: isLarge ? 22 : 16,
        color: '#ffffff',
        textAlign: 'center' as const,
        marginBottom: 4,
      },
    };
  }, [isLarge, isCompact, isDark]);

  // Render compact card layout (horizontal)
  if (isCompact) {
    return (
      <TouchableOpacity 
        style={baseStyles.compactTouchable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View style={[dynamicStyles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={dynamicStyles.gradient}
          >
            <View style={dynamicStyles.iconContainer}>
              {app.iconUrl && !iconError ? (
                <ExpoImage
                  source={{ uri: app.iconUrl }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  onError={() => setIconError(true)}
                />
              ) : (
                <IconComponent size={40} color="#fff" />
              )}
            </View>
            <View style={baseStyles.compactContentContainer}>
              <Text style={dynamicStyles.appName} numberOfLines={1}>{app.name}</Text>
              <Text style={baseStyles.compactDescription} numberOfLines={1} ellipsizeMode="tail">
                {app.description}
              </Text>
              <View style={baseStyles.compactRatingRow}>
                <Text style={baseStyles.compactStars}>
                  {'★'.repeat(Math.floor(app.rating || 0))}{'☆'.repeat(5 - Math.floor(app.rating || 0))}
                </Text>
                <Text style={baseStyles.compactRatingText}>({app.rating?.toFixed(1) || 'N/A'})</Text>
              </View>
            </View>
            <View style={baseStyles.compactOpenButton}>
              <Text style={baseStyles.compactOpenButtonText}>Open</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  const cardContent = (
    <Animated.View style={[dynamicStyles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dynamicStyles.gradient}
      >
        <View style={dynamicStyles.iconContainer}>
          {app.iconUrl && !iconError ? (
            <ExpoImage
              source={{ uri: app.iconUrl }}
              style={{ 
                width: isLarge ? 64 : 48, 
                height: isLarge ? 64 : 48, 
                borderRadius: isLarge ? 32 : 24 
              }}
              contentFit="contain"
              cachePolicy="memory-disk"
              onError={() => setIconError(true)}
            />
          ) : (
            <IconComponent size={isLarge ? 64 : 48} color="#fff" />
          )}
        </View>
        <View style={baseStyles.contentContainer}>
          <Text style={dynamicStyles.appName}>{app.name}</Text>
          {isLarge && (
            <Text style={baseStyles.description} numberOfLines={3} ellipsizeMode="tail">
              {app.description}
            </Text>
          )}
          <View style={baseStyles.ratingRow}>
            <Text style={baseStyles.stars}>
              {'★'.repeat(Math.floor(app.rating || 0))}{'☆'.repeat(5 - Math.floor(app.rating || 0))}
            </Text>
            <Text style={baseStyles.ratingText}>({app.rating?.toFixed(1) || 'N/A'})</Text>
          </View>
          <TouchableOpacity
            style={baseStyles.openButton}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={baseStyles.openButtonText}>Open</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <TouchableOpacity 
      style={baseStyles.touchable}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {cardContent}
    </TouchableOpacity>
  );
}