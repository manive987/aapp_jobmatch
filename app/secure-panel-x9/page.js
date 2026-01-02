'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminPlansManager from '@/components/AdminPlansManager';
import BlogManager from '@/components/BlogManager';
import SEOManager from '@/components/SEOManager';
import SiteBlocksManager from '@/components/SiteBlocksManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Users, DollarSign, Activity, Package } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'admin-secret-token') {
      setAuthenticated(true);
      fetchStats();
    }
  }, []);
  
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      localStorage.setItem('admin_token', 'admin-secret-token');
      setAuthenticated(true);
      fetchStats();
      toast.success('Login realizado com sucesso!');
    } else {
      toast.error('Senha inválida');
    }
  };
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': 'Bearer admin-secret-token' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthenticated(false);
    setPassword('');
  };
  
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">🔐 Admin Panel</CardTitle>
            <CardDescription className="text-center">
              JobMatch - Sistema de Gerenciamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha de Administrador</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="text-lg"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Entrar
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Senha padrão: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">JobMatch - Gestão de Pagamentos</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Usuários</p>
                  <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avaliações</p>
                  <h3 className="text-2xl font-bold">{stats?.totalEvaluations || 0}</h3>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <h3 className="text-2xl font-bold">
                    R$ {(stats?.totalRevenue || 0).toFixed(2)}
                  </h3>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Planos Ativos</p>
                  <h3 className="text-2xl font-bold">{stats?.activePlans || 0}</h3>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="blocks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="blocks">
              🧱 Site
            </TabsTrigger>
            <TabsTrigger value="blog">
              📝 Blog
            </TabsTrigger>
            <TabsTrigger value="seo">
              🔍 SEO
            </TabsTrigger>
            <TabsTrigger value="plans">
              💳 Planos
            </TabsTrigger>
            <TabsTrigger value="transactions">
              📊 Transações
            </TabsTrigger>
            <TabsTrigger value="config">
              ⚙️ Config
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="blocks">
            <SiteBlocksManager token="admin-secret-token" />
          </TabsContent>
          
          <TabsContent value="blog">
            <BlogManager token="admin-secret-token" />
          </TabsContent>
          
          <TabsContent value="seo">
            <SEOManager token="admin-secret-token" />
          </TabsContent>
          
          <TabsContent value="plans">
            <AdminPlansManager token="admin-secret-token" />
          </TabsContent>
          
          <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent>
          
          <TabsContent value="config">
            <ConfigTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/transactions', {
        headers: { 'Authorization': 'Bearer admin-secret-token' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Histórico de Transações</CardTitle>
        <CardDescription>Últimas transações do Mercado Pago</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma transação encontrada
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map(transaction => (
              <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{transaction.planId}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">R$ {transaction.amount.toFixed(2)}</p>
                  <p className={`text-xs ${
                    transaction.status === 'approved' ? 'text-green-600' :
                    transaction.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {transaction.status.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConfigTab() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setWebhookUrl(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`);
  }, []);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Configurações do Sistema</CardTitle>
          <CardDescription>Configurações gerais e integrações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mercado Pago - Access Token</Label>
            <Input
              type="password"
              value={process.env.MERCADOPAGO_ACCESS_TOKEN || '****'}
              disabled
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Configurado via variável de ambiente
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Mercado Pago - Public Key</Label>
            <Input
              type="password"
              value={process.env.MERCADOPAGO_PUBLIC_KEY || '****'}
              disabled
              className="font-mono text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Webhook URL (Copie para configurar no Mercado Pago)</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  toast.success('URL copiada!');
                }}
              >
                Copiar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure esta URL no painel do Mercado Pago em: Integrações → Webhooks
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Gemini API Key</Label>
            <Input
              type="password"
              value={process.env.GEMINI_API_KEY ? '****' + process.env.GEMINI_API_KEY.slice(-4) : 'Não configurado'}
              disabled
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">📚 Como Configurar o Webhook</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            <li>Acesse o painel do Mercado Pago</li>
            <li>Vá em <strong>Integrações → Webhooks</strong></li>
            <li>Clique em <strong>Adicionar Webhook</strong></li>
            <li>Cole a URL acima no campo de URL</li>
            <li>Selecione os eventos: <strong>payment</strong></li>
            <li>Salve a configuração</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
