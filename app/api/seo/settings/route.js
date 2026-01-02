import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

// GET - Listar configurações SEO
export async function GET(request) {
  try {
    const db = await connectDB();
    const settings = await db.collection('seo_settings').findOne({ type: 'global' });
    
    return NextResponse.json({ 
      settings: settings || {
        title: 'JobMatch - Encontre o Job Perfeito com IA',
        description: 'Analise seu CV contra vagas de emprego usando inteligência artificial',
        keywords: 'emprego, cv, currículo, ia, vagas',
        ogImage: '/og-image.png',
        twitterHandle: '@jobmatch'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Atualizar SEO
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = await connectDB();
    
    const settings = {
      type: 'global',
      ...body,
      updatedAt: new Date()
    };

    await db.collection('seo_settings').updateOne(
      { type: 'global' },
      { $set: settings },
      { upsert: true }
    );

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
