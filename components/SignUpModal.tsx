import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

interface SignUpModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal is dismissed */
  onDismiss: () => void;
  /** Callback when user signs in with Apple */
  onAppleSignIn: () => void;
  /** Callback when user signs in with Google */
  onGoogleSignIn: () => void;
  /** Callback when user signs in with email */
  onEmailSignIn: (email: string) => void;
  /** Callback when user continues as guest */
  onContinueAsGuest: () => void;
  /** Custom title (for returning users) */
  title?: string;
  /** Custom subtitle (for returning users) */
  subtitle?: string;
  /** Show incentive text */
  incentive?: string;
  /** Whether to use full-screen interstitial (for users who dismissed 2+ times) */
  fullScreen?: boolean;
}

export default function SignUpModal({
  visible,
  onDismiss,
  onAppleSignIn,
  onGoogleSignIn,
  onEmailSignIn,
  onContinueAsGuest,
  title = 'Create your account',
  subtitle = 'Sign up to save your favorites and get personalized recommendations.',
  incentive,
  fullScreen = false,
}: SignUpModalProps) {
  const insets = useSafeAreaInsets();
  const [showEmailInput, setShowEmailInput] = React.useState(false);
  const [email, setEmail] = React.useState('');

  // Email validation regex pattern
  const isValidEmail = (emailToValidate: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate.trim());
  };

  const handleEmailSubmit = useCallback(() => {
    if (isValidEmail(email)) {
      onEmailSignIn(email.trim());
      setShowEmailInput(false);
      setEmail('');
    } else {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
  }, [email, onEmailSignIn]);

  const handleContinueAsGuest = useCallback(() => {
    setShowEmailInput(false);
    setEmail('');
    onContinueAsGuest();
  }, [onContinueAsGuest]);

  const modalHeight = fullScreen ? height : height * 0.5;

  const renderContent = () => (
    <View
      style={[
        styles.content,
        fullScreen ? styles.fullScreenContent : styles.halfSheetContent,
        { paddingBottom: insets.bottom + 20 },
      ]}
    >
      {/* Handle bar for half-sheet */}
      {!fullScreen && <View style={styles.handleBar} />}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {incentive && (
          <View style={styles.incentiveContainer}>
            <Text style={styles.incentive}>{incentive}</Text>
          </View>
        )}
      </View>

      {/* Sign-up buttons */}
      <View style={styles.buttonsContainer}>
        {showEmailInput ? (
          <View style={styles.emailInputContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <View style={styles.emailButtonsRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowEmailInput(false)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.continueButton, !email.trim() && styles.disabledButton]}
                onPress={handleEmailSubmit}
                disabled={!email.trim()}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Apple Sign-In - Largest button, highest conversion */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.button, styles.appleButton]}
                onPress={onAppleSignIn}
              >
                <FontAwesome name="apple" size={20} color="#fff" />
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
            )}

            {/* Google Sign-In */}
            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={onGoogleSignIn}
            >
              <FontAwesome name="google" size={20} color="#DB4437" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Email Sign-In */}
            <TouchableOpacity
              style={[styles.button, styles.emailButton]}
              onPress={() => setShowEmailInput(true)}
            >
              <FontAwesome name="envelope" size={18} color="#666" />
              <Text style={styles.emailButtonText}>Continue with Email</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Continue as Guest - small gray text */}
      <TouchableOpacity
        style={styles.guestButton}
        onPress={handleContinueAsGuest}
      >
        <Text style={styles.guestButtonText}>Maybe later</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={!fullScreen}
      onRequestClose={onDismiss}
    >
      {fullScreen ? (
        <View style={styles.fullScreenContainer}>{renderContent()}</View>
      ) : (
        <View style={styles.modalContainer}>
          <Pressable style={styles.backdrop} onPress={onDismiss} />
          {renderContent()}
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 100, // Tab bar height (60px + ~23px safe area)
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  halfSheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  fullScreenContent: {
    flex: 1,
    paddingTop: 60,
    justifyContent: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  incentiveContainer: {
    marginTop: 12,
    backgroundColor: '#F0F8FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  incentive: {
    fontSize: 13,
    color: '#4A90D9',
    fontWeight: '600',
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  emailButton: {
    backgroundColor: '#f5f5f5',
  },
  emailButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  emailInputContainer: {
    gap: 12,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  emailButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4A90D9',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  guestButtonText: {
    color: '#999',
    fontSize: 14,
  },
});
