'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Copy, Upload, LogOut, Globe, Settings, FileText, Download, Image, MessageCircle, Mail, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { t, formatCurrency } from '@/lib/i18n';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function JobMatchForm() {
  const router = useRouter();
  const { user, logout, token, updateUser } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const resultsRef = useRef(null);
  const [formData, setFormData] = useState({
    cvFile: null,
    cvText: '',
    jobLink: '',
    jobDescription: '',
    jobLocation: '',
    homeLocation: '',
    workSchedule: '',
    grossSalary: '',
    dailyTransportCost: '',
    benefits: [{ name: '', value: '' }],
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pullingDetails, setPullingDetails] = useState(false);
  const [error, setError] = useState('');
  const [cvInputMode, setCvInputMode] = useState('upload'); // 'upload' or 'text'
  const [isTestMode, setIsTestMode] = useState(false);
  
  useEffect(() => {
    if (user && token) {
      fetchUserSettings();
      fetchAdminSettings();
    }
  }, [user, token]);
  
  const fetchAdminSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': 'Bearer admin-secret-token'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsTestMode(data.environment_mode === 'test');
      }
    } catch (error) {
      console.error('Failed to fetch admin settings:', error);
    }
  };
  
  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setFormData(prev => ({
            ...prev,
            homeLocation: data.settings.home_location || prev.homeLocation,
            dailyTransportCost: data.settings.transport_cost_outbound || prev.dailyTransportCost,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, cvFile: file }));
    }
  };
  
  const handlePullDetails = async () => {
    if (!formData.jobLink) {
      toast.error(language === 'pt-BR' ? 'Por favor, insira o link da vaga primeiro' : 'Please enter the job link first');
      return;
    }
    
    setPullingDetails(true);
    try {
      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: formData.jobLink })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to pull job details');
      }
      
      const data = await response.json();
      
      // Update all extracted fields
      setFormData(prev => ({
        ...prev,
        jobDescription: data.jobDescription || prev.jobDescription,
        jobLocation: data.jobLocation || prev.jobLocation,
        grossSalary: data.grossSalary || prev.grossSalary,
        workSchedule: data.workSchedule || prev.workSchedule,
        benefits: data.benefits && data.benefits.length > 0 ? data.benefits : prev.benefits
      }));
      
      const message = language === 'pt-BR' 
        ? 'Detalhes puxados e campos preenchidos automaticamente!' 
        : 'Details pulled and fields auto-filled!';
      toast.success(message);
    } catch (err) {
      const errorMsg = language === 'pt-BR' 
        ? 'Não foi possível puxar os detalhes. Sites como LinkedIn/Glassdoor/Indeed possuem proteção. Cole manualmente.' 
        : 'Could not pull details. Sites like LinkedIn/Glassdoor/Indeed have protection. Paste manually.';
      toast.error(errorMsg);
    } finally {
      setPullingDetails(false);
    }
  };
  
  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, { name: '', value: '' }]
    }));
  };
  
  const removeBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };
  
  const updateBenefit = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => 
        i === index ? { ...benefit, [field]: value } : benefit
      )
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const formPayload = new FormData();
      
      // Handle CV input based on mode
      if (cvInputMode === 'upload') {
        if (!formData.cvFile) {
          throw new Error(language === 'pt-BR' ? 'Por favor, faça upload do CV' : 'Please upload your CV');
        }
        formPayload.append('cvFile', formData.cvFile);
      } else {
        if (!formData.cvText || formData.cvText.trim().length < 50) {
          throw new Error(language === 'pt-BR' 
            ? 'Por favor, cole o conteúdo do seu CV (mínimo 50 caracteres)' 
            : 'Please paste your CV content (minimum 50 characters)');
        }
        // Create a text blob to send as file
        const cvBlob = new Blob([formData.cvText], { type: 'text/plain' });
        formPayload.append('cvFile', cvBlob, 'cv.txt');
      }
      
      formPayload.append('jobLink', formData.jobLink);
      formPayload.append('jobDescription', formData.jobDescription);
      formPayload.append('jobLocation', formData.jobLocation);
      formPayload.append('homeLocation', formData.homeLocation);
      formPayload.append('workSchedule', formData.workSchedule);
      formPayload.append('grossSalary', formData.grossSalary);
      formPayload.append('dailyTransportCost', formData.dailyTransportCost);
      formPayload.append('benefits', JSON.stringify(formData.benefits));
      formPayload.append('language', language);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formPayload
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }
      
      const data = await response.json();
      setResults(data);
      
      // Update user evaluations count
      updateUser({
        evaluations_used: data.evaluations_used,
      });
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t('results.copied', language));
  };
  
  // Improved Export functions - Professional PDF/PNG generation
  const exportToPDF = async () => {
    if (!results) return;
    
    try {
      toast.loading(language === 'pt-BR' ? 'Gerando PDF profissional...' : 'Generating professional PDF...');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let y = margin;
      
      // Header
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('JobMatch AI', margin, 25);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(language === 'pt-BR' ? 'Relatório de Análise de Compatibilidade' : 'Job Compatibility Analysis Report', margin, 35);
      
      y = 50;
      
      // Score Section
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(240, 249, 255);
      pdf.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'pt-BR' ? 'Pontuação de Compatibilidade' : 'Compatibility Score', margin + 5, y + 12);
      
      // Score circle
      const scoreColor = results.score >= 70 ? [34, 197, 94] : results.score >= 50 ? [251, 191, 36] : [239, 68, 68];
      pdf.setFillColor(...scoreColor);
      pdf.circle(pageWidth - margin - 20, y + 17, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${results.score}%`, pageWidth - margin - 28, y + 21);
      
      y += 45;
      
      // Financial Summary
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(240, 253, 244);
      pdf.roundedRect(margin, y, contentWidth, 50, 3, 3, 'F');
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'pt-BR' ? 'Resumo Financeiro' : 'Financial Summary', margin + 5, y + 12);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${language === 'pt-BR' ? 'Valor Líquido' : 'Net Value'}: ${formatCurrency(results.net_value, user?.currency)}`, margin + 5, y + 24);
      pdf.text(`${language === 'pt-BR' ? 'Transporte Mensal' : 'Monthly Transport'}: ${formatCurrency(results.monthly_transport_cost, user?.currency)}`, margin + 5, y + 32);
      if (results.total_benefits > 0) {
        pdf.text(`${language === 'pt-BR' ? 'Total Benefícios' : 'Total Benefits'}: ${formatCurrency(results.total_benefits, user?.currency)}`, margin + 5, y + 40);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${language === 'pt-BR' ? 'Valor + Benefícios' : 'Value + Benefits'}: ${formatCurrency(results.net_value_with_benefits, user?.currency)}`, margin + 100, y + 24);
      }
      
      y += 60;
      
      // Analysis
      pdf.setFillColor(249, 250, 251);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'pt-BR' ? 'Análise' : 'Analysis', margin, y);
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const analysisLines = pdf.splitTextToSize(results.analysis, contentWidth);
      pdf.text(analysisLines, margin, y);
      y += (analysisLines.length * 5) + 10;
      
      // Check if need new page
      if (y > pageHeight - 80) {
        pdf.addPage();
        y = margin;
      }
      
      // Cover Letter
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'pt-BR' ? 'Carta de Apresentação' : 'Cover Letter', margin, y);
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const coverLines = pdf.splitTextToSize(results.cover_letter, contentWidth);
      pdf.text(coverLines, margin, y);
      y += (coverLines.length * 5) + 10;
      
      // Check if need new page
      if (y > pageHeight - 60) {
        pdf.addPage();
        y = margin;
      }
      
      // Email Draft
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'pt-BR' ? 'E-mail de Apresentação' : 'Introduction Email', margin, y);
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const emailLines = pdf.splitTextToSize(results.email_draft, contentWidth);
      pdf.text(emailLines, margin, y);
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`JobMatch AI - ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
      
      pdf.save(`jobmatch-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss();
      toast.success(language === 'pt-BR' ? 'PDF salvo com sucesso!' : 'PDF saved successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error(language === 'pt-BR' ? 'Erro ao gerar PDF' : 'Error generating PDF');
      console.error(error);
    }
  };
  
  const exportToPNG = async () => {
    if (!resultsRef.current) return;
    
    try {
      toast.loading(language === 'pt-BR' ? 'Gerando imagem...' : 'Generating image...');
      
      // Create a styled container for better PNG export
      const container = document.createElement('div');
      container.style.cssText = 'padding: 40px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); width: 800px; font-family: system-ui, -apple-system, sans-serif;';
      
      container.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #3b82f6;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
              <span style="color: white; font-weight: bold; font-size: 24px;">J</span>
            </div>
            <div>
              <h1 style="margin: 0; font-size: 24px; color: #1e40af;">JobMatch AI</h1>
              <p style="margin: 0; color: #64748b; font-size: 14px;">${language === 'pt-BR' ? 'Análise de Compatibilidade' : 'Compatibility Analysis'}</p>
            </div>
          </div>
          
          <div style="display: flex; gap: 24px; margin-bottom: 24px;">
            <div style="flex: 1; background: #f0f9ff; padding: 20px; border-radius: 12px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">${language === 'pt-BR' ? 'Score' : 'Score'}</p>
              <p style="margin: 0; font-size: 48px; font-weight: bold; color: ${results.score >= 70 ? '#22c55e' : results.score >= 50 ? '#f59e0b' : '#ef4444'};">${results.score}%</p>
            </div>
            <div style="flex: 1; background: #f0fdf4; padding: 20px; border-radius: 12px;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">${language === 'pt-BR' ? 'Valor Líquido' : 'Net Value'}</p>
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #16a34a;">${formatCurrency(results.net_value, user?.currency)}</p>
              ${results.total_benefits > 0 ? `<p style="margin: 8px 0 0 0; color: #64748b; font-size: 12px;">${language === 'pt-BR' ? '+ Benefícios' : '+ Benefits'}: ${formatCurrency(results.total_benefits, user?.currency)}</p>` : ''}
            </div>
          </div>
          
          <div style="background: #fafafa; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">${language === 'pt-BR' ? 'Análise' : 'Analysis'}</h3>
            <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">${results.analysis}</p>
          </div>
          
          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">JobMatch AI • ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(container);
      
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      
      document.body.removeChild(container);
      
      const link = document.createElement('a');
      link.download = `jobmatch-analysis-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.dismiss();
      toast.success(language === 'pt-BR' ? 'Imagem salva com sucesso!' : 'Image saved successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error(language === 'pt-BR' ? 'Erro ao gerar imagem' : 'Error generating image');
      console.error(error);
    }
  };
  
  const shareViaWhatsApp = () => {
    const text = language === 'pt-BR' 
      ? `🎯 *Análise de Compatibilidade de Vaga*\n\n📊 *Score:* ${results.score}%\n💰 *Valor Líquido:* ${formatCurrency(results.net_value, user?.currency)}\n\n📝 *Análise:*\n${results.analysis.substring(0, 500)}...\n\n_Gerado por JobMatch AI_`
      : `🎯 *Job Match Analysis*\n\n📊 *Score:* ${results.score}%\n💰 *Net Value:* ${formatCurrency(results.net_value, user?.currency)}\n\n📝 *Analysis:*\n${results.analysis.substring(0, 500)}...\n\n_Generated by JobMatch AI_`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  
  const shareViaEmail = () => {
    const subject = language === 'pt-BR' 
      ? `Análise de Compatibilidade de Vaga - Score: ${results.score}%`
      : `Job Match Analysis - Score: ${results.score}%`;
    
    const body = language === 'pt-BR'
      ? `🎯 Análise de Compatibilidade de Vaga\n\n📊 Score: ${results.score}%\n💰 Valor Líquido: ${formatCurrency(results.net_value, user?.currency)}\n💵 Valor + Benefícios: ${formatCurrency(results.net_value_with_benefits, user?.currency)}\n\n📝 Análise:\n${results.analysis}\n\n✉️ Carta de Apresentação:\n${results.cover_letter}\n\n📧 E-mail Sugerido:\n${results.email_draft}\n\n---\nGerado por JobMatch AI`
      : `🎯 Job Match Analysis\n\n📊 Score: ${results.score}%\n💰 Net Value: ${formatCurrency(results.net_value, user?.currency)}\n💵 Value + Benefits: ${formatCurrency(results.net_value_with_benefits, user?.currency)}\n\n📝 Analysis:\n${results.analysis}\n\n✉️ Cover Letter:\n${results.cover_letter}\n\n📧 Suggested Email:\n${results.email_draft}\n\n---\nGenerated by JobMatch AI`;
    
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };
  
  const handleUpgrade = async (plan) => {
    // Redirect to plans page
    router.push('/plans');
  };
  
  return (
    <div className={`min-h-screen ${isTestMode ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Test Mode Banner */}
      {isTestMode && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 text-center text-sm font-medium shadow-md">
          <span className="inline-flex items-center gap-2">
            ⚠️ {language === 'pt-BR' ? 'MODO DE TESTE - Pagamentos simulados' : 'TEST MODE - Simulated payments'}
          </span>
        </div>
      )}
      
      {/* Header */}
      <header className={`${isTestMode ? 'bg-amber-50 border-amber-200' : 'bg-white/80 backdrop-blur-sm'} shadow-sm border-b sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${isTestMode ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <h1 className={`text-2xl font-bold ${isTestMode ? 'text-amber-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
              JobMatch AI
            </h1>
            {isTestMode && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200">
                TEST
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/settings')}
              title={language === 'pt-BR' ? 'Configurações' : 'Settings'}
              className={isTestMode ? 'hover:bg-amber-100' : 'hover:bg-blue-50'}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeLanguage(language === 'pt-BR' ? 'en' : 'pt-BR')}
              className={isTestMode ? 'hover:bg-amber-100' : 'hover:bg-blue-50'}
            >
              <Globe className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={logout} className={isTestMode ? 'border-amber-300 hover:bg-amber-50' : ''}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('auth.logout', language)}
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Plan Info */}
        <Card className={`mb-8 ${isTestMode ? 'border-amber-200 bg-amber-50/50' : 'bg-white/60 backdrop-blur-sm border-white/50'} shadow-lg`}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">{t('plan.current', language)}</div>
                <div className={`text-2xl font-bold capitalize ${isTestMode ? 'text-amber-700' : 'text-indigo-700'}`}>{user?.plan}</div>
              </div>
              <div className="flex-1 max-w-md">
                <div className="text-sm text-muted-foreground mb-2">
                  {t('plan.usedEvaluations', language)}: {user?.evaluations_used} / {user?.evaluations_limit}
                </div>
                <Progress 
                  value={(user?.evaluations_used / user?.evaluations_limit) * 100} 
                  className={isTestMode ? '[&>div]:bg-amber-500' : '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500'}
                />
              </div>
              {user?.plan === 'free' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleUpgrade('plus')} 
                    size="sm"
                    className={isTestMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'}
                  >
                    {t('plan.plus', language)}
                  </Button>
                  <Button 
                    onClick={() => handleUpgrade('pro')} 
                    size="sm"
                    className={isTestMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'}
                  >
                    {t('plan.pro', language)}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Main Form */}
        <Card className={`mb-8 ${isTestMode ? 'border-amber-200' : 'border-white/50'} bg-white/80 backdrop-blur-sm shadow-xl`}>
          <CardHeader>
            <CardTitle className={isTestMode ? 'text-amber-700' : 'text-indigo-700'}>{t('form.analyzeMatch', language)}</CardTitle>
            <CardDescription>
              {language === 'pt-BR' 
                ? 'Faça upload do seu currículo e insira os detalhes da vaga para análise'
                : 'Upload your CV and enter job details for analysis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* CV Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cvFile">{t('form.uploadCV', language)}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCvInputMode(cvInputMode === 'upload' ? 'text' : 'upload');
                      setFormData(prev => ({ ...prev, cvFile: null, cvText: '' }));
                    }}
                    className={`text-xs ${isTestMode ? 'hover:bg-amber-100' : 'hover:bg-blue-50'}`}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    {cvInputMode === 'upload' 
                      ? (language === 'pt-BR' ? 'Colar Texto' : 'Paste Text')
                      : (language === 'pt-BR' ? 'Upload Arquivo' : 'Upload File')}
                  </Button>
                </div>
                
                {cvInputMode === 'upload' ? (
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isTestMode ? 'hover:border-amber-400 hover:bg-amber-50/50' : 'hover:border-blue-400 hover:bg-blue-50/50'}`}>
                    <Upload className={`h-12 w-12 mx-auto mb-4 ${isTestMode ? 'text-amber-400' : 'text-blue-400'}`} />
                    <Input
                      id="cvFile"
                      type="file"
                      accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,.heic"
                      onChange={handleFileChange}
                      className="max-w-xs mx-auto"
                      required={cvInputMode === 'upload'}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {formData.cvFile ? formData.cvFile.name : t('form.dragDrop', language)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Textarea
                      placeholder={language === 'pt-BR' 
                        ? 'Cole o conteúdo do seu currículo aqui...\n\nNome\nExperiência\nFormação\nHabilidades\n...' 
                        : 'Paste your CV content here...\n\nName\nExperience\nEducation\nSkills\n...'}
                      value={formData.cvText}
                      onChange={(e) => setFormData(prev => ({ ...prev, cvText: e.target.value }))}
                      rows={15}
                      className="font-mono text-sm"
                      required={cvInputMode === 'text'}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {language === 'pt-BR' 
                        ? `${formData.cvText.length} caracteres` 
                        : `${formData.cvText.length} characters`}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Job Link */}
              <div className="space-y-2">
                <Label htmlFor="jobLink">{t('form.jobLink', language)}</Label>
                <div className="flex gap-2">
                  <Input
                    id="jobLink"
                    type="url"
                    value={formData.jobLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobLink: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button 
                    type="button"
                    onClick={handlePullDetails}
                    disabled={pullingDetails || !formData.jobLink}
                    variant="outline"
                  >
                    {pullingDetails ? t('form.pulling', language) : t('form.pullDetails', language)}
                  </Button>
                </div>
              </div>
              
              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="jobDescription">{t('form.jobDescription', language)}</Label>
                <Textarea
                  id="jobDescription"
                  value={formData.jobDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                  rows={6}
                  required
                />
              </div>
              
              {/* Locations */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobLocation">{t('form.jobLocation', language)}</Label>
                  <Input
                    id="jobLocation"
                    value={formData.jobLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobLocation: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeLocation">{t('form.homeLocation', language)}</Label>
                  <Input
                    id="homeLocation"
                    value={formData.homeLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, homeLocation: e.target.value }))}
                  />
                </div>
              </div>
              
              {/* Work Schedule */}
              <div className="space-y-2">
                <Label htmlFor="workSchedule">{t('form.workSchedule', language)}</Label>
                <Input
                  id="workSchedule"
                  value={formData.workSchedule}
                  onChange={(e) => setFormData(prev => ({ ...prev, workSchedule: e.target.value }))}
                  placeholder={t('form.workSchedulePlaceholder', language)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'pt-BR' 
                    ? 'Ex: 6x1 (6 dias trabalho, 1 folga), 5x2, 7x0, etc' 
                    : 'Ex: 6x1 (6 work days, 1 off), 5x2, 7x0, etc'}
                </p>
              </div>
              
              {/* Salary and Transport */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grossSalary">{t('form.grossSalary', language)}</Label>
                  <Input
                    id="grossSalary"
                    type="number"
                    step="0.01"
                    value={formData.grossSalary}
                    onChange={(e) => setFormData(prev => ({ ...prev, grossSalary: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyTransportCost">{t('form.dailyTransportCost', language)}</Label>
                  <Input
                    id="dailyTransportCost"
                    type="number"
                    step="0.01"
                    value={formData.dailyTransportCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, dailyTransportCost: e.target.value }))}
                    required
                    placeholder={language === 'pt-BR' ? 'Ex: 17.00 (ida e volta)' : 'Ex: 17.00 (round trip)'}
                  />
                </div>
              </div>
              
              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t('form.benefits', language)}</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={addBenefit}
                  >
                    <span className="text-lg mr-1">+</span>
                    {t('form.addBenefit', language)}
                  </Button>
                </div>
                
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder={t('form.benefitName', language)}
                        value={benefit.name}
                        onChange={(e) => updateBenefit(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t('form.benefitValue', language)}
                        value={benefit.value}
                        onChange={(e) => updateBenefit(index, 'value', e.target.value)}
                      />
                    </div>
                    {formData.benefits.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => removeBenefit(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  {language === 'pt-BR' 
                    ? 'Ex: Vale Refeição, Vale Transporte, Plano de Saúde, etc' 
                    : 'Ex: Meal Voucher, Transport Voucher, Health Insurance, etc'}
                </p>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className={`w-full ${isTestMode ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'} text-white shadow-lg`} 
                size="lg" 
                disabled={loading}
              >
                {loading ? t('form.analyzing', language) : t('form.analyzeMatch', language)}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Results Section */}
        {results && (
          <div id="results" className="space-y-6" ref={resultsRef}>
            {/* Export/Share Buttons */}
            <Card className={`${isTestMode ? 'bg-amber-50/80 border-amber-200' : 'bg-white/80 border-white/50'} backdrop-blur-sm shadow-lg`}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="text-sm text-muted-foreground mr-2">
                    {language === 'pt-BR' ? 'Salvar/Compartilhar:' : 'Save/Share:'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPDF}
                    className={`gap-2 ${isTestMode ? 'border-amber-300 hover:bg-amber-100' : 'border-blue-200 hover:bg-blue-50'}`}
                    title={language === 'pt-BR' ? 'Salvar como PDF' : 'Save as PDF'}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPNG}
                    className={`gap-2 ${isTestMode ? 'border-amber-300 hover:bg-amber-100' : 'border-blue-200 hover:bg-blue-50'}`}
                    title={language === 'pt-BR' ? 'Salvar como PNG' : 'Save as PNG'}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareViaWhatsApp}
                    className={`gap-2 ${isTestMode ? 'border-amber-300 hover:bg-amber-100' : 'border-green-200 hover:bg-green-50'}`}
                    title={language === 'pt-BR' ? 'Compartilhar via WhatsApp' : 'Share via WhatsApp'}
                  >
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareViaEmail}
                    className={`gap-2 ${isTestMode ? 'border-amber-300 hover:bg-amber-100' : 'border-blue-200 hover:bg-blue-50'}`}
                    title={language === 'pt-BR' ? 'Compartilhar via E-mail' : 'Share via Email'}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Score Card */}
            <Card className={`${isTestMode ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-200' : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border-white/50'} backdrop-blur-lg border-2 shadow-xl`}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-muted-foreground mb-4">
                    {t('results.score', language)}
                  </div>
                  <div className="relative inline-flex items-center justify-center w-40 h-40 mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke={isTestMode ? "#f59e0b" : "#3b82f6"}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - results.score / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className={`absolute text-4xl font-bold ${isTestMode ? 'text-amber-600' : 'text-blue-600'}`}>
                      {results.score}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Analysis Card */}
            <Card className={`${isTestMode ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-200' : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border-white/50'} backdrop-blur-lg border-2 shadow-xl`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={isTestMode ? 'text-amber-700' : 'text-indigo-700'}>{t('results.analysis', language)}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(results.analysis)}
                    className={isTestMode ? 'hover:bg-amber-100' : 'hover:bg-blue-50'}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{results.analysis}</p>
              </CardContent>
            </Card>
            
            {/* Net Value Card */}
            <Card className={`${isTestMode ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-green-50 border-amber-200' : 'bg-gradient-to-br from-white via-green-50 to-emerald-50 border-white/50'} backdrop-blur-lg border-2 shadow-xl`}>
              <CardHeader>
                <CardTitle className={isTestMode ? 'text-amber-700' : 'text-green-700'}>{t('results.netValue', language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold mb-2 ${isTestMode ? 'text-amber-600' : 'text-green-600'}`}>
                  {formatCurrency(results.net_value, user?.currency)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('results.calculation', language)}
                </p>
                {results.work_schedule && (
                  <div className={`mt-4 p-4 rounded-xl ${isTestMode ? 'bg-amber-100/50' : 'bg-blue-50'}`}>
                    <div className={`text-sm font-medium mb-1 ${isTestMode ? 'text-amber-900' : 'text-blue-900'}`}>
                      {t('results.workSchedule', language)}: {results.work_schedule.days_per_week} {language === 'pt-BR' ? 'dias/semana' : 'days/week'}
                    </div>
                    <div className={`text-xs ${isTestMode ? 'text-amber-700' : 'text-blue-700'}`}>
                      {results.work_schedule.schedule_description}
                    </div>
                    <div className={`text-sm font-medium mt-2 ${isTestMode ? 'text-amber-900' : 'text-blue-900'}`}>
                      {t('results.monthlyTransport', language)}: {formatCurrency(results.monthly_transport_cost, user?.currency)}
                    </div>
                  </div>
                )}
                {results.total_benefits > 0 && (
                  <div className={`mt-4 p-4 rounded-xl ${isTestMode ? 'bg-orange-100/50' : 'bg-emerald-50'}`}>
                    <div className={`text-sm font-medium mb-1 ${isTestMode ? 'text-orange-900' : 'text-emerald-900'}`}>
                      {language === 'pt-BR' ? 'Total de Benefícios' : 'Total Benefits'}: {formatCurrency(results.total_benefits, user?.currency)}
                    </div>
                    <div className={`text-sm font-medium mt-2 ${isTestMode ? 'text-orange-900' : 'text-emerald-900'}`}>
                      {language === 'pt-BR' ? 'Valor Líquido + Benefícios' : 'Net Value + Benefits'}: {formatCurrency(results.net_value_with_benefits, user?.currency)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Cover Letter Card */}
            <Card className={`${isTestMode ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-200' : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border-white/50'} backdrop-blur-lg border-2 shadow-xl`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={isTestMode ? 'text-amber-700' : 'text-indigo-700'}>{t('results.coverLetter', language)}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(results.cover_letter)}
                    className={isTestMode ? 'hover:bg-amber-100' : 'hover:bg-blue-50'}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{results.cover_letter}</p>
              </CardContent>
            </Card>
            
            {/* Intro Email Card */}
            <Card className={`${isTestMode ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-200' : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border-white/50'} backdrop-blur-lg border-2 shadow-xl`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={isTestMode ? 'text-amber-700' : 'text-indigo-700'}>{t('results.introEmail', language)}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(results.email_draft)}
                    className={isTestMode ? 'hover:bg-amber-100' : 'hover:bg-blue-50'}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{results.email_draft}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}