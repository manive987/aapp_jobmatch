'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug);
    }
  }, [params.slug]);

  const fetchPost = async (slug) => {
    try {
      const response = await fetch(`/api/blog/posts/${slug}`);
      const data = await response.json();
      
      if (data.post) {
        setPost(data.post);
        fetchRelatedPosts(data.post.category);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category) => {
    try {
      const response = await fetch(`/api/blog/posts?category=${category}&limit=3`);
      const data = await response.json();
      setRelatedPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const sharePost = (platform) => {
    const url = window.location.href;
    const text = post.title;
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
          <Link href="/blog">
            <Button>Voltar ao Blog</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 hover:text-blue-600 transition">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Voltar ao Blog</span>
          </Link>
          
          <Link href="/app">
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">Usar App</Button>
          </Link>
        </nav>
      </header>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {post.category && (
              <Badge className="bg-blue-100 text-blue-700">{post.category}</Badge>
            )}
            {post.tags?.map(tag => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
          
          <div className="flex items-center justify-between border-y py-4">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author || 'JobMatch Team'}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime || '5 min de leitura'}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyLink}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => sharePost('facebook')}>
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => sharePost('twitter')}>
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => sharePost('linkedin')}>
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Post Content */}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Posts Relacionados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.filter(p => p._id !== post._id).slice(0, 3).map(relatedPost => (
                <Link key={relatedPost._id} href={`/blog/${relatedPost.slug}`}>
                  <Card className="hover:shadow-lg transition cursor-pointer">
                    {relatedPost.featuredImage && (
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{relatedPost.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{relatedPost.excerpt}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Card className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para encontrar seu próximo emprego?</h2>
          <p className="text-lg mb-6 opacity-90">Use o JobMatch AI para analisar seu CV gratuitamente!</p>
          <Link href="/app">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Começar Agora →
            </Button>
          </Link>
        </Card>
      </article>
    </div>
  );
}
