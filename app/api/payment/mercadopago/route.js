import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { createPixPayment, getPaymentStatus } from '@/lib/mercadopago';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    const db = await connectDB();
    const plan = await db.collection('plans').findOne({ _id: planId });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Create PIX payment
    const paymentResponse = await createPixPayment({
      amount: plan.price,
      description: `${plan.name} - JobMatch`,
      email: user.email,
      planId: planId
    });

    // Save transaction to database
    const transaction = {
      userId: user.id,
      planId: planId,
      paymentId: paymentResponse.id,
      amount: plan.price,
      status: paymentResponse.status,
      paymentMethod: 'pix',
      qrCode: paymentResponse.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: paymentResponse.point_of_interaction?.transaction_data?.ticket_url,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      createdAt: new Date()
    };

    await db.collection('transactions').insertOne(transaction);

    return NextResponse.json({
      payment_id: paymentResponse.id,
      status: paymentResponse.status,
      qr_code: transaction.qrCode,
      qr_code_base64: transaction.qrCodeBase64,
      ticket_url: transaction.ticketUrl,
      expires_in: 1800 // 30 minutes in seconds
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    // Get payment status from Mercado Pago
    const paymentStatus = await getPaymentStatus(paymentId);

    // Update transaction in database
    const db = await connectDB();
    await db.collection('transactions').updateOne(
      { paymentId: paymentId },
      { $set: { status: paymentStatus.status, updatedAt: new Date() } }
    );

    // If approved, update user's plan
    if (paymentStatus.status === 'approved') {
      const transaction = await db.collection('transactions').findOne({ paymentId: paymentId });
      if (transaction) {
        const plan = await db.collection('plans').findOne({ _id: transaction.planId });
        
        if (plan) {
          const userUpdate = {};
          
          if (plan.type === 'check' || plan.type === 'checks') {
            // Add checks
            userUpdate.$inc = { availableChecks: plan.quantity || 1 };
          } else if (plan.type === 'lifetime') {
            userUpdate.$set = { plan: 'lifetime', lifetimeAccess: true };
          } else {
            // Time-based plan
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
                expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default
            }
            
            userUpdate.$set = {
              plan: plan.name,
              planExpiresAt: expirationDate
            };
          }
          
          await db.collection('users').updateOne(
            { _id: user.id },
            userUpdate
          );
        }
      }
    }

    return NextResponse.json({
      status: paymentStatus.status,
      status_detail: paymentStatus.status_detail
    });
  } catch (error) {
    console.error('Error checking payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
