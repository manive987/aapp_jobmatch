#!/bin/bash

echo "📦 Inicializando blocos do site..."

# Hero Block
curl -s -X POST http://localhost:3000/api/site/blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-secret-token" \
  -d '{
    "type": "hero",
    "data": {
      "badge": "Powered by AI",
      "title": "Encontre o Job Perfeito com IA",
      "subtitle": "Analise seu CV contra vagas de emprego usando inteligência artificial. Calcule salário líquido e gere cartas de apresentação automaticamente.",
      "primaryButtonText": "Experimentar Grátis",
      "primaryButtonLink": "/app",
      "secondaryButtonText": "Ler Mais",
      "secondaryButtonLink": "/blog"
    },
    "order": 1,
    "active": true
  }' > /dev/null && echo "✅ Hero criado"

# Stats Block
curl -s -X POST http://localhost:3000/api/site/blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-secret-token" \
  -d '{
    "type": "stats",
    "data": {
      "stats": [
        {"value": "1234+", "label": "Usuários", "color": "text-blue-600"},
        {"value": "5678+", "label": "Análises", "color": "text-purple-600"},
        {"value": "98%", "label": "Satisfação", "color": "text-pink-600"}
      ]
    },
    "order": 2,
    "active": true
  }' > /dev/null && echo "✅ Stats criado"

# Features Block
curl -s -X POST http://localhost:3000/api/site/blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-secret-token" \
  -d '{
    "type": "features",
    "data": {
      "title": "Recursos Poderosos",
      "subtitle": "Tudo que você precisa para conseguir seu próximo emprego",
      "features": [
        {
          "icon": "⚡",
          "iconBg": "bg-blue-100",
          "title": "Análise com IA",
          "description": "Algoritmos avançados analisam seu CV e comparam com a descrição da vaga"
        },
        {
          "icon": "📊",
          "iconBg": "bg-purple-100",
          "title": "Score de Match",
          "description": "Receba uma pontuação de 0-100% mostrando o quanto você se encaixa na vaga"
        },
        {
          "icon": "🛡️",
          "iconBg": "bg-pink-100",
          "title": "Cálculo Financeiro",
          "description": "Calcule salário líquido considerando custos de transporte e impostos"
        },
        {
          "icon": "✅",
          "iconBg": "bg-green-100",
          "title": "Carta de Apresentação",
          "description": "Gere automaticamente cartas personalizadas para cada vaga"
        },
        {
          "icon": "⏱️",
          "iconBg": "bg-orange-100",
          "title": "Rápido e Fácil",
          "description": "Análise completa em menos de 30 segundos. Interface simples e intuitiva"
        },
        {
          "icon": "👥",
          "iconBg": "bg-indigo-100",
          "title": "Multi-idioma",
          "description": "Suporte para Português, Inglês e Espanhol com IA multilíngue"
        }
      ]
    },
    "order": 3,
    "active": true
  }' > /dev/null && echo "✅ Features criado"

# Testimonials Block
curl -s -X POST http://localhost:3000/api/site/blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-secret-token" \
  -d '{
    "type": "testimonials",
    "data": {
      "title": "O que dizem nossos usuários",
      "subtitle": "Milhares de pessoas conseguiram seus empregos conosco",
      "testimonials": [
        {
          "name": "Maria Silva",
          "role": "Desenvolvedora",
          "text": "Consegui 3 entrevistas na primeira semana! O score de match me ajudou muito.",
          "image": ""
        },
        {
          "name": "João Santos",
          "role": "Designer",
          "text": "A carta de apresentação gerada foi perfeita. Economizei horas de trabalho!",
          "image": ""
        },
        {
          "name": "Ana Costa",
          "role": "Gerente de Projetos",
          "text": "O cálculo de salário líquido me ajudou a negociar melhor minha proposta.",
          "image": ""
        }
      ]
    },
    "order": 4,
    "active": true
  }' > /dev/null && echo "✅ Testimonials criado"

# CTA Block
curl -s -X POST http://localhost:3000/api/site/blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-secret-token" \
  -d '{
    "type": "cta",
    "data": {
      "title": "Pronto para encontrar seu próximo emprego?",
      "subtitle": "Comece gratuitamente hoje e veja a diferença que a IA pode fazer",
      "buttonText": "Começar Agora - É Grátis!",
      "buttonLink": "/app"
    },
    "order": 5,
    "active": true
  }' > /dev/null && echo "✅ CTA criado"

echo ""
echo "🎉 Todos os blocos foram criados com sucesso!"
echo "Acesse: http://localhost:3000 para ver"
echo "Admin: http://localhost:3000/secure-panel-x9"
