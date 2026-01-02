'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Save, DollarSign } from 'lucide-react';

const PLAN_TYPES = [
  { value: 'check', label: 'Check (1 verificação)', plural: false },
  { value: 'checks', label: 'Checks (múltiplas verificações)', plural: true },
  { value: 'day', label: 'Dia', plural: false },
  { value: 'days', label: 'Dias', plural: true },
  { value: 'month', label: 'Mês', plural: false },
  { value: 'months', label: 'Meses', plural: true },
  { value: 'year', label: 'Ano', plural: false },
  { value: 'years', label: 'Anos', plural: true },
  { value: 'lifetime', label: 'Vitalício', plural: false }
];

export default function AdminPlansManager({ token }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [environment, setEnvironment] = useState('test');
  
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: '',
    type: 'check',
    quantity: 1,
    enablePix: true,
    enableGooglePay: true
  });

  useEffect(() => {
    loadPlans();
    loadSettings();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/admin/plans');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      setWebhookUrl(data.settings?.webhookUrl || '');
      setEnvironment(data.settings?.environment || 'test');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          webhookUrl,
          environment,
          mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
          mercadoPagoPublicKey: process.env.MERCADOPAGO_PUBLIC_KEY
        })
      });

      if (response.ok) {
        toast.success('Configurações salvas!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const addPlan = async () => {
    if (!newPlan.name || !newPlan.price) {
      toast.error('Preencha nome e preço');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPlan)
      });

      if (response.ok) {
        toast.success('Plano adicionado!');
        setNewPlan({
          name: '',
          description: '',
          price: '',
          type: 'check',
          quantity: 1,
          enablePix: true,
          enableGooglePay: true
        });
        loadPlans();
      } else {
        throw new Error('Failed to add plan');
      }
    } catch (error) {
      toast.error('Erro ao adicionar plano');
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/plans?planId=${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Plano removido!');
        loadPlans();
      } else {
        throw new Error('Failed to delete plan');
      }
    } catch (error) {
      toast.error('Erro ao remover plano');
    } finally {
      setLoading(false);
    }
  };

  const updatePlanToggle = async (planId, field, value) => {
    try {
      const response = await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId, [field]: value })
      });

      if (response.ok) {
        loadPlans();
      }
    } catch (error) {
      toast.error('Erro ao atualizar plano');
    }
  };

  const selectedPlanType = PLAN_TYPES.find(t => t.value === newPlan.type);

  return (
    <div className="space-y-6 p-6">
      {/* Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Configurações de Pagamento</CardTitle>
          <CardDescription>Configure webhook e ambiente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ambiente</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test (Sandbox)</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Webhook URL (Mercado Pago)</Label>
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://seu-dominio.com/api/payment/webhook"
            />
            <p className="text-xs text-muted-foreground">
              URL atual: {process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook
            </p>
          </div>
          
          <Button onClick={saveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Add New Plan */}
      <Card>
        <CardHeader>
          <CardTitle>➕ Adicionar Novo Plano</CardTitle>
          <CardDescription>Crie planos personalizados com toggles de pagamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Plano</Label>
              <Input
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                placeholder="Ex: Plano Premium"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={newPlan.price}
                onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              placeholder="Descrição opcional"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={newPlan.type} onValueChange={(value) => setNewPlan({ ...newPlan, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlanType?.plural && (
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={newPlan.quantity}
                  onChange={(e) => setNewPlan({ ...newPlan, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                checked={newPlan.enablePix}
                onCheckedChange={(checked) => setNewPlan({ ...newPlan, enablePix: checked })}
              />
              <Label>Habilitar PIX</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={newPlan.enableGooglePay}
                onCheckedChange={(checked) => setNewPlan({ ...newPlan, enableGooglePay: checked })}
              />
              <Label>Habilitar Google Pay</Label>
            </div>
          </div>

          <Button onClick={addPlan} disabled={loading} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Plano
          </Button>
        </CardContent>
      </Card>

      {/* Existing Plans */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Planos Ativos</CardTitle>
          <CardDescription>Gerencie seus planos existentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {plans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum plano criado ainda</p>
          ) : (
            plans.map(plan => (
              <div key={plan._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    R$ {plan.price.toFixed(2)} - {plan.quantity > 1 ? `${plan.quantity} ` : ''}
                    {PLAN_TYPES.find(t => t.value === plan.type)?.label}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={plan.enablePix}
                        onCheckedChange={(checked) => updatePlanToggle(plan._id, 'enablePix', checked)}
                      />
                      <span className="text-xs">PIX</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={plan.enableGooglePay}
                        onCheckedChange={(checked) => updatePlanToggle(plan._id, 'enableGooglePay', checked)}
                      />
                      <span className="text-xs">Google Pay</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePlan(plan._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
