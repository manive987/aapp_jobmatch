'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Check, QrCode, Smartphone, Crown, Zap, Star } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import { isPlayStoreAvailable, purchaseSubscription, PRODUCTS } from '@/lib/playstore';

export default function PlansPage() {
  const router = useRouter();
  const { user, token, updateUser } = useAuth();
  const { language } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [playStoreAvailable, setPlayStoreAvailable] = useState(false);
  
  useEffect(() => {
    fetchPlans();
    setPlayStoreAvailable(isPlayStoreAvailable());
  }, []);
  
  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      setPlans(data.plans?.filter(p => p.active) || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectPlan = (plan, method) => {
    setSelectedPlan(plan);
    
    if (method === 'pix') {
      setShowPixModal(true);
    } else if (method === 'playstore') {
      handlePlayStorePurchase(plan);
    }
  };
  
  const handlePlayStorePurchase = async (plan) => {
    try {
      // Map plan to Play Store product ID
      const productId = plan.name.toLowerCase().includes('plus') 
        ? PRODUCTS.PLUS 
        : PRODUCTS.PRO;
      
      const result = await purchaseSubscription(productId, token);
      
      if (result.success) {
        toast.success(language === 'pt-BR' ? 'Plano ativado!' : 'Plan activated!');
        updateUser({ 
          plan: result.plan, 
          evaluations_limit: result.evaluations_limit,
          evaluations_used: 0
        });
        router.push('/');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(language === 'pt-BR' ? 'Erro ao processar pagamento' : 'Payment error');
    }
  };
  
  const handlePixSuccess = (data) => {
    toast.success(language === 'pt-BR' ? 'Plano ativado com sucesso!' : 'Plan activated successfully!');
    updateUser({ 
      plan: data.plan_name?.toLowerCase() || 'premium',
      evaluations_limit: 999,
      evaluations_used: 0
    });
    router.push('/');
  };
  
  const getPlanIcon = (planName) => {
    const name = planName.toLowerCase();
    if (name.includes('pro') || name.includes('vitalício')) return <Crown className="h-6 w-6" />;
    if (name.includes('plus')) return <Zap className="h-6 w-6" />;
    return <Star className="h-6 w-6" />;
  };
  
  const getPlanColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-amber-500 to-orange-500',
      'from-emerald-500 to-green-500',
      'from-pink-500 to-rose-500',
    ];
    return colors[index % colors.length];
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'pt-BR' ? 'Escolha seu Plano' : 'Choose your Plan'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'pt-BR' 
                ? 'Desbloqueie todo o potencial do JobMatch AI'
                : 'Unlock the full potential of JobMatch AI'}
            </p>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Current Plan */}
        {user && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'pt-BR' ? 'Seu plano atual' : 'Your current plan'}
                  </p>
                  <p className="text-xl font-bold capitalize">{user.plan || 'Free'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {language === 'pt-BR' ? 'Análises restantes' : 'Remaining analyses'}
                  </p>
                  <p className="text-xl font-bold">
                    {user.evaluations_limit - user.evaluations_used} / {user.evaluations_limit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden hover:shadow-xl transition-shadow ${
                index === 1 ? 'border-2 border-purple-400 shadow-lg' : ''
              }`}
            >
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                  {language === 'pt-BR' ? 'Popular' : 'Popular'}
                </div>
              )}
              
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(index)} flex items-center justify-center text-white mb-3`}>
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  {plan.description || `${plan.quantity} ${plan.type}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">R$ {plan.price.toFixed(2)}</span>
                  {plan.type && plan.type !== 'lifetime' && (
                    <span className="text-muted-foreground text-sm">
                      {plan.type === 'check' && ' / check'}
                      {plan.type === 'checks' && ` / ${plan.quantity} checks`}
                      {plan.type === 'day' && ' / dia'}
                      {plan.type === 'days' && ` / ${plan.quantity} dias`}
                      {plan.type === 'month' && ' / mês'}
                      {plan.type === 'months' && ` / ${plan.quantity} meses`}
                      {plan.type === 'year' && ' / ano'}
                      {plan.type === 'years' && ` / ${plan.quantity} anos`}
                    </span>
                  )}
                  {plan.type === 'lifetime' && (
                    <span className="text-muted-foreground text-sm"> - Vitalício</span>
                  )}
                </div>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {(plan.type === 'check' || plan.type === 'checks')
                      ? `${plan.quantity} ${language === 'pt-BR' ? 'verificações completas' : 'complete checks'}`
                      : language === 'pt-BR' ? 'Verificações ilimitadas' : 'Unlimited checks'}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {language === 'pt-BR' ? 'Carta de apresentação AI' : 'AI cover letter'}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {language === 'pt-BR' ? 'Cálculo de valor líquido' : 'Net value calculation'}
                  </li>
                  {plan.type === 'lifetime' && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {language === 'pt-BR' ? 'Acesso vitalício' : 'Lifetime access'}
                    </li>
                  )}
                </ul>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                {plan.enablePix && (
                  <Button 
                    onClick={() => handleSelectPlan(plan, 'pix')}
                    className={`w-full bg-gradient-to-r ${getPlanColor(index)} hover:opacity-90`}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {language === 'pt-BR' ? 'Pagar com Pix' : 'Pay with Pix'}
                  </Button>
                )}
                
                {plan.enableGooglePay && playStoreAvailable && (
                  <Button 
                    onClick={() => handleSelectPlan(plan, 'playstore')}
                    variant="outline"
                    className="w-full"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    {language === 'pt-BR' ? 'Google Play' : 'Google Play'}
                  </Button>
                )}
                
                {!plan.enablePix && !plan.enableGooglePay && (
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    {language === 'pt-BR' ? 'Em breve' : 'Coming soon'}
                  </Badge>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'pt-BR' 
                ? 'Nenhum plano disponível no momento.'
                : 'No plans available at the moment.'}
            </p>
          </div>
        )}
        
        {/* Security Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>🔒 {language === 'pt-BR' 
            ? 'Pagamentos processados com segurança pelo Mercado Pago'
            : 'Payments securely processed by Mercado Pago'}</p>
        </div>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPixModal}
        onClose={() => {
          setShowPixModal(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        token={token}
        onSuccess={handlePixSuccess}
        language={language}
      />
    </div>
  );
}
