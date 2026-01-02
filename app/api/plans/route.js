import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// GET - Fetch active plans (public)
export async function GET(request) {
  try {
    const db = await connectDB();
    const plans = await db.collection('plans')
      .find({ active: true })
      .sort({ price: 1 })
      .toArray();
    
    if (plans.length === 0) {
      // Return default plans
      return NextResponse.json({
        plans: [
          { 
            _id: '1', 
            name: 'Check Único', 
            price: 0.50, 
            quantity: 1, 
            type: 'check',
            enablePix: true, 
            enableGooglePay: false, 
            active: true 
          },
          { 
            _id: '2', 
            name: '10 Checks', 
            price: 4.50, 
            quantity: 10, 
            type: 'checks',
            enablePix: true, 
            enableGooglePay: true, 
            active: true 
          },
          { 
            _id: '3', 
            name: 'Mensal', 
            price: 29.90, 
            quantity: 1, 
            type: 'month',
            enablePix: true, 
            enableGooglePay: true, 
            active: true 
          },
        ]
      });
    }
    
    return NextResponse.json({ plans });
    
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}
