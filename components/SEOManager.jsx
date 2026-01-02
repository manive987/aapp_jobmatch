'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function SEOManager({ token }) {
  const [loading, setLoading] = useState(false);
  const [seo, setSeo] = useState({
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
    twitterHandle: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/seo/settings');
      const data = await response.json();
      if (data.settings) {
        setSeo(data.settings);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seo/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(seo)
      });

      if (response.ok) {
        toast.success('SEO atualizado!');
      }
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 Configurações SEO Globais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Título do Site</Label>
          <Input
            value={seo.title}
            onChange={(e) => setSeo({...seo, title: e.target.value})}
            placeholder="JobMatch - Encontre o Job Perfeito com IA"
          />
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea
            value={seo.description}
            onChange={(e) => setSeo({...seo, description: e.target.value})}
            placeholder="Descrição do site"
            rows={3}
          />
        </div>

        <div>
          <Label>Keywords (separadas por vírgula)</Label>
          <Input
            value={seo.keywords}
            onChange={(e) => setSeo({...seo, keywords: e.target.value})}
            placeholder="emprego, cv, currículo, ia, vagas"
          />
        </div>

        <div>
          <Label>Imagem OG (Open Graph)</Label>
          <Input
            value={seo.ogImage}
            onChange={(e) => setSeo({...seo, ogImage: e.target.value})}
            placeholder="https://exemplo.com/og-image.png"
          />
        </div>

        <div>
          <Label>Twitter Handle</Label>
          <Input
            value={seo.twitterHandle}
            onChange={(e) => setSeo({...seo, twitterHandle: e.target.value})}
            placeholder="@jobmatch"
          />
        </div>

        <Button onClick={saveSettings} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações SEO
        </Button>
      </CardContent>
    </Card>
  );
}
