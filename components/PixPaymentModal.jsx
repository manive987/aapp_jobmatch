'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, CheckCircle, Loader2, QrCode, Clock, AlertCircle } from 'lucide-react';

export default function PixPaymentModal({ 
  isOpen, 
  onClose, 
  plan, 
  token, 
  onSuccess,
  language = 'pt-BR'
}) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('pending');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  
  // Create payment when modal opens
  useEffect(() => {
    if (isOpen && plan && !paymentData) {
      createPayment();
    }
  }, [isOpen, plan]);
  
  // Poll for payment status
  useEffect(() => {
    if (!paymentData || status === 'approved') return;
    
    const interval = setInterval(checkPaymentStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [paymentData, status]);
  
  // Countdown timer
  useEffect(() => {
    if (!paymentData || status === 'approved') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [paymentData, status]);
  
  const createPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan_id: plan.id })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro ao criar pagamento');
      }
      
      setPaymentData(data);
      setStatus('pending');
    } catch (error) {
      toast.error(error.message);
      onClose();
    } finally {
      setLoading(false);
    }
  };
  
  const checkPaymentStatus = async () => {
    if (!paymentData?.payment_id || checking) return;
    
    setChecking(true);
    try {
      const response = await fetch(`/api/payment/pix?payment_id=${paymentData.payment_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'approved') {
        setStatus('approved');
        toast.success(language === 'pt-BR' ? '✅ Pagamento confirmado!' : '✅ Payment confirmed!');
        setTimeout(() => {
          onSuccess?.(data);
          onClose();
        }, 2000);
      } else {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    } finally {
      setChecking(false);
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentData.qr_code);
      setCopied(true);
      toast.success(language === 'pt-BR' ? 'Código copiado!' : 'Code copied!');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error(language === 'pt-BR' ? 'Erro ao copiar' : 'Copy failed');
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleClose = () => {
    setPaymentData(null);
    setStatus('pending');
    setTimeLeft(30 * 60);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-500" />
            {language === 'pt-BR' ? 'Pagamento via Pix' : 'Pay with Pix'}
          </DialogTitle>
          <DialogDescription>
            {plan?.name} - R$ {plan?.price?.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-2 text-sm text-muted-foreground">
                {language === 'pt-BR' ? 'Gerando QR Code...' : 'Generating QR Code...'}
              </p>
            </div>
          ) : status === 'approved' ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-green-600">
                {language === 'pt-BR' ? 'Pagamento Confirmado!' : 'Payment Confirmed!'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {language === 'pt-BR' ? 'Seu plano foi ativado com sucesso.' : 'Your plan has been activated.'}
              </p>
            </div>
          ) : paymentData ? (
            <>
              {/* Timer */}
              <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
                timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {language === 'pt-BR' ? 'Expira em' : 'Expires in'}: {formatTime(timeLeft)}
                </span>
              </div>
              
              {/* QR Code */}
              {paymentData.qr_code_base64 && (
                <div className="flex justify-center">
                  <Card className="p-4">
                    <img 
                      src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                      alt="QR Code Pix"
                      className="w-48 h-48"
                    />
                  </Card>
                </div>
              )}
              
              {/* Copia e Cola */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-center">
                  {language === 'pt-BR' ? 'Ou copie o código Pix:' : 'Or copy the Pix code:'}
                </p>
                <div className="relative">
                  <textarea
                    readOnly
                    value={paymentData.qr_code || ''}
                    className="w-full h-20 p-3 text-xs bg-gray-50 border rounded-lg resize-none font-mono"
                  />
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    className={`absolute bottom-2 right-2 ${copied ? 'bg-green-500' : ''}`}
                  >
                    {copied ? (
                      <><CheckCircle className="h-4 w-4 mr-1" /> Copiado</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-1" /> Copiar</>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Instructions */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 text-sm text-blue-800">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>{language === 'pt-BR' ? 'Abra o app do seu banco' : 'Open your bank app'}</li>
                    <li>{language === 'pt-BR' ? 'Escolha pagar com Pix' : 'Choose to pay with Pix'}</li>
                    <li>{language === 'pt-BR' ? 'Escaneie o QR Code ou cole o código' : 'Scan the QR Code or paste the code'}</li>
                    <li>{language === 'pt-BR' ? 'Confirme o pagamento' : 'Confirm the payment'}</li>
                  </ol>
                </CardContent>
              </Card>
              
              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {checking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {language === 'pt-BR' 
                  ? 'Aguardando confirmação do pagamento...' 
                  : 'Waiting for payment confirmation...'}
              </div>
              
              <Button 
                onClick={checkPaymentStatus} 
                variant="outline" 
                className="w-full"
                disabled={checking}
              >
                {checking ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verificando...</>
                ) : (
                  <>{language === 'pt-BR' ? 'Já paguei, verificar' : 'I paid, check status'}</>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'pt-BR' ? 'Erro ao gerar pagamento' : 'Error generating payment'}
              </p>
              <Button onClick={createPayment} className="mt-4">
                {language === 'pt-BR' ? 'Tentar novamente' : 'Try again'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
