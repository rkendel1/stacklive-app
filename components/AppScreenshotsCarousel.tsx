import { View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useMemo } from 'react';
import { Animated, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

interface AppScreenshotsCarouselProps {
  screenshots: string[];
  onClose: () => void;
  initialIndex?: number;
}

const { width, height } = Dimensions.get('window');

export default function AppScreenshotsCarousel({ screenshots, onClose, initialIndex }: AppScreenshotsCarouselProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value < 1.1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    });

  const gesture = useMemo(
    () => Gesture.Simultaneous(pinchGesture, panGesture),
    []
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const renderScreenshot = ({ item }: { item: string }) => (
    <View style={styles.screenshotContainer}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.screenshot, animatedStyle]}>
          <Image source={{ uri: item }} style={styles.screenshotImage} resizeMode="contain" />
        </Animated.View>
      </GestureDetector>
    </View>
  );

  const getItemLayout = (data: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

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
        initialScrollIndex={initialIndex || 0}
        getItemLayout={getItemLayout}
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
    height: height,
  },
  screenshotContainer: {
    width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenshot: {
    width: width,
    height: height,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenshotImage: {
    width: width,
    height: height,
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