import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

// GET - Listar posts (público ou filtrado)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const published = searchParams.get('published') !== 'false';

    const db = await connectDB();
    const query = published ? { published: true } : {};
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const posts = await db.collection('blog_posts')
      .find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar novo post (admin)
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, excerpt, content, category, tags, featuredImage, published, seoTitle, seoDescription, author, readTime } = body;

    const db = await connectDB();
    
    // Check if slug exists
    const existingPost = await db.collection('blog_posts').findOne({ slug });
    if (existingPost) {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
    }

    const post = {
      title,
      slug,
      excerpt,
      content,
      category: category || 'Geral',
      tags: tags || [],
      featuredImage: featuredImage || '',
      published: published || false,
      seo: {
        title: seoTitle || title,
        description: seoDescription || excerpt
      },
      author: author || 'JobMatch Team',
      readTime: readTime || '5 min',
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: published ? new Date() : null
    };

    const result = await db.collection('blog_posts').insertOne(post);
    post._id = result.insertedId;

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Atualizar post
export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, ...updates } = body;

    const db = await connectDB();
    
    await db.collection('blog_posts').updateOne(
      { _id: postId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date(),
          publishedAt: updates.published ? (updates.publishedAt || new Date()) : null
        } 
      }
    );

    const post = await db.collection('blog_posts').findOne({ _id: postId });
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deletar post
export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    const db = await connectDB();
    await db.collection('blog_posts').deleteOne({ _id: postId });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
