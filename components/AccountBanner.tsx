import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AccountBannerProps {
  /** Whether the banner is visible */
  visible: boolean;
  /** Callback when banner is pressed */
  onPress: () => void;
  /** Custom message */
  message?: string;
}

export default function AccountBanner({
  visible,
  onPress,
  message = 'Complete your account to save favorites',
}: AccountBannerProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { paddingBottom: 8 + (insets.bottom > 0 ? 0 : 8) }, { bottom: insets.bottom + 60 }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.cta}>Sign up →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  cta: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
