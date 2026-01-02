import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

// GET - Listar todos os blocos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    const db = await connectDB();
    const query = activeOnly ? { active: true } : {};
    
    const blocks = await db.collection('site_blocks')
      .find(query)
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json({ blocks });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar novo bloco
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data, order, active } = body;

    const db = await connectDB();
    
    // Get max order
    const maxBlock = await db.collection('site_blocks')
      .find({})
      .sort({ order: -1 })
      .limit(1)
      .toArray();
    
    const nextOrder = maxBlock.length > 0 ? maxBlock[0].order + 1 : 1;

    const block = {
      type,
      data,
      order: order || nextOrder,
      active: active !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('site_blocks').insertOne(block);
    block._id = result.insertedId;

    return NextResponse.json({ block });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Atualizar bloco
export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { blockId, ...updates } = body;

    const db = await connectDB();
    await db.collection('site_blocks').updateOne(
      { _id: blockId },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    const block = await db.collection('site_blocks').findOne({ _id: blockId });
    return NextResponse.json({ block });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deletar bloco
export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get('blockId');

    const db = await connectDB();
    await db.collection('site_blocks').deleteOne({ _id: blockId });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
