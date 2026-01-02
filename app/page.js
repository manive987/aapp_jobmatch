'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

export default function LandingPage() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await fetch('/api/site/blocks?active=true');
      const data = await response.json();
      setBlocks(data.blocks || []);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBlock = (block) => {
    switch (block.type) {
      case 'hero':
        return <HeroBlock key={block._id} data={block.data} />;
      case 'stats':
        return <StatsBlock key={block._id} data={block.data} />;
      case 'features':
        return <FeaturesBlock key={block._id} data={block.data} />;
      case 'testimonials':
        return <TestimonialsBlock key={block._id} data={block.data} />;
      case 'cta':
        return <CTABlock key={block._id} data={block.data} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">JM</span>
            </div>
            <span className="font-bold text-xl">JobMatch</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-gray-600 hover:text-blue-600 transition">Blog</Link>
            <Link href="/plans" className="text-gray-600 hover:text-blue-600 transition">Planos</Link>
            <Link href="/app" className="text-gray-600 hover:text-blue-600 transition">App</Link>
          </div>

          <Link href="/app">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Começar Agora <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Dynamic Blocks */}
      {blocks.map(block => renderBlock(block))}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">JM</span>
                </div>
                <span className="font-bold text-lg">JobMatch</span>
              </div>
              <p className="text-gray-400">Encontre o emprego perfeito com inteligência artificial.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/app" className="hover:text-white transition">App Web</Link></li>
                <li><Link href="/plans" className="hover:text-white transition">Planos</Link></li>
                <li><Link href="#" className="hover:text-white transition">Download APK</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">Guias</Link></li>
                <li><Link href="#" className="hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Sobre</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contato</Link></li>
                <li><Link href="#" className="hover:text-white transition">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 JobMatch. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Hero Block Component
function HeroBlock({ data }) {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center">
        {data.badge && (
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
            <Sparkles className="h-3 w-3 mr-1" /> {data.badge}
          </Badge>
        )}
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {data.title}
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
          {data.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={data.primaryButtonLink || '/app'}>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
              {data.primaryButtonText} <ArrowRight className="ml-2" />
            </Button>
          </Link>
          {data.secondaryButtonText && (
            <Link href={data.secondaryButtonLink || '/blog'}>
              <Button size="lg" variant="outline" className="text-lg px-8">
                {data.secondaryButtonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// Stats Block Component
function StatsBlock({ data }) {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {data.stats?.map((stat, i) => (
          <div key={i} className="text-center">
            <div className={`text-3xl font-bold ${stat.color || 'text-blue-600'}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Features Block Component
function FeaturesBlock({ data }) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {data.title && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{data.title}</h2>
            {data.subtitle && (
              <p className="text-xl text-gray-600">{data.subtitle}</p>
            )}
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {data.features?.map((feature, i) => (
            <Card key={i} className="border-2 hover:border-blue-500 transition hover:shadow-xl">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 ${feature.iconBg || 'bg-blue-100'} rounded-lg flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{feature.icon || '⚡'}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Block Component  
function TestimonialsBlock({ data }) {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        {data.title && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{data.title}</h2>
            {data.subtitle && (
              <p className="text-xl text-gray-600">{data.subtitle}</p>
            )}
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {data.testimonials?.map((testimonial, i) => (
            <Card key={i} className="bg-white">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                {testimonial.image && (
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mb-2" />
                )}
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Block Component
function CTABlock({ data }) {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">{data.title}</h2>
        <p className="text-xl mb-8 opacity-90">{data.subtitle}</p>
        <Link href={data.buttonLink || '/app'}>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
            {data.buttonText} <ArrowRight className="ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
