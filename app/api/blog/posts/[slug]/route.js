import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const db = await connectDB();
    
    const post = await db.collection('blog_posts').findOne({ 
      slug,
      published: true 
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment views
    await db.collection('blog_posts').updateOne(
      { _id: post._id },
      { $inc: { views: 1 } }
    );

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
