import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const db = await connectDB();
    const plans = await db.collection('plans').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ plans });
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
    const { price, type, quantity, enablePix, enableGooglePay, name, description } = body;

    const db = await connectDB();
    
    const plan = {
      name: name || `Plan ${type}`,
      description: description || '',
      price: Number(price),
      type, // 'check', 'checks', 'day', 'days', 'month', 'months', 'year', 'lifetime'
      quantity: quantity ? Number(quantity) : 1,
      enablePix: enablePix !== false,
      enableGooglePay: enableGooglePay !== false,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('plans').insertOne(plan);
    plan._id = result.insertedId;

    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, ...updates } = body;

    const db = await connectDB();
    await db.collection('plans').updateOne(
      { _id: planId },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    const plan = await db.collection('plans').findOne({ _id: planId });
    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    const db = await connectDB();
    await db.collection('plans').deleteOne({ _id: planId });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
