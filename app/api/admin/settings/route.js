import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const db = await connectDB();
    const settings = await db.collection('settings').findOne({ type: 'payment' });
    
    return NextResponse.json({ settings: settings || {} });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { webhookUrl, mercadoPagoAccessToken, mercadoPagoPublicKey, environment } = body;

    const db = await connectDB();
    
    const settings = {
      type: 'payment',
      webhookUrl,
      mercadoPagoAccessToken,
      mercadoPagoPublicKey,
      environment: environment || 'test',
      updatedAt: new Date()
    };

    await db.collection('settings').updateOne(
      { type: 'payment' },
      { $set: settings },
      { upsert: true }
    );

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
