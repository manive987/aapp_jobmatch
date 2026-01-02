'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, ArrowUp, ArrowDown, Eye } from 'lucide-react';

const BLOCK_TYPES = [
  { value: 'hero', label: '🦸 Hero Section', fields: ['title', 'subtitle', 'badge', 'primaryButtonText', 'primaryButtonLink', 'secondaryButtonText', 'secondaryButtonLink'] },
  { value: 'stats', label: '📊 Estatísticas', fields: ['stats'] },
  { value: 'features', label: '⚡ Features', fields: ['title', 'subtitle', 'features'] },
  { value: 'testimonials', label: '💬 Depoimentos', fields: ['title', 'subtitle', 'testimonials'] },
  { value: 'cta', label: '🎯 Call to Action', fields: ['title', 'subtitle', 'buttonText', 'buttonLink'] }
];

export default function SiteBlocksManager({ token }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [selectedType, setSelectedType] = useState('hero');
  const [blockData, setBlockData] = useState({});

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    try {
      const response = await fetch('/api/site/blocks');
      const data = await response.json();
      setBlocks(data.blocks || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveBlock = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/site/blocks', {
        method: editingBlock ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...(editingBlock && { blockId: editingBlock }),
          type: selectedType,
          data: blockData,
          active: true
        })
      });

      if (response.ok) {
        toast.success(editingBlock ? 'Bloco atualizado!' : 'Bloco criado!');
        setBlockData({});
        setEditingBlock(null);
        loadBlocks();
      }
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const deleteBlock = async (blockId) => {
    if (!confirm('Deletar este bloco?')) return;
    try {
      await fetch(`/api/site/blocks?blockId=${blockId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Bloco deletado!');
      loadBlocks();
    } catch (error) {
      toast.error('Erro');
    }
  };

  const toggleActive = async (block) => {
    try {
      await fetch('/api/site/blocks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blockId: block._id,
          active: !block.active
        })
      });
      loadBlocks();
    } catch (error) {
      toast.error('Erro');
    }
  };

  const moveBlock = async (blockId, direction) => {
    const index = blocks.findIndex(b => b._id === blockId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    
    // Update orders
    for (let i = 0; i < newBlocks.length; i++) {
      await fetch('/api/site/blocks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blockId: newBlocks[i]._id,
          order: i + 1
        })
      });
    }
    
    loadBlocks();
  };

  const editBlock = (block) => {
    setEditingBlock(block._id);
    setSelectedType(block.type);
    setBlockData(block.data);
  };

  const renderFormFields = () => {
    const typeConfig = BLOCK_TYPES.find(t => t.value === selectedType);
    if (!typeConfig) return null;

    return (
      <div className="space-y-4">
        {selectedType === 'hero' && (
          <>
            <Input
              placeholder="Título"
              value={blockData.title || ''}
              onChange={(e) => setBlockData({...blockData, title: e.target.value})}
            />
            <Textarea
              placeholder="Subtítulo"
              value={blockData.subtitle || ''}
              onChange={(e) => setBlockData({...blockData, subtitle: e.target.value})}
              rows={2}
            />
            <Input
              placeholder="Badge (opcional)"
              value={blockData.badge || ''}
              onChange={(e) => setBlockData({...blockData, badge: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Texto Botão Primário"
                value={blockData.primaryButtonText || ''}
                onChange={(e) => setBlockData({...blockData, primaryButtonText: e.target.value})}
              />
              <Input
                placeholder="Link Botão Primário"
                value={blockData.primaryButtonLink || ''}
                onChange={(e) => setBlockData({...blockData, primaryButtonLink: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Texto Botão Secundário (opcional)"
                value={blockData.secondaryButtonText || ''}
                onChange={(e) => setBlockData({...blockData, secondaryButtonText: e.target.value})}
              />
              <Input
                placeholder="Link Botão Secundário"
                value={blockData.secondaryButtonLink || ''}
                onChange={(e) => setBlockData({...blockData, secondaryButtonLink: e.target.value})}
              />
            </div>
          </>
        )}

        {selectedType === 'stats' && (
          <div className="space-y-2">
            <Label>Stats (JSON Array)</Label>
            <Textarea
              placeholder='[{"value":"1234+","label":"Usuários","color":"text-blue-600"}]'
              value={JSON.stringify(blockData.stats || [], null, 2)}
              onChange={(e) => {
                try {
                  setBlockData({...blockData, stats: JSON.parse(e.target.value)});
                } catch {}
              }}
              rows={6}
              className="font-mono text-xs"
            />
          </div>
        )}

        {selectedType === 'features' && (
          <>
            <Input
              placeholder="Título da Seção"
              value={blockData.title || ''}
              onChange={(e) => setBlockData({...blockData, title: e.target.value})}
            />
            <Input
              placeholder="Subtítulo (opcional)"
              value={blockData.subtitle || ''}
              onChange={(e) => setBlockData({...blockData, subtitle: e.target.value})}
            />
            <div className="space-y-2">
              <Label>Features (JSON Array)</Label>
              <Textarea
                placeholder='[{"icon":"⚡","iconBg":"bg-blue-100","title":"Feature","description":"Descrição"}]'
                value={JSON.stringify(blockData.features || [], null, 2)}
                onChange={(e) => {
                  try {
                    setBlockData({...blockData, features: JSON.parse(e.target.value)});
                  } catch {}
                }}
                rows={8}
                className="font-mono text-xs"
              />
            </div>
          </>
        )}

        {selectedType === 'testimonials' && (
          <>
            <Input
              placeholder="Título"
              value={blockData.title || ''}
              onChange={(e) => setBlockData({...blockData, title: e.target.value})}
            />
            <Input
              placeholder="Subtítulo (opcional)"
              value={blockData.subtitle || ''}
              onChange={(e) => setBlockData({...blockData, subtitle: e.target.value})}
            />
            <div className="space-y-2">
              <Label>Depoimentos (JSON Array)</Label>
              <Textarea
                placeholder='[{"name":"João","role":"Dev","text":"Ótimo!","image":"url"}]'
                value={JSON.stringify(blockData.testimonials || [], null, 2)}
                onChange={(e) => {
                  try {
                    setBlockData({...blockData, testimonials: JSON.parse(e.target.value)});
                  } catch {}
                }}
                rows={8}
                className="font-mono text-xs"
              />
            </div>
          </>
        )}

        {selectedType === 'cta' && (
          <>
            <Input
              placeholder="Título"
              value={blockData.title || ''}
              onChange={(e) => setBlockData({...blockData, title: e.target.value})}
            />
            <Textarea
              placeholder="Subtítulo"
              value={blockData.subtitle || ''}
              onChange={(e) => setBlockData({...blockData, subtitle: e.target.value})}
              rows={2}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Texto do Botão"
                value={blockData.buttonText || ''}
                onChange={(e) => setBlockData({...blockData, buttonText: e.target.value})}
              />
              <Input
                placeholder="Link do Botão"
                value={blockData.buttonLink || ''}
                onChange={(e) => setBlockData({...blockData, buttonLink: e.target.value})}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingBlock ? 'Editar' : 'Novo'} Bloco</CardTitle>
          <CardDescription>Monte sua landing page com blocos modulares</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipo de Bloco</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderFormFields()}

          <div className="flex gap-2">
            <Button onClick={saveBlock} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Bloco
            </Button>
            {editingBlock && (
              <Button variant="outline" onClick={() => {
                setEditingBlock(null);
                setBlockData({});
              }}>
                Cancelar
              </Button>
            )}
            <Button variant="outline" onClick={() => window.open('/', '_blank')}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Site
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocos da Landing Page ({blocks.length})</CardTitle>
          <CardDescription>Arraste para reordenar, ative/desative blocos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {blocks.map((block, index) => (
            <div key={block._id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveBlock(block._id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveBlock(block._id, 'down')}
                    disabled={index === blocks.length - 1}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">
                      {BLOCK_TYPES.find(t => t.value === block.type)?.label || block.type}
                    </h4>
                    {block.active ? (
                      <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {block.data.title || block.data.subtitle || 'Sem título'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Switch
                  checked={block.active}
                  onCheckedChange={() => toggleActive(block)}
                />
                <Button size="sm" variant="ghost" onClick={() => editBlock(block)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteBlock(block._id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          {blocks.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhum bloco criado. Adicione o primeiro!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
