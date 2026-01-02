import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

const PLAN_LIMITS = {
  free: 3,
  plus: 10,
  pro: 25,
};

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { plan } = await request.json();
    
    if (!plan || !PLAN_LIMITS[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }
    
    // Check environment mode
    const db = await getDatabase();
    const envSettings = await db.collection('admin_settings').findOne({ key: 'environment_mode' });
    const isTestMode = envSettings?.value !== 'production';
    
    if (!isTestMode) {
      return NextResponse.json(
        { error: 'Payment simulation only available in test mode' },
        { status: 403 }
      );
    }
    
    // Simulate payment success
    await db.collection('users').updateOne(
      { user_id: user.user_id },
      { 
        $set: { 
          plan: plan,
          evaluations_limit: PLAN_LIMITS[plan],
          evaluations_used: 0,
        } 
      }
    );
    
    // Log simulated payment
    await db.collection('payments').insertOne({
      user_id: user.user_id,
      plan: plan,
      amount: 0,
      currency: user.currency,
      payment_method: 'simulated',
      status: 'success',
      created_at: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      plan: plan,
      evaluations_limit: PLAN_LIMITS[plan],
    });
  } catch (error) {
    console.error('Payment simulation error:', error);
    return NextResponse.json(
      { error: 'Payment simulation failed' },
      { status: 500 }
    );
  }
}