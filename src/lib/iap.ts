import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';
import { iapConfig } from '../../constants/config';

/**
 * Type of In-App Purchase product.
 */
export type IAPProductType = 'consumable' | 'non-consumable' | 'subscription';

/**
 * Represents an IAP product available for purchase.
 */
export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros?: string;
  priceCurrencyCode?: string;
  type: IAPProductType;
}

/**
 * Represents a completed purchase.
 */
export interface IAPPurchase {
  productId: string;
  transactionId: string;
  transactionDate: number;
  transactionReceipt?: string;
  purchaseState: InAppPurchases.InAppPurchaseState;
}

/**
 * Result of an IAP operation.
 */
export interface IAPResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Listener callback for purchase updates.
 */
export type PurchaseUpdateListener = (purchase: IAPPurchase) => void;

let isConnected = false;
let purchaseListener: PurchaseUpdateListener | null = null;

/**
 * Connect to the IAP service.
 * Must be called before any other IAP operations.
 */
export async function connectAsync(): Promise<IAPResult> {
  if (Platform.OS === 'web') {
    return {
      success: false,
      error: 'In-App Purchases are not available on web',
    };
  }

  try {
    await InAppPurchases.connectAsync();
    isConnected = true;

    // Set up purchase listener
    InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
        for (const purchase of results) {
          const iapPurchase: IAPPurchase = {
            productId: purchase.productId,
            transactionId: purchase.orderId || '',
            transactionDate: purchase.purchaseTime || Date.now(),
            transactionReceipt: purchase.transactionReceipt,
            purchaseState: purchase.purchaseState || InAppPurchases.InAppPurchaseState.PURCHASED,
          };

          // Notify listener
          if (purchaseListener) {
            purchaseListener(iapPurchase);
          }
        }
      } else if (errorCode) {
        console.error('Purchase error:', errorCode);
      }
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to IAP service',
    };
  }
}

/**
 * Disconnect from the IAP service.
 * Should be called when the app is closing or IAP is no longer needed.
 */
export async function disconnectAsync(): Promise<IAPResult> {
  if (!isConnected) {
    return { success: true };
  }

  try {
    await InAppPurchases.disconnectAsync();
    isConnected = false;
    purchaseListener = null;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disconnect from IAP service',
    };
  }
}

/**
 * Get available products for purchase.
 * @param productIds Array of product IDs to fetch
 */
export async function getProductsAsync(productIds: string[]): Promise<IAPResult<IAPProduct[]>> {
  if (!isConnected) {
    return {
      success: false,
      error: 'Not connected to IAP service. Call connectAsync() first.',
    };
  }

  try {
    const { responseCode, results } = await InAppPurchases.getProductsAsync(productIds);

    if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
      return {
        success: false,
        error: `Failed to get products: response code ${responseCode}`,
      };
    }

    const products: IAPProduct[] = (results || []).map((product) => ({
      productId: product.productId,
      title: product.title,
      description: product.description,
      price: product.price,
      priceAmountMicros: product.priceAmountMicros?.toString(),
      priceCurrencyCode: product.priceCurrencyCode,
      type: getProductType(product.productId),
    }));

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get products',
    };
  }
}

/**
 * Initiate a purchase for a product.
 * @param productId The product ID to purchase
 */
export async function purchaseItemAsync(productId: string): Promise<IAPResult> {
  if (!isConnected) {
    return {
      success: false,
      error: 'Not connected to IAP service. Call connectAsync() first.',
    };
  }

  try {
    await InAppPurchases.purchaseItemAsync(productId);
    // The actual purchase result will come through the purchase listener
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate purchase',
    };
  }
}

/**
 * Get the user's purchase history.
 */
export async function getPurchaseHistoryAsync(): Promise<IAPResult<IAPPurchase[]>> {
  if (!isConnected) {
    return {
      success: false,
      error: 'Not connected to IAP service. Call connectAsync() first.',
    };
  }

  try {
    const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();

    if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
      return {
        success: false,
        error: `Failed to get purchase history: response code ${responseCode}`,
      };
    }

    const purchases: IAPPurchase[] = (results || []).map((purchase) => ({
      productId: purchase.productId,
      transactionId: purchase.orderId || '',
      transactionDate: purchase.purchaseTime || 0,
      transactionReceipt: purchase.transactionReceipt,
      purchaseState: purchase.purchaseState || InAppPurchases.InAppPurchaseState.PURCHASED,
    }));

    return {
      success: true,
      data: purchases,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get purchase history',
    };
  }
}

/**
 * Finish a transaction after delivering the content.
 * This must be called after a purchase is successfully processed.
 * @param purchase The purchase to finish
 * @param consumeItem Whether to consume the item (for consumable products)
 */
export async function finishTransactionAsync(
  purchase: IAPPurchase,
  consumeItem: boolean = false
): Promise<IAPResult> {
  if (!isConnected) {
    return {
      success: false,
      error: 'Not connected to IAP service. Call connectAsync() first.',
    };
  }

  try {
    await InAppPurchases.finishTransactionAsync(
      {
        productId: purchase.productId,
        orderId: purchase.transactionId,
        purchaseTime: purchase.transactionDate,
        transactionReceipt: purchase.transactionReceipt,
        purchaseState: purchase.purchaseState,
        acknowledged: false,
      },
      consumeItem
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to finish transaction',
    };
  }
}

/**
 * Verify a purchase receipt with the backend server.
 * @param purchase The purchase to verify
 */
export async function verifyPurchaseAsync(purchase: IAPPurchase): Promise<IAPResult<{ verified: boolean }>> {
  if (!purchase.transactionReceipt) {
    return {
      success: false,
      error: 'No transaction receipt available',
    };
  }

  try {
    const response = await fetch(iapConfig.verifyReceiptEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receipt: purchase.transactionReceipt,
        productId: purchase.productId,
        transactionId: purchase.transactionId,
        platform: Platform.OS,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Server verification failed: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: { verified: data.verified === true },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify purchase',
    };
  }
}

/**
 * Restore previous purchases.
 * Useful for recovering purchases on a new device.
 */
export async function restorePurchasesAsync(): Promise<IAPResult<IAPPurchase[]>> {
  // On iOS, getPurchaseHistoryAsync handles restoration
  return getPurchaseHistoryAsync();
}

/**
 * Set a listener for purchase updates.
 * @param listener Callback function to handle purchase updates
 */
export function setPurchaseListener(listener: PurchaseUpdateListener | null): void {
  purchaseListener = listener;
}

/**
 * Check if IAP is available on the current platform.
 */
export function isIAPAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Check if currently connected to IAP service.
 */
export function isIAPConnected(): boolean {
  return isConnected;
}

/**
 * Determine the product type based on product ID.
 * This uses the configured product IDs to map to types.
 */
function getProductType(productId: string): IAPProductType {
  if (iapConfig.subscriptionProductIds.includes(productId)) {
    return 'subscription';
  }
  if (iapConfig.consumableProductIds.includes(productId)) {
    return 'consumable';
  }
  return 'non-consumable';
}

/**
 * Get all configured product IDs.
 */
export function getAllProductIds(): string[] {
  return [
    ...iapConfig.consumableProductIds,
    ...iapConfig.nonConsumableProductIds,
    ...iapConfig.subscriptionProductIds,
  ];
}
