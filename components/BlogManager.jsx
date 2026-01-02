'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Eye, Edit, Save } from 'lucide-react';

export default function BlogManager({ token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Dicas',
    tags: [],
    featuredImage: '',
    published: false,
    author: 'JobMatch Team',
    readTime: '5 min'
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts?published=false');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const savePost = async () => {
    if (!newPost.title || !newPost.slug) {
      toast.error('Título e slug são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/blog/posts', {
        method: editingPost ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingPost ? { ...newPost, postId: editingPost } : newPost)
      });

      if (response.ok) {
        toast.success(editingPost ? 'Atualizado!' : 'Criado!');
        setNewPost({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          category: 'Dicas',
          tags: [],
          featuredImage: '',
          published: false,
          author: 'JobMatch Team',
          readTime: '5 min'
        });
        setEditingPost(null);
        loadPosts();
      }
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingPost ? 'Editar' : 'Novo'} Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={newPost.title}
            onChange={(e) => setNewPost({...newPost, title: e.target.value, slug: generateSlug(e.target.value)})}
            placeholder="Título"
          />
          <Input
            value={newPost.slug}
            onChange={(e) => setNewPost({...newPost, slug: e.target.value})}
            placeholder="slug-do-post"
          />
          <Textarea
            value={newPost.excerpt}
            onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
            placeholder="Resumo"
            rows={2}
          />
          <Textarea
            value={newPost.content}
            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            placeholder="<p>Conteúdo HTML</p>"
            rows={10}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={newPost.category}
              onChange={(e) => setNewPost({...newPost, category: e.target.value})}
              placeholder="Categoria"
            />
            <Input
              value={newPost.featuredImage}
              onChange={(e) => setNewPost({...newPost, featuredImage: e.target.value})}
              placeholder="URL da imagem"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={newPost.published}
              onCheckedChange={(checked) => setNewPost({...newPost, published: checked})}
            />
            <Label>Publicar</Label>
          </div>
          <Button onClick={savePost} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {posts.map(post => (
            <div key={post._id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-semibold">{post.title}</h4>
                <p className="text-sm text-gray-600">{post.published ? '✅ Publicado' : '📝 Rascunho'}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  setEditingPost(post._id);
                  setNewPost(post);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
