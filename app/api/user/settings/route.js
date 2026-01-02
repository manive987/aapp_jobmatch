import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const db = await getDatabase();
    const settings = await db.collection('user_settings').findOne({ user_id: user.user_id });
    
    return NextResponse.json({
      settings: settings || {
        home_location: '',
        transport_cost_outbound: '',
        transport_cost_return: '',
        desired_salary: '',
        desired_position: ''
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const settings = await request.json();
    const db = await getDatabase();
    
    await db.collection('user_settings').updateOne(
      { user_id: user.user_id },
      { 
        $set: { 
          ...settings,
          user_id: user.user_id,
          updated_at: new Date()
        } 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}