import { View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [localScreenshots, setLocalScreenshots] = useState(() => [...screenshots]);
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';

  // Clamp initialIndex to valid range to prevent FlatList errors
  const effectiveInitialIndex = localScreenshots.length > 0 
    ? Math.max(0, Math.min(initialIndex ?? 0, localScreenshots.length - 1))
    : 0;

  // Early return if no screenshots
  if (localScreenshots.length === 0) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]} lightColor="#000" darkColor="#000">
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.screenshotContainer}>
          <Text style={styles.noScreenshotsText}>No screenshots available</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <View style={styles.closeIcon} />
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const flatListRef = useRef<FlatList | null>(null);
  const [listReady, setListReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (listReady && mounted && effectiveInitialIndex > 0) {
      try {
        flatListRef.current?.scrollToIndex({
          index: effectiveInitialIndex,
          animated: false,
        });
      } catch (error) {
        // Handle error gracefully, e.g. index out of range
        // console.warn('Failed to scroll to index:', error);
      }
    }
  }, [listReady, effectiveInitialIndex, mounted]);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchGesture = useMemo(() => Gesture.Pinch()
    .onUpdate((event) => {
      'worklet';
      scale.value *= event.scale;
      if (scale.value < 1) scale.value = 1;
      if (scale.value > 3) scale.value = 3;
    })
    .onEnd(() => {
      'worklet';
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
    }), [scale]);

  const panGesture = useMemo(() => Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      if (scale.value > 1) {
        translateX.value += event.translationX;
        translateY.value += event.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      if (scale.value < 1.1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    }), [scale, translateX, translateY]);

  const gesture = useMemo(
    () => Gesture.Simultaneous(pinchGesture, panGesture),
    [pinchGesture, panGesture]
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
      {mounted ? (
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.screenshot, animatedStyle]}>
            <Image source={{ uri: item }} style={styles.screenshotImage} resizeMode="contain" />
          </Animated.View>
        </GestureDetector>
      ) : (
        <Animated.View style={[styles.screenshot, animatedStyle]}>
          <Image source={{ uri: item }} style={styles.screenshotImage} resizeMode="contain" />
        </Animated.View>
      )}
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
      {mounted && (
        <FlatList
          ref={flatListRef}
          data={localScreenshots}
          renderItem={renderScreenshot}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onLayout={() => setListReady(true)}
        />
      )}
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
  noScreenshotsText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
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