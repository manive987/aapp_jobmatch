#!/bin/bash

# 🚀 Script de Deploy Automático - JobMatch
# ==========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   🚀 JobMatch - Deploy Automático     ║"
echo "╔════════════════════════════════════════╗"
echo -e "${NC}"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na pasta /app${NC}"
    exit 1
fi

# Menu
echo -e "${YELLOW}Escolha uma opção:${NC}"
echo "1) 🌐 Deploy no Vercel (via CLI)"
echo "2) 🐙 Preparar para GitHub"
echo "3) 📱 Gerar configurações para APK"
echo "4) 🧪 Verificar tudo antes do deploy"
echo "5) 📚 Ver guia completo"
echo ""
read -p "Opção: " option

case $option in
    1)
        echo -e "${BLUE}🌐 Deploy via Vercel CLI${NC}"
        echo ""
        
        # Verificar se vercel CLI está instalado
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}Instalando Vercel CLI...${NC}"
            npm install -g vercel
        fi
        
        echo -e "${GREEN}✅ Vercel CLI instalado${NC}"
        echo ""
        echo -e "${YELLOW}Iniciando deploy...${NC}"
        echo ""
        
        vercel
        
        echo ""
        echo -e "${GREEN}✅ Deploy concluído!${NC}"
        echo ""
        echo -e "${YELLOW}📝 Próximos passos:${NC}"
        echo "1. Configure variáveis de ambiente no dashboard"
        echo "2. Vá em: https://vercel.com/dashboard"
        echo "3. Settings → Environment Variables"
        echo "4. Adicione: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, etc"
        echo "5. Rode: vercel --prod"
        ;;
        
    2)
        echo -e "${BLUE}🐙 Preparando para GitHub${NC}"
        echo ""
        
        # Inicializar git se necessário
        if [ ! -d ".git" ]; then
            echo -e "${YELLOW}Inicializando git...${NC}"
            git init
        fi
        
        # Criar .gitignore se não existir
        if [ ! -f ".gitignore" ]; then
            echo -e "${YELLOW}Criando .gitignore...${NC}"
            cat > .gitignore << 'EOF'
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage
test_result.md

# Next.js
.next/
out/

# Production
build

# Misc
.DS_Store
*.pem
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local
.vercel

# Android
android-app/app/
android-app/.gradle/
*.apk
*.aab
EOF
        fi
        
        echo -e "${GREEN}✅ Git configurado${NC}"
        echo ""
        echo -e "${YELLOW}Comandos para continuar:${NC}"
        echo ""
        echo "git add ."
        echo "git commit -m \"Initial commit - JobMatch\""
        echo "git remote add origin https://github.com/SEU-USUARIO/jobmatch.git"
        echo "git push -u origin main"
        echo ""
        echo "Depois vá em:"
        echo "https://vercel.com/new"
        echo "E importe o repositório!"
        ;;
        
    3)
        echo -e "${BLUE}📱 Configurando para APK${NC}"
        echo ""
        
        read -p "Digite sua URL do Vercel (ex: jobmatch.vercel.app): " vercel_url
        
        if [ -z "$vercel_url" ]; then
            echo -e "${RED}❌ URL não pode ser vazia${NC}"
            exit 1
        fi
        
        # Remover https:// se tiver
        vercel_url=$(echo $vercel_url | sed 's|https://||g')
        
        echo -e "${YELLOW}Atualizando arquivos...${NC}"
        
        # Atualizar manifest.json
        cat > public/manifest.json << EOF
{
  "name": "JobMatch AI Manager",
  "short_name": "JobMatch",
  "description": "Match your CV with job descriptions using AI",
  "start_url": "https://${vercel_url}/",
  "scope": "https://${vercel_url}/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"}
  ]
}
EOF
        
        echo -e "${GREEN}✅ manifest.json atualizado${NC}"
        
        # Atualizar twa-manifest.json se existir
        if [ -f "android-app/twa-manifest.json" ]; then
            sed -i "s|\"host\":.*|\"host\": \"${vercel_url}\",|g" android-app/twa-manifest.json
            echo -e "${GREEN}✅ twa-manifest.json atualizado${NC}"
        fi
        
        echo ""
        echo -e "${GREEN}✅ Configurações atualizadas!${NC}"
        echo ""
        echo -e "${YELLOW}Para gerar o APK:${NC}"
        echo "1. Faça commit das mudanças:"
        echo "   git add ."
        echo "   git commit -m 'Update URLs for Vercel'"
        echo "   git push"
        echo ""
        echo "2. Vá em: https://www.pwabuilder.com/"
        echo "3. Cole: https://${vercel_url}"
        echo "4. Generate APK!"
        ;;
        
    4)
        echo -e "${BLUE}🧪 Verificando configurações${NC}"
        echo ""
        
        checks=0
        total=8
        
        # Check 1: package.json
        if [ -f "package.json" ]; then
            echo -e "${GREEN}✅ package.json existe${NC}"
            ((checks++))
        else
            echo -e "${RED}❌ package.json não encontrado${NC}"
        fi
        
        # Check 2: .env
        if [ -f ".env" ]; then
            echo -e "${GREEN}✅ .env existe${NC}"
            ((checks++))
        else
            echo -e "${YELLOW}⚠️  .env não encontrado (variáveis vão para Vercel)${NC}"
        fi
        
        # Check 3: manifest.json
        if [ -f "public/manifest.json" ]; then
            echo -e "${GREEN}✅ manifest.json existe${NC}"
            ((checks++))
        else
            echo -e "${RED}❌ manifest.json não encontrado${NC}"
        fi
        
        # Check 4: service worker
        if [ -f "public/sw.js" ]; then
            echo -e "${GREEN}✅ Service Worker existe${NC}"
            ((checks++))
        else
            echo -e "${RED}❌ Service Worker não encontrado${NC}"
        fi
        
        # Check 5: icons
        if [ -f "public/icon-512.png" ]; then
            echo -e "${GREEN}✅ Ícones existem${NC}"
            ((checks++))
        else
            echo -e "${RED}❌ Ícones não encontrados${NC}"
        fi
        
        # Check 6: vercel.json
        if [ -f "vercel.json" ]; then
            echo -e "${GREEN}✅ vercel.json existe${NC}"
            ((checks++))
        else
            echo -e "${YELLOW}⚠️  vercel.json não encontrado${NC}"
        fi
        
        # Check 7: keystore
        if [ -f "android-app/android.keystore" ]; then
            echo -e "${GREEN}✅ Keystore existe${NC}"
            ((checks++))
        else
            echo -e "${YELLOW}⚠️  Keystore não encontrado (gere um novo)${NC}"
        fi
        
        # Check 8: node_modules
        if [ -d "node_modules" ]; then
            echo -e "${GREEN}✅ Dependencies instaladas${NC}"
            ((checks++))
        else
            echo -e "${RED}❌ Dependencies não instaladas (rode: yarn install)${NC}"
        fi
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "Resultado: ${GREEN}${checks}/${total}${NC} checks passaram"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        if [ $checks -eq $total ]; then
            echo -e "${GREEN}🎉 Tudo pronto para deploy!${NC}"
        else
            echo -e "${YELLOW}⚠️  Alguns ajustes necessários${NC}"
        fi
        ;;
        
    5)
        echo -e "${BLUE}📚 Abrindo guia completo...${NC}"
        echo ""
        
        if [ -f "DEPLOY_GUIDE.md" ]; then
            cat DEPLOY_GUIDE.md | less
        else
            echo -e "${RED}❌ DEPLOY_GUIDE.md não encontrado${NC}"
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Obrigado por usar JobMatch Deploy Tool!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
