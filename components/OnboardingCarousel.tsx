import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export interface OnboardingPage {
  id: string;
  title: string;
  description: string;
  image?: any; // Image source
  backgroundColor?: string;
}

interface OnboardingCarouselProps {
  /** Callback when carousel is completed */
  onComplete: () => void;
  /** Custom pages (optional, uses default if not provided) */
  pages?: OnboardingPage[];
}

const defaultPages: OnboardingPage[] = [
  {
    id: '1',
    title: 'One-tap apps that already know you',
    description: 'Discover amazing apps tailored just for you. No setup required—we handle everything.',
    backgroundColor: '#4A90D9',
  },
  {
    id: '2',
    title: 'Join millions of users',
    description: 'Over 50M people trust StackLive for their daily app discovery. See what\'s trending and never miss out.',
    backgroundColor: '#7B68EE',
  },
  {
    id: '3',
    title: 'Stay in the loop',
    description: 'Enable notifications to get personalized recommendations and never miss a hot new app.',
    backgroundColor: '#FF6B6B',
  },
  {
    id: '4',
    title: 'Ready to explore?',
    description: 'Start discovering apps that match your interests. Your personalized feed awaits!',
    backgroundColor: '#2ECC71',
  },
];

export default function OnboardingCarousel({ 
  onComplete, 
  pages = defaultPages 
}: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderPage = ({ item, index }: { item: OnboardingPage; index: number }) => (
    <View
      style={[
        styles.page,
        { backgroundColor: item.backgroundColor || '#000' },
      ]}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderEmoji}>
              {index === 0 ? '🚀' : index === 1 ? '👥' : index === 2 ? '🔔' : '✨'}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {pages.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );

  const isLastPage = currentIndex === pages.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />
      
      <View style={styles.footer}>
        {renderDots()}
        
        <View style={styles.buttonsContainer}>
          {!isLastPage && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.nextButton,
              isLastPage && styles.getStartedButton,
            ]}
          >
            <Text style={styles.nextText}>
              {isLastPage ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  page: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 150,
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 72,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginLeft: 'auto',
  },
  getStartedButton: {
    flex: 1,
    alignItems: 'center',
  },
  nextText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
