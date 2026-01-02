#!/bin/bash

# 📱 Script para gerar APK do JobMatch usando Bubblewrap
# =========================================================

set -e

echo "📱 Gerando APK do JobMatch..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="JobMatch"
PACKAGE_NAME="com.jobmatch.twa"
HOST="pix-gateway-15.preview.emergentagent.com"
MANIFEST_URL="https://${HOST}/manifest.json"
START_URL="https://${HOST}/"

echo -e "${BLUE}📋 Configuração:${NC}"
echo "  App Name: ${APP_NAME}"
echo "  Package: ${PACKAGE_NAME}"
echo "  Host: ${HOST}"
echo ""

# Create android-app directory
cd /app
rm -rf android-app
mkdir -p android-app
cd android-app

# Create twa-manifest.json for Bubblewrap
echo -e "${YELLOW}⚙️  Criando configuração TWA...${NC}"
cat > twa-manifest.json << EOF
{
  "packageId": "${PACKAGE_NAME}",
  "host": "${HOST}",
  "name": "${APP_NAME}",
  "launcherName": "${APP_NAME}",
  "display": "standalone",
  "themeColor": "#3b82f6",
  "navigationColor": "#ffffff",
  "backgroundColor": "#ffffff",
  "enableNotifications": true,
  "startUrl": "/",
  "iconUrl": "https://${HOST}/icon-512.png",
  "maskableIconUrl": "https://${HOST}/icon-512.png",
  "monochromeIconUrl": "https://${HOST}/icon-512.png",
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "./android.keystore",
    "alias": "android"
  },
  "appVersionName": "1.0.0",
  "appVersionCode": 1,
  "shortcuts": [],
  "generatorApp": "bubblewrap-cli",
  "webManifestUrl": "${MANIFEST_URL}",
  "fallbackType": "customtabs",
  "features": {
    "locationDelegation": {
      "enabled": false
    },
    "playBilling": {
      "enabled": false
    }
  },
  "alphaDependencies": {
    "enabled": false
  },
  "enableSiteSettingsShortcut": true,
  "orientation": "default"
}
EOF

echo -e "${GREEN}✓ Configuração criada${NC}"
echo ""

# Generate keystore (for signing the APK)
echo -e "${YELLOW}🔐 Gerando keystore para assinatura...${NC}"
if [ ! -f "android.keystore" ]; then
  keytool -genkey -v \
    -keystore android.keystore \
    -alias android \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass android123 \
    -keypass android123 \
    -dname "CN=JobMatch, OU=Development, O=JobMatch, L=City, ST=State, C=BR" \
    2>&1 | grep -v "Warning" || true
  echo -e "${GREEN}✓ Keystore gerado${NC}"
else
  echo -e "${GREEN}✓ Keystore já existe${NC}"
fi
echo ""

# Check if JDK is installed
if ! command -v javac &> /dev/null; then
    echo -e "${YELLOW}⚠️  JDK não encontrado. Instalando...${NC}"
    apt-get update -qq && apt-get install -y -qq default-jdk > /dev/null 2>&1
    echo -e "${GREEN}✓ JDK instalado${NC}"
fi

# Check if Android SDK is needed
echo -e "${BLUE}🤖 Verificando Android SDK...${NC}"
if [ -z "$ANDROID_SDK_ROOT" ]; then
    echo -e "${YELLOW}⚠️  Android SDK não encontrado${NC}"
    echo -e "${YELLOW}   Para gerar APK completo, você precisa:${NC}"
    echo "   1. Instalar Android Studio"
    echo "   2. Ou usar o Android Command Line Tools"
    echo ""
    echo -e "${BLUE}💡 Alternativa: Usar PWABuilder online${NC}"
    echo "   URL: https://www.pwabuilder.com/"
    echo "   Manifest: ${MANIFEST_URL}"
    echo ""
fi

# Create build instructions
cat > BUILD_INSTRUCTIONS.md << 'EOFINST'
# 📱 Como Gerar o APK do JobMatch

## Opção 1: PWABuilder (Mais Fácil) ⭐ RECOMENDADO

1. Acesse: https://www.pwabuilder.com/
2. Cole a URL: `https://pix-gateway-15.preview.emergentagent.com`
3. Clique em "Start"
4. Clique em "Package For Stores"
5. Escolha "Android"
6. Clique em "Generate"
7. Baixe o APK gerado!

## Opção 2: Bubblewrap CLI (Requer Android SDK)

### Pré-requisitos:
- Node.js instalado
- Android SDK instalado
- JDK 17+ instalado

### Passos:

```bash
# 1. Instalar Bubblewrap
npm install -g @bubblewrap/cli

# 2. Ir para a pasta do projeto
cd /app/android-app

# 3. Inicializar (se ainda não foi)
bubblewrap init --manifest=https://pix-gateway-15.preview.emergentagent.com/manifest.json

# 4. Build do APK
bubblewrap build

# 5. O APK estará em: app-release-signed.apk
```

## Opção 3: Android Studio

1. Abra o Android Studio
2. New Project → Phone and Tablet → Empty Activity
3. Configure TWA (Trusted Web Activity)
4. Aponte para: https://pix-gateway-15.preview.emergentagent.com
5. Build → Generate Signed Bundle / APK
6. Escolha APK e siga o wizard

## Informações do App

- **Package Name**: com.jobmatch.twa
- **App Name**: JobMatch
- **Start URL**: https://pix-gateway-15.preview.emergentagent.com/
- **Manifest URL**: https://pix-gateway-15.preview.emergentagent.com/manifest.json
- **Icon**: https://pix-gateway-15.preview.emergentagent.com/icon-512.png

## Keystore (para assinatura)

- **Arquivo**: android.keystore
- **Alias**: android
- **Password**: android123

## Testando o APK

Após gerar, instale no seu Android:

```bash
# Via ADB
adb install app-release-signed.apk

# Ou envie o APK para o celular e instale manualmente
```

## Verificar Digital Asset Links

Para que o TWA funcione sem barra de navegação, você precisa:

1. Gerar SHA-256 fingerprint do keystore:
```bash
keytool -list -v -keystore android.keystore -alias android -storepass android123 | grep SHA256
```

2. Atualizar `/app/public/assetlinks.json` com o fingerprint
3. Fazer deploy e verificar em:
   https://pix-gateway-15.preview.emergentagent.com/.well-known/assetlinks.json

## Publicar na Play Store

1. Acesse: https://play.google.com/console
2. Criar novo app
3. Upload do APK/AAB
4. Preencher informações da loja
5. Enviar para revisão

---

📚 Mais info: https://developer.chrome.com/docs/android/trusted-web-activity/
EOFINST

echo ""
echo -e "${GREEN}✅ Arquivos de configuração criados!${NC}"
echo ""
echo "📁 Arquivos gerados:"
echo "   - twa-manifest.json"
echo "   - android.keystore"
echo "   - BUILD_INSTRUCTIONS.md"
echo ""
echo -e "${BLUE}📖 Próximos passos:${NC}"
echo ""
echo "1️⃣  ${YELLOW}OPÇÃO FÁCIL (RECOMENDADA):${NC}"
echo "    Acesse: https://www.pwabuilder.com/"
echo "    Cole: https://pix-gateway-15.preview.emergentagent.com"
echo "    Gere o APK online (sem precisar de Android SDK)!"
echo ""
echo "2️⃣  ${YELLOW}OPÇÃO AVANÇADA (Requer Android SDK):${NC}"
echo "    cd /app/android-app"
echo "    bubblewrap build"
echo ""
echo "📚 Leia: /app/android-app/BUILD_INSTRUCTIONS.md"
echo ""
