import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET - Fetch payment settings
export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== 'Bearer admin-secret-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const db = await getDatabase();
    const settings = await db.collection('admin_settings').findOne({ type: 'payment_settings' });
    
    if (!settings) {
      return NextResponse.json({
        mercadopago_access_token: '',
        mercadopago_enabled: false,
        playstore_enabled: false,
        period_options: ['Dia(s)', 'Semana(s)', 'Mês(es)', 'Ano(s)', 'Vitalício'],
        type_options: ['Análise(s)', 'Checada(s)', '']
      });
    }
    
    // Don't expose full token, just indicate if it's set
    return NextResponse.json({
      ...settings,
      mercadopago_access_token: settings.mercadopago_access_token ? '••••••••' + settings.mercadopago_access_token.slice(-8) : ''
    });
    
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 });
  }
}

// POST - Save payment settings
export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== 'Bearer admin-secret-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const db = await getDatabase();
    
    // Get existing settings to preserve token if not changed
    const existing = await db.collection('admin_settings').findOne({ type: 'payment_settings' });
    
    // If token starts with dots, keep the existing one
    let token = body.mercadopago_access_token;
    if (token && token.startsWith('••••')) {
      token = existing?.mercadopago_access_token || '';
    }
    
    await db.collection('admin_settings').updateOne(
      { type: 'payment_settings' },
      { 
        $set: { 
          mercadopago_access_token: token,
          mercadopago_enabled: body.mercadopago_enabled,
          playstore_enabled: body.playstore_enabled,
          period_options: body.period_options,
          type_options: body.type_options,
          updated_at: new Date()
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error saving payment settings:', error);
    return NextResponse.json({ error: 'Failed to save payment settings' }, { status: 500 });
  }
}
