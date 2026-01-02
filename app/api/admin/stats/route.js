import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    
    // Get total users
    const totalUsers = await db.collection('users').countDocuments();
    
    // Get total evaluations
    const totalEvaluations = await db.collection('evaluations').countDocuments();
    
    // Get total revenue from approved transactions
    const revenueResult = await db.collection('transactions').aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Get active plans count
    const activePlans = await db.collection('plans').countDocuments({ active: true });
    
    // Get recent transactions
    const recentTransactions = await db.collection('transactions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      totalUsers,
      totalEvaluations,
      totalRevenue,
      activePlans,
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
