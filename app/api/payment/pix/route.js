import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Create Pix payment via Mercado Pago
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { plan_id } = body;
    
    if (!plan_id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    // Get payment settings
    const paymentSettings = await db.collection('admin_settings').findOne({ type: 'payment_settings' });
    
    if (!paymentSettings?.mercadopago_enabled || !paymentSettings?.mercadopago_access_token) {
      return NextResponse.json({ 
        error: 'Pagamento via Pix não está configurado',
        message: 'O administrador precisa configurar o Mercado Pago'
      }, { status: 400 });
    }
    
    // Get plan details
    const plansDoc = await db.collection('admin_settings').findOne({ type: 'plans' });
    const plan = plansDoc?.plans?.find(p => p.id === plan_id);
    
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }
    
    if (!plan.pix_enabled) {
      return NextResponse.json({ error: 'Este plano não aceita pagamento via Pix' }, { status: 400 });
    }
    
    // Create payment in Mercado Pago
    const paymentId = uuidv4();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30); // 30 min expiration
    
    const mpPayload = {
      transaction_amount: plan.price,
      description: `JobMatch AI - ${plan.name}`,
      payment_method_id: 'pix',
      payer: {
        email: user.email
      },
      external_reference: paymentId
    };
    
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paymentSettings.mercadopago_access_token}`,
        'X-Idempotency-Key': paymentId
      },
      body: JSON.stringify(mpPayload)
    });
    
    const mpData = await mpResponse.json();
    
    if (!mpResponse.ok) {
      console.error('Mercado Pago error:', mpData);
      return NextResponse.json({ 
        error: 'Erro ao criar pagamento',
        details: mpData.message || 'Verifique as credenciais do Mercado Pago'
      }, { status: 500 });
    }
    
    // Save payment record
    const payment = {
      id: paymentId,
      mp_payment_id: mpData.id,
      user_id: user.user_id,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: plan.price,
      quantity: plan.quantity,
      period: plan.period,
      type: plan.type,
      status: 'pending',
      pix_qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
      pix_qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
      pix_copy_paste: mpData.point_of_interaction?.transaction_data?.qr_code,
      expires_at: expirationDate,
      created_at: new Date()
    };
    
    await db.collection('payments').insertOne(payment);
    
    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      mp_payment_id: mpData.id,
      status: mpData.status,
      qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
      expires_at: expirationDate.toISOString(),
      amount: plan.price,
      plan_name: plan.name
    });
    
  } catch (error) {
    console.error('Pix payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

// GET - Check payment status
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    // Get payment record
    const payment = await db.collection('payments').findOne({ 
      id: paymentId,
      user_id: user.user_id
    });
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    // If already approved, return success
    if (payment.status === 'approved') {
      return NextResponse.json({
        status: 'approved',
        payment_id: paymentId
      });
    }
    
    // Get payment settings to check MP
    const paymentSettings = await db.collection('admin_settings').findOne({ type: 'payment_settings' });
    
    if (!paymentSettings?.mercadopago_access_token) {
      return NextResponse.json({ status: payment.status });
    }
    
    // Check status in Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment.mp_payment_id}`, {
      headers: {
        'Authorization': `Bearer ${paymentSettings.mercadopago_access_token}`
      }
    });
    
    const mpData = await mpResponse.json();
    
    if (mpData.status === 'approved' && payment.status !== 'approved') {
      // Payment approved! Update user plan
      const plansDoc = await db.collection('admin_settings').findOne({ type: 'plans' });
      const plan = plansDoc?.plans?.find(p => p.id === payment.plan_id);
      
      if (plan) {
        // Calculate expiration based on period
        let expiresAt = null;
        const now = new Date();
        
        if (plan.period.includes('Dia')) {
          expiresAt = new Date(now.getTime() + plan.quantity * 24 * 60 * 60 * 1000);
        } else if (plan.period.includes('Semana')) {
          expiresAt = new Date(now.getTime() + plan.quantity * 7 * 24 * 60 * 60 * 1000);
        } else if (plan.period.includes('Mês') || plan.period.includes('Mes')) {
          expiresAt = new Date(now.setMonth(now.getMonth() + plan.quantity));
        } else if (plan.period.includes('Ano')) {
          expiresAt = new Date(now.setFullYear(now.getFullYear() + plan.quantity));
        } else if (plan.period.includes('Vitalício')) {
          expiresAt = new Date('2099-12-31');
        }
        
        // Calculate evaluations limit
        let evaluationsLimit = 999999; // unlimited by default
        if (plan.type.includes('Análise')) {
          evaluationsLimit = plan.quantity;
        } else if (plan.type.includes('Checada')) {
          evaluationsLimit = plan.quantity;
        }
        
        // Update user
        await db.collection('users').updateOne(
          { user_id: user.user_id },
          {
            $set: {
              plan: plan.name.toLowerCase(),
              plan_name: plan.name,
              plan_expires_at: expiresAt,
              evaluations_limit: evaluationsLimit,
              evaluations_used: 0,
              last_payment_id: paymentId
            }
          }
        );
        
        // Update payment status
        await db.collection('payments').updateOne(
          { id: paymentId },
          {
            $set: {
              status: 'approved',
              approved_at: new Date()
            }
          }
        );
        
        return NextResponse.json({
          status: 'approved',
          payment_id: paymentId,
          plan_name: plan.name,
          expires_at: expiresAt?.toISOString()
        });
      }
    }
    
    // Update status if changed
    if (mpData.status !== payment.status) {
      await db.collection('payments').updateOne(
        { id: paymentId },
        { $set: { status: mpData.status } }
      );
    }
    
    return NextResponse.json({
      status: mpData.status || payment.status,
      payment_id: paymentId
    });
    
  } catch (error) {
    console.error('Check payment error:', error);
    return NextResponse.json({ error: 'Failed to check payment' }, { status: 500 });
  }
}
