import { View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AppScreenshotsCarouselProps {
  screenshots: string[];
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function AppScreenshotsCarousel({ screenshots, onClose }: AppScreenshotsCarouselProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';

  const renderScreenshot = ({ item }: { item: string }) => (
    <View style={styles.screenshotContainer}>
      <Image source={{ uri: item }} style={styles.screenshot} resizeMode="contain" />
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]} lightColor="#000" darkColor="#000">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <FlatList
        data={screenshots}
        renderItem={renderScreenshot}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <View style={styles.closeIcon} />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  list: {
    flex: 1,
    width: width,
  },
  listContent: {
    height: height * 0.8,
  },
  screenshotContainer: {
    width,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenshot: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
});