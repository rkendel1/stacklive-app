import { getIconComponent } from '@/constants/nativeIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { MiniApp } from '@/src/lib/miniapps';
import { useRef } from 'react';
import { Animated, ImageBackground, Linking, Text, TouchableOpacity, View } from 'react-native';
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

export default function AppCard({ app, onPress = () => app.launchUrl && Linking.openURL(app.launchUrl), size = 'small' }: AppCardProps) {
  const colorScheme = useColorScheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const isLarge = size === 'large';
  const palette = ['orange', 'blue', 'green', 'purple', 'pink'];
  const hash = app.id.charCodeAt(0) % palette.length;
  const defaultColor = palette[hash];
  const cardBg = app.iconBackgroundColor?.replace('bg-', '') || defaultColor;
  const match = cardBg.match(/(\w+)-(\d+)/);
  const color = match ? match[1] : defaultColor;
  const shade = match ? parseInt(match[2]) : 500;

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
    : [colorMap[color]?.[500] || '#f97316'];

  const textColor = isLarge ? 'text-white' : 'dark:text-white';
  const iconBg = isLarge ? 'bg-white/20' : 'transparent';
  const descColor = isLarge ? 'text-white/80' : 'text-gray-600 dark:text-gray-300';
  const secondaryColor = isLarge ? 'text-white/70' : 'text-gray-500';

  const shadowStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isLarge ? 4 : 2 },
    shadowOpacity: 0.25,
    shadowRadius: isLarge ? 8 : 3.84,
    elevation: isLarge ? 8 : 5,
  };

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

  const cardContent = (
    <Animated.View style={{ transform: [{ scale: scaleValue }], ...shadowStyle }} className={isLarge 
      ? `w-full flex-col items-center p-6 rounded-3xl relative ${textColor}` 
      : `w-full flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 ${textColor}`
    }>
      {isLarge && app.screenshots?.[0] ? (
        <ImageBackground
          source={{ uri: app.screenshots[0] }}
          resizeMode="cover"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          imageStyle={{ borderRadius: 24 }}
          blurRadius={5}
        >
          <View className="absolute inset-0 bg-black/30 rounded-3xl" />
          <View className="flex-1 w-full justify-center items-center relative z-10">
            <View className={`${isLarge ? 'w-32 h-32 mb-4 rounded-full' : 'w-16 h-16 mb-3 rounded-full'} ${iconBg} justify-center items-center`}>
              <Text className={`text-${isLarge ? '4xl' : '3xl'}`}>{getEmojiForIcon(app.icon)}</Text>
            </View>
            <View className="flex-col items-center w-full">
              <Text className={`font-semibold text-${isLarge ? '2xl' : 'lg'} ${textColor} text-center mb-1`}>{app.name}</Text>
              {isLarge && (
                <Text className={`${descColor} text-sm text-center mb-2 px-2`} numberOfLines={3} ellipsizeMode="tail">{app.description}</Text>
              )}
              <View className="flex-row items-center mb-2">
                <Text className="text-yellow-400 font-bold text-base">
                  {'★'.repeat(Math.floor(app.rating || 0))}{'☆'.repeat(5 - Math.floor(app.rating || 0))}
                </Text>
                <Text className={`${secondaryColor} ml-1 text-sm`}>({app.rating?.toFixed(1) || 'N/A'})</Text>
              </View>
              <TouchableOpacity
                className={`bg-blue-500 px-4 py-2 rounded-full mt-2 ${isLarge ? 'w-full' : ''}`}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <Text className="text-white font-medium text-sm">Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="w-full rounded-3xl"
        >
          <View className="flex-1 w-full justify-center items-center">
            <View className={`${isLarge ? 'w-32 h-32 mb-4 rounded-full' : 'w-16 h-16 mb-3 rounded-full'} ${iconBg} justify-center items-center`}>
              <Text className={`text-${isLarge ? '4xl' : '3xl'}`}>{getEmojiForIcon(app.icon)}</Text>
            </View>
            <View className="flex-col items-center w-full">
              <Text className={`font-semibold text-${isLarge ? '2xl' : 'lg'} ${textColor} text-center mb-1`}>{app.name}</Text>
              {isLarge && (
                <Text className={`${descColor} text-sm text-center mb-2 px-2`} numberOfLines={3} ellipsizeMode="tail">{app.description}</Text>
              )}
              <View className="flex-row items-center mb-2">
                <Text className="text-yellow-400 font-bold text-base">
                  {'★'.repeat(Math.floor(app.rating || 0))}{'☆'.repeat(5 - Math.floor(app.rating || 0))}
                </Text>
                <Text className={`${secondaryColor} ml-1 text-sm`}>({app.rating?.toFixed(1) || 'N/A'})</Text>
              </View>
              <TouchableOpacity
                className={`bg-blue-500 px-4 py-2 rounded-full mt-2 ${isLarge ? 'w-full' : ''}`}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <Text className="text-white font-medium text-sm">Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      )}
    </Animated.View>
  );

  return isLarge && app.screenshots?.[0] ? (
    <TouchableOpacity 
      className={`w-full mb-4 ${textColor}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {cardContent}
    </TouchableOpacity>
  ) : (
    <TouchableOpacity 
      className="w-full mb-4"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {cardContent}
    </TouchableOpacity>
  );
}