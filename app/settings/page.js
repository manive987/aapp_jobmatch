'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { t, formatCurrency } from '@/lib/i18n';

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    home_location: '',
    transport_cost_outbound: '',
    transport_cost_return: '',
    desired_salary: '',
    desired_position: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && token) {
      fetchSettings();
    }
  }, [user, token]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success(t('settings.saved', language));
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast.error(language === 'pt-BR' ? 'Erro ao salvar configurações' : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading', language)}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-blue-600">{t('settings.title', language)}</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.title', language)}</CardTitle>
            <CardDescription>
              {t('settings.description', language)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Home Location */}
              <div className="space-y-2">
                <Label htmlFor="home_location">{t('settings.homeLocation', language)}</Label>
                <Input
                  id="home_location"
                  value={settings.home_location}
                  onChange={(e) => setSettings(prev => ({ ...prev, home_location: e.target.value }))}
                  placeholder={language === 'pt-BR' ? 'Ex: São Paulo, SP' : 'Ex: New York, NY'}
                />
              </div>

              {/* Transport Costs */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transport_outbound">
                    {t('settings.transportOutbound', language)}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {user?.currency === 'BRL' ? 'R$' : user?.currency === 'EUR' ? '€' : '$'}
                    </span>
                    <Input
                      id="transport_outbound"
                      type="number"
                      step="0.01"
                      value={settings.transport_cost_outbound}
                      onChange={(e) => setSettings(prev => ({ ...prev, transport_cost_outbound: e.target.value }))}
                      placeholder="8.50"
                      className="pl-12"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'pt-BR' ? 'Custo total de ida e volta' : 'Total round trip cost'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transport_return">
                    {t('settings.transportReturn', language)}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {user?.currency === 'BRL' ? 'R$' : user?.currency === 'EUR' ? '€' : '$'}
                    </span>
                    <Input
                      id="transport_return"
                      type="number"
                      step="0.01"
                      value={settings.transport_cost_return}
                      onChange={(e) => setSettings(prev => ({ ...prev, transport_cost_return: e.target.value }))}
                      placeholder="8.50"
                      className="pl-12"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'pt-BR' ? 'Custos adicionais como estacionamento, etc' : 'Additional costs like parking, etc'}
                  </p>
                </div>
              </div>

              {/* Desired Salary */}
              <div className="space-y-2">
                <Label htmlFor="desired_salary">{t('settings.desiredSalary', language)}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {user?.currency === 'BRL' ? 'R$' : user?.currency === 'EUR' ? '€' : '$'}
                  </span>
                  <Input
                    id="desired_salary"
                    type="number"
                    step="0.01"
                    value={settings.desired_salary}
                    onChange={(e) => setSettings(prev => ({ ...prev, desired_salary: e.target.value }))}
                    placeholder="5000"
                    className="pl-12"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'pt-BR' 
                    ? 'O Gemini comparará com o salário da vaga e ajustará o score' 
                    : 'Gemini will compare with job salary and adjust the score'}
                </p>
              </div>

              {/* Desired Position */}
              <div className="space-y-2">
                <Label htmlFor="desired_position">{t('settings.desiredPosition', language)}</Label>
                <Input
                  id="desired_position"
                  value={settings.desired_position}
                  onChange={(e) => setSettings(prev => ({ ...prev, desired_position: e.target.value }))}
                  placeholder={language === 'pt-BR' ? 'Ex: Desenvolvedor Full-Stack' : 'Ex: Full-Stack Developer'}
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'pt-BR' 
                    ? 'O Gemini comparará com o cargo da vaga e ajustará o score' 
                    : 'Gemini will compare with job position and adjust the score'}
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 {language === 'pt-BR' 
                    ? 'Essas configurações serão usadas automaticamente para preencher o formulário de análise.' 
                    : 'These settings will be used automatically to pre-fill the analysis form.'}
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  {t('settings.backToHome', language)}
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? t('settings.saving', language) : t('settings.save', language)}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
