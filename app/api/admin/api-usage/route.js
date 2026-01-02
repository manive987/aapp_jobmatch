import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer admin-secret-token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const db = await getDatabase();
    const usage = await db.collection('api_usage').find({}).toArray();
    
    const usageMap = usage.reduce((acc, item) => {
      acc[item.api_name] = item.request_count || 0;
      return acc;
    }, {});
    
    return NextResponse.json({
      gemini: usageMap.gemini || 0,
      perplexity: usageMap.perplexity || 0,
      openai: usageMap.openai || 0
    });
  } catch (error) {
    console.error('Get API usage error:', error);
    return NextResponse.json(
      { error: 'Failed to get API usage' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { api_name } = await request.json();
    
    if (!['gemini', 'perplexity', 'openai'].includes(api_name)) {
      return NextResponse.json(
        { error: 'Invalid API name' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    
    await db.collection('api_usage').updateOne(
      { api_name },
      { 
        $inc: { request_count: 1 },
        $set: { last_used: new Date() }
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track API usage error:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}
