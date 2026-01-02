// Google Play Billing Integration for PWA
// Uses Digital Goods API for in-app purchases

const PLAY_STORE_URL = 'https://play.google.com/billing';

const PRODUCTS = {
  PLUS: 'plan_plus_monthly',
  PRO: 'plan_pro_monthly'
};

// Check if Digital Goods API is available (only in TWA/Play Store)
export function isPlayStoreAvailable() {
  return 'getDigitalGoodsService' in window;
}

// Get product details from Play Store
export async function getProductDetails(productIds) {
  if (!isPlayStoreAvailable()) {
    return null;
  }
  
  try {
    const service = await window.getDigitalGoodsService(PLAY_STORE_URL);
    const details = await service.getDetails(productIds);
    return details;
  } catch (error) {
    console.error('Error getting product details:', error);
    return null;
  }
}

// Get all subscription products
export async function getSubscriptionProducts() {
  return await getProductDetails([PRODUCTS.PLUS, PRODUCTS.PRO]);
}

// List existing purchases
export async function listExistingPurchases() {
  if (!isPlayStoreAvailable()) {
    return [];
  }
  
  try {
    const service = await window.getDigitalGoodsService(PLAY_STORE_URL);
    const purchases = await service.listPurchases();
    return purchases;
  } catch (error) {
    console.error('Error listing purchases:', error);
    return [];
  }
}

// Purchase a subscription
export async function purchaseSubscription(productId, token) {
  if (!isPlayStoreAvailable()) {
    // Fallback to web payment or show message
    return { 
      success: false, 
      error: 'Play Store not available. Please use the web version for payments.' 
    };
  }
  
  try {
    // The purchase flow is handled by the Play Store
    // We just need to listen for the result
    
    // Request payment via Payment Request API with Digital Goods
    const supportedMethods = [{
      supportedMethods: PLAY_STORE_URL,
      data: {
        sku: productId
      }
    }];
    
    const details = {
      total: {
        label: 'Subscription',
        amount: { currency: 'BRL', value: '0' } // Price comes from Play Store
      }
    };
    
    const request = new PaymentRequest(supportedMethods, details);
    const response = await request.show();
    
    // Get purchase details
    const purchaseDetails = response.details;
    
    // Verify purchase on backend
    const verifyResponse = await fetch('/api/payment/google-play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        purchaseToken: purchaseDetails.purchaseToken,
        productId: productId,
        orderId: purchaseDetails.orderId
      })
    });
    
    if (!verifyResponse.ok) {
      throw new Error('Purchase verification failed');
    }
    
    const result = await verifyResponse.json();
    
    // Complete the payment
    await response.complete('success');
    
    return { 
      success: true, 
      plan: result.plan,
      evaluations_limit: result.evaluations_limit
    };
    
  } catch (error) {
    console.error('Purchase error:', error);
    return { 
      success: false, 
      error: error.message || 'Purchase failed' 
    };
  }
}

// Acknowledge a purchase (required for consumables)
export async function acknowledgePurchase(purchaseToken) {
  if (!isPlayStoreAvailable()) {
    return false;
  }
  
  try {
    const service = await window.getDigitalGoodsService(PLAY_STORE_URL);
    await service.acknowledge(purchaseToken, 'onetime');
    return true;
  } catch (error) {
    console.error('Error acknowledging purchase:', error);
    return false;
  }
}

// Consume a purchase (for one-time consumable products)
export async function consumePurchase(purchaseToken) {
  if (!isPlayStoreAvailable()) {
    return false;
  }
  
  try {
    const service = await window.getDigitalGoodsService(PLAY_STORE_URL);
    await service.consume(purchaseToken);
    return true;
  } catch (error) {
    console.error('Error consuming purchase:', error);
    return false;
  }
}

export { PRODUCTS };
