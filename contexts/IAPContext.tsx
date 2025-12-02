import * as InAppPurchases from 'expo-in-app-purchases';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  connectAsync,
  disconnectAsync,
  finishTransactionAsync,
  getAllProductIds,
  getProductsAsync,
  IAPProduct,
  IAPPurchase,
  isIAPAvailable,
  purchaseItemAsync,
  restorePurchasesAsync,
  setPurchaseListener,
  verifyPurchaseAsync,
} from '../src/lib/iap';

/**
 * State of the IAP context.
 */
interface IAPState {
  /** Whether IAP is available on this platform */
  isAvailable: boolean;
  /** Whether the IAP service is initialized */
  isInitialized: boolean;
  /** Whether a purchase is currently in progress */
  isPurchasing: boolean;
  /** Whether purchases are being restored */
  isRestoring: boolean;
  /** Available products for purchase */
  products: IAPProduct[];
  /** User's purchased product IDs */
  purchasedProductIds: string[];
  /** Current error message, if any */
  error: string | null;
}

/**
 * Actions available in the IAP context.
 */
interface IAPActions {
  /** Initialize the IAP service */
  initialize: () => Promise<void>;
  /** Purchase a product by ID */
  purchase: (productId: string) => Promise<boolean>;
  /** Restore previous purchases */
  restore: () => Promise<void>;
  /** Clear any error state */
  clearError: () => void;
  /** Check if a product has been purchased */
  isPurchased: (productId: string) => boolean;
  /** Get a product by ID */
  getProduct: (productId: string) => IAPProduct | undefined;
}

type IAPContextType = IAPState & IAPActions;

const IAPContext = createContext<IAPContextType | undefined>(undefined);

interface IAPProviderProps {
  children: ReactNode;
}

export function IAPProvider({ children }: IAPProviderProps) {
  const [state, setState] = useState<IAPState>({
    isAvailable: isIAPAvailable(),
    isInitialized: false,
    isPurchasing: false,
    isRestoring: false,
    products: [],
    purchasedProductIds: [],
    error: null,
  });

  // Use ref to access current products without causing callback recreation
  const productsRef = useRef<IAPProduct[]>([]);
  productsRef.current = state.products;

  // Handle incoming purchases
  const handlePurchaseUpdate = useCallback(async (purchase: IAPPurchase) => {
    try {
      // Verify the purchase with our backend
      const verifyResult = await verifyPurchaseAsync(purchase);

      if (verifyResult.success && verifyResult.data?.verified) {
        // Add to purchased products
        setState((prev) => ({
          ...prev,
          purchasedProductIds: [...new Set([...prev.purchasedProductIds, purchase.productId])],
        }));

        // Determine if this is a consumable product using ref to avoid dependency
        const product = productsRef.current.find((p) => p.productId === purchase.productId);
        const isConsumable = product?.type === 'consumable';

        // Finish the transaction
        await finishTransactionAsync(purchase, isConsumable);
      } else {
        setState((prev) => ({
          ...prev,
          error: 'Purchase verification failed',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to process purchase',
      }));
    } finally {
      setState((prev) => ({ ...prev, isPurchasing: false }));
    }
  }, []);

  // Initialize IAP service
  const initialize = useCallback(async () => {
    if (!state.isAvailable || state.isInitialized) {
      return;
    }

    try {
      // Connect to IAP service
      const connectResult = await connectAsync();
      if (!connectResult.success) {
        setState((prev) => ({
          ...prev,
          error: connectResult.error || 'Failed to connect to IAP service',
        }));
        return;
      }

      // Set up purchase listener
      setPurchaseListener(handlePurchaseUpdate);

      // Load products
      const productIds = getAllProductIds();
      if (productIds.length > 0) {
        const productsResult = await getProductsAsync(productIds);
        if (productsResult.success && productsResult.data) {
          setState((prev) => ({
            ...prev,
            products: productsResult.data || [],
          }));
        }
      }

      // Restore purchases to check what user already owns
      const restoreResult = await restorePurchasesAsync();
      if (restoreResult.success && restoreResult.data) {
        const purchasedIds = restoreResult.data
          .filter((p) => p.purchaseState === InAppPurchases.InAppPurchaseState.PURCHASED)
          .map((p) => p.productId);
        setState((prev) => ({
          ...prev,
          purchasedProductIds: [...new Set(purchasedIds)],
        }));
      }

      setState((prev) => ({ ...prev, isInitialized: true }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize IAP',
      }));
    }
  }, [state.isAvailable, state.isInitialized, handlePurchaseUpdate]);

  // Purchase a product
  const purchase = useCallback(async (productId: string): Promise<boolean> => {
    if (!state.isInitialized) {
      setState((prev) => ({ ...prev, error: 'IAP not initialized' }));
      return false;
    }

    if (state.isPurchasing) {
      return false;
    }

    setState((prev) => ({ ...prev, isPurchasing: true, error: null }));

    const result = await purchaseItemAsync(productId);
    if (!result.success) {
      setState((prev) => ({
        ...prev,
        isPurchasing: false,
        error: result.error || 'Purchase failed',
      }));
      return false;
    }

    // Purchase flow continues through the purchase listener
    return true;
  }, [state.isInitialized, state.isPurchasing]);

  // Restore purchases
  const restore = useCallback(async () => {
    if (!state.isInitialized) {
      setState((prev) => ({ ...prev, error: 'IAP not initialized' }));
      return;
    }

    setState((prev) => ({ ...prev, isRestoring: true, error: null }));

    try {
      const result = await restorePurchasesAsync();
      if (result.success && result.data) {
        const purchasedIds = result.data
          .filter((p) => p.purchaseState === InAppPurchases.InAppPurchaseState.PURCHASED)
          .map((p) => p.productId);
        setState((prev) => ({
          ...prev,
          purchasedProductIds: [...new Set(purchasedIds)],
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || 'Failed to restore purchases',
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, isRestoring: false }));
    }
  }, [state.isInitialized]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Check if a product is purchased
  const isPurchased = useCallback((productId: string): boolean => {
    return state.purchasedProductIds.includes(productId);
  }, [state.purchasedProductIds]);

  // Get a product by ID
  const getProduct = useCallback((productId: string): IAPProduct | undefined => {
    return state.products.find((p) => p.productId === productId);
  }, [state.products]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (state.isInitialized) {
        disconnectAsync();
        setPurchaseListener(null);
      }
    };
  }, [state.isInitialized]);

  const value: IAPContextType = {
    ...state,
    initialize,
    purchase,
    restore,
    clearError,
    isPurchased,
    getProduct,
  };

  return <IAPContext.Provider value={value}>{children}</IAPContext.Provider>;
}

/**
 * Hook to access the IAP context.
 * Must be used within an IAPProvider.
 */
export function useIAP(): IAPContextType {
  const context = useContext(IAPContext);
  if (!context) {
    throw new Error('useIAP must be used within an IAPProvider');
  }
  return context;
}
