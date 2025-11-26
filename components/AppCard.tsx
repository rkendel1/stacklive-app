import { getIconComponent } from '@/constants/nativeIcons';
import { MiniApp } from '@/src/lib/miniapps';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from './useColorScheme';

interface AppCardProps {
  app: MiniApp;
  onPress?: () => void;
  size?: 'small' | 'large';
}

export default function AppCard({ app, onPress = () => app.launchUrl && Linking.openURL(app.launchUrl), size = 'small' }: AppCardProps) {
  const colorScheme = useColorScheme();
  const IconComponent = getIconComponent(app.icon);

  const isLarge = size === 'large';
  const palette = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
  const hash = app.id.charCodeAt(0) % palette.length;
  const defaultBg = palette[hash];
  const cardBg = app.iconBackgroundColor || defaultBg;
  const gradientBg = isLarge ? `bg-gradient-to-b from-${cardBg.replace('bg-', '')}-400 to-${cardBg.replace('bg-', '')}-600` : cardBg;
  const textColor = isLarge ? 'text-white' : 'dark:text-white';
  const iconBg = isLarge ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800';
  const descColor = isLarge ? 'text-white/80' : 'text-gray-600 dark:text-gray-300';
  const secondaryColor = isLarge ? 'text-white/70' : 'text-gray-500';

  return (
    <TouchableOpacity 
      className={isLarge 
        ? `w-full flex-col items-center p-6 rounded-3xl shadow-xl ${gradientBg} mb-4 ${textColor}` 
        : `w-full flex-col items-center p-4 shadow-md rounded-xl ${textColor}`
      } 
      onPress={onPress}
    >
      <View className={`${isLarge ? 'w-32 h-32 mb-4 rounded-full' : 'w-16 h-16 mb-3 rounded-full'} ${iconBg} justify-center items-center shadow-lg`}>
        <IconComponent size={isLarge ? 56 : 32} color="#fff" />
      </View>
      <View className="flex-col items-center w-full">
        <Text className={`font-semibold text-${isLarge ? '2xl' : 'lg'} ${textColor} text-center mb-1`}>{app.name}</Text>
        <Text className={`${descColor} text-sm text-center mb-2 px-2`}>{app.description}</Text>
        <View className="flex-row items-center mb-3">
          <Text className="text-yellow-400 font-medium text-base">{app.rating || 0} ★</Text>
          <Text className={`${secondaryColor} ml-2 text-sm`}>{app.reviews}</Text>
        </View>
        {!isLarge && (
          <TouchableOpacity className="w-full bg-blue-500 py-2 rounded-lg" onPress={onPress}>
            <Text className="text-white font-medium text-sm text-center">Open</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}