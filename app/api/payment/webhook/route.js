import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getPaymentStatus } from '@/lib/mercadopago';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Webhook received:', body);

    // Mercado Pago sends different types of notifications
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
      }

      // Get payment details from Mercado Pago
      const paymentData = await getPaymentStatus(paymentId);

      // Update transaction in database
      const db = await connectDB();
      const transaction = await db.collection('transactions').findOne({ paymentId: String(paymentId) });

      if (!transaction) {
        console.log('Transaction not found:', paymentId);
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      await db.collection('transactions').updateOne(
        { paymentId: String(paymentId) },
        { 
          $set: { 
            status: paymentData.status,
            statusDetail: paymentData.status_detail,
            updatedAt: new Date() 
          } 
        }
      );

      // If payment approved, update user's plan
      if (paymentData.status === 'approved') {
        const plan = await db.collection('plans').findOne({ _id: transaction.planId });
        
        if (plan) {
          const userUpdate = {};
          
          if (plan.type === 'check' || plan.type === 'checks') {
            userUpdate.$inc = { availableChecks: plan.quantity || 1 };
          } else if (plan.type === 'lifetime') {
            userUpdate.$set = { plan: 'lifetime', lifetimeAccess: true };
          } else {
            const now = new Date();
            let expirationDate;
            
            switch (plan.type) {
              case 'day':
              case 'days':
                expirationDate = new Date(now.getTime() + (plan.quantity || 1) * 24 * 60 * 60 * 1000);
                break;
              case 'month':
              case 'months':
                expirationDate = new Date(now.setMonth(now.getMonth() + (plan.quantity || 1)));
                break;
              case 'year':
              case 'years':
                expirationDate = new Date(now.setFullYear(now.getFullYear() + (plan.quantity || 1)));
                break;
              default:
                expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            }
            
            userUpdate.$set = {
              plan: plan.name,
              planExpiresAt: expirationDate
            };
          }
          
          await db.collection('users').updateOne(
            { _id: transaction.userId },
            userUpdate
          );
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
