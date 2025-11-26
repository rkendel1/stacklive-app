import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Configuration constants for onboarding flow
 */
export const ONBOARDING_CONFIG = {
  /** Maximum number of sign-up prompts to show before permanently suppressing */
  maxPromptCount: 10,
  /** Sessions 1-4 show prompt on cold open */
  earlyStageSessions: 4,
  /** After session 5, reduce prompt frequency */
  reducedFrequencySessionStart: 5,
  /** Show prompt once every N days after early stage */
  reducedFrequencyDays: 2,
  /** Number of high-intent actions before prompting */
  highIntentActionsThreshold: 5,
  /** Maximum prompts per day for high-intent users */
  maxPromptsPerDay: 1,
};

interface OnboardingState {
  /** Whether this is the user's first time opening the app */
  isFirstLaunch: boolean;
  /** Whether user has completed the onboarding carousel */
  hasCompletedOnboarding: boolean;
  /** Whether user has an account (signed in with Apple/Google/Email) */
  hasAccount: boolean;
  /** Total number of app sessions (cold opens) */
  sessionCount: number;
  /** Total number of sign-up prompts shown */
  promptCount: number;
  /** Number of high-intent actions (likes, saves, follows) */
  highIntentActions: number;
  /** Timestamp of last prompt shown */
  lastPromptTimestamp: number | null;
  /** User's display name (from Apple/Google if available) */
  displayName: string | null;
  /** User's email */
  email: string | null;
}

interface OnboardingContextType extends OnboardingState {
  /** Mark onboarding carousel as completed */
  completeOnboarding: () => Promise<void>;
  /** Sign in with account (Apple, Google, or Email) */
  signIn: (method: 'apple' | 'google' | 'email', displayName?: string, email?: string) => Promise<void>;
  /** Continue as guest (dismiss sign-up) */
  continueAsGuest: () => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Track a high-intent action */
  trackHighIntentAction: () => Promise<void>;
  /** Determine if we should show the sign-up prompt */
  shouldShowSignUpPrompt: () => boolean;
  /** Record that a prompt was shown */
  recordPromptShown: () => Promise<void>;
  /** Reset onboarding state (for testing) */
  resetOnboarding: () => Promise<void>;
  /** Initialize/increment session count */
  initSession: () => Promise<void>;
  /** Loading state */
  isLoading: boolean;
}

const STORAGE_KEY = 'onboarding_state';

const defaultState: OnboardingState = {
  isFirstLaunch: true,
  hasCompletedOnboarding: false,
  hasAccount: false,
  sessionCount: 0,
  promptCount: 0,
  highIntentActions: 0,
  lastPromptTimestamp: null,
  displayName: null,
  email: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as OnboardingState;
          setState({
            ...defaultState,
            ...parsed,
            // After first launch, set isFirstLaunch to false
            isFirstLaunch: false,
          });
        }
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  // Persist state changes
  const persistState = useCallback(async (newState: OnboardingState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to persist onboarding state:', error);
    }
  }, []);

  const initSession = useCallback(async () => {
    // Check if this is the first session before incrementing
    const isFirstSession = state.sessionCount === 0;
    const newState = {
      ...state,
      sessionCount: state.sessionCount + 1,
      isFirstLaunch: isFirstSession,
    };
    setState(newState);
    await persistState(newState);
  }, [state, persistState]);

  const completeOnboarding = useCallback(async () => {
    const newState = {
      ...state,
      hasCompletedOnboarding: true,
    };
    setState(newState);
    await persistState(newState);
  }, [state, persistState]);

  const signIn = useCallback(async (
    method: 'apple' | 'google' | 'email',
    displayName?: string,
    email?: string
  ) => {
    const newState = {
      ...state,
      hasAccount: true,
      displayName: displayName || state.displayName,
      email: email || state.email,
    };
    setState(newState);
    await persistState(newState);
  }, [state, persistState]);

  const continueAsGuest = useCallback(async () => {
    const newState = {
      ...state,
      promptCount: state.promptCount + 1,
      lastPromptTimestamp: Date.now(),
    };
    setState(newState);
    await persistState(newState);
  }, [state, persistState]);

  const signOut = useCallback(async () => {
    const newState = {
      ...state,
      hasAccount: false,
      displayName: null,
      email: null,
    };
    setState(newState);
    await persistState(newState);
  }, [state, persistState]);

  const trackHighIntentAction = useCallback(async () => {
    if (state.hasAccount) return; // Don't track if already has account
    
    const newState = {
      ...state,
      highIntentActions: state.highIntentActions + 1,
    };
    setState(newState);
    await persistState(newState);
  }, [state, persistState]);

  const recordPromptShown = useCallback(async () => {
    const newState = {
      ...state,
      promptCount: state.promptCount + 1,
      lastPromptTimestamp: Date.now(),
    };
    setState(newState);
    await persistState(newState);
  }, [state, persistState]);

  const shouldShowSignUpPrompt = useCallback((): boolean => {
    // Don't show if already has account
    if (state.hasAccount) return false;
    
    // Don't show if max prompts reached
    if (state.promptCount >= ONBOARDING_CONFIG.maxPromptCount) return false;
    
    // First launch - show after onboarding carousel
    if (state.isFirstLaunch && state.hasCompletedOnboarding) return true;
    
    // Sessions 2-4: show on every cold open
    if (
      state.sessionCount >= 2 &&
      state.sessionCount <= ONBOARDING_CONFIG.earlyStageSessions
    ) {
      return true;
    }
    
    // Sessions 5+: only show on high-intent actions
    if (state.sessionCount >= ONBOARDING_CONFIG.reducedFrequencySessionStart) {
      // Check if enough high-intent actions
      if (state.highIntentActions >= ONBOARDING_CONFIG.highIntentActionsThreshold) {
        // Check frequency (once per day max)
        if (!state.lastPromptTimestamp) return true;
        
        const daysSinceLastPrompt = 
          (Date.now() - state.lastPromptTimestamp) / (1000 * 60 * 60 * 24);
        return daysSinceLastPrompt >= ONBOARDING_CONFIG.maxPromptsPerDay;
      }
    }
    
    return false;
  }, [state]);

  const resetOnboarding = useCallback(async () => {
    setState(defaultState);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: OnboardingContextType = {
    ...state,
    completeOnboarding,
    signIn,
    continueAsGuest,
    signOut,
    trackHighIntentAction,
    shouldShowSignUpPrompt,
    recordPromptShown,
    resetOnboarding,
    initSession,
    isLoading,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
