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
