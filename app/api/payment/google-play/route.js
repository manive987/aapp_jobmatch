import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

// Google Play Digital Goods API verification
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { purchaseToken, productId, orderId } = body;
    
    if (!purchaseToken || !productId) {
      return NextResponse.json(
        { error: 'Purchase token and product ID are required' },
        { status: 400 }
      );
    }
    
    // Map product IDs to plans
    const productToPlan = {
      'plan_plus_monthly': { plan: 'plus', evaluations_limit: 50 },
      'plan_pro_monthly': { plan: 'pro', evaluations_limit: 999999 }
    };
    
    const planDetails = productToPlan[productId];
    
    if (!planDetails) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    // TODO: Verify purchase with Google Play API
    // For now, we trust the client (in production, verify server-side)
    
    const db = await getDatabase();
    
    // Record the purchase
    await db.collection('purchases').insertOne({
      user_id: user.user_id,
      product_id: productId,
      purchase_token: purchaseToken,
      order_id: orderId,
      plan: planDetails.plan,
      status: 'active',
      created_at: new Date(),
      verified: false // Set to true after Google API verification
    });
    
    // Update user plan
    await db.collection('users').updateOne(
      { user_id: user.user_id },
      {
        $set: {
          plan: planDetails.plan,
          evaluations_limit: planDetails.evaluations_limit,
          evaluations_used: 0,
          subscription_start: new Date(),
          subscription_product: productId
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      plan: planDetails.plan,
      evaluations_limit: planDetails.evaluations_limit,
      message: 'Subscription activated successfully'
    });
    
  } catch (error) {
    console.error('Google Play verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

// Webhook for Google Play RTDN (Real-time Developer Notifications)
export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Google sends base64 encoded data
    const message = body.message;
    if (!message || !message.data) {
      return NextResponse.json({ error: 'Invalid notification' }, { status: 400 });
    }
    
    const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
    
    const db = await getDatabase();
    
    // Handle different notification types
    if (data.subscriptionNotification) {
      const { subscriptionId, purchaseToken, notificationType } = data.subscriptionNotification;
      
      // Notification types:
      // 1 = SUBSCRIPTION_RECOVERED
      // 2 = SUBSCRIPTION_RENEWED
      // 3 = SUBSCRIPTION_CANCELED
      // 4 = SUBSCRIPTION_PURCHASED
      // 5 = SUBSCRIPTION_ON_HOLD
      // 6 = SUBSCRIPTION_IN_GRACE_PERIOD
      // 7 = SUBSCRIPTION_RESTARTED
      // 12 = SUBSCRIPTION_REVOKED
      // 13 = SUBSCRIPTION_EXPIRED
      
      const purchase = await db.collection('purchases').findOne({ 
        purchase_token: purchaseToken 
      });
      
      if (purchase) {
        let newStatus = purchase.status;
        
        switch (notificationType) {
          case 1: // RECOVERED
          case 2: // RENEWED
          case 4: // PURCHASED
          case 7: // RESTARTED
            newStatus = 'active';
            break;
          case 3: // CANCELED
          case 12: // REVOKED
          case 13: // EXPIRED
            newStatus = 'canceled';
            // Revert user to free plan
            await db.collection('users').updateOne(
              { user_id: purchase.user_id },
              {
                $set: {
                  plan: 'free',
                  evaluations_limit: 3,
                  evaluations_used: 0
                }
              }
            );
            break;
          case 5: // ON_HOLD
          case 6: // GRACE_PERIOD
            newStatus = 'grace_period';
            break;
        }
        
        await db.collection('purchases').updateOne(
          { purchase_token: purchaseToken },
          {
            $set: {
              status: newStatus,
              last_notification: notificationType,
              updated_at: new Date()
            }
          }
        );
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
