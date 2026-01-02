# 📱 Como Gerar APK do JobMatch

## ✅ PWA Configurado com Sucesso!

O JobMatch agora está configurado como PWA (Progressive Web App) e pronto para ser convertido em APK Android!

---

## 🚀 Opção 1: PWABuilder (Mais Fácil) ⭐ **RECOMENDADO**

### Passo a Passo:

1. **Acesse**: https://www.pwabuilder.com/

2. **Cole a URL do app**:
   ```
   https://pix-gateway-15.preview.emergentagent.com
   ```

3. **Clique em "Start"**

4. **Aguarde a análise** do PWA (deve passar em todos os testes!)

5. **Clique em "Package For Stores"**

6. **Escolha "Android"**

7. **Configure as opções**:
   - Package ID: `com.jobmatch.twa`
   - App name: `JobMatch`
   - Signing key: Use o arquivo `/app/android-app/android.keystore`
     - Alias: `android`
     - Password: `android123`

8. **Clique em "Generate"**

9. **Baixe o APK!** 🎉

---

## 🛠️ Opção 2: Bubblewrap CLI (Requer Android SDK)

### Pré-requisitos:
- ✅ Node.js instalado
- ✅ Android SDK instalado (Android Studio)
- ✅ JDK 17+ instalado

### Instalação:

```bash
# Instalar Bubblewrap globalmente
npm install -g @bubblewrap/cli
```

### Geração do APK:

```bash
# 1. Ir para a pasta do projeto Android
cd /app/android-app

# 2. Instalar o JDK (Bubblewrap perguntará)
bubblewrap doctor

# 3. Build do projeto
bubblewrap build

# 4. O APK estará em:
# app/build/outputs/apk/release/app-release-signed.apk
```

---

## 📱 Opção 3: Android Studio (Desenvolvimento Completo)

### Setup:

1. **Abra Android Studio**

2. **New Project**:
   - Template: "Empty Activity"
   - Language: Kotlin/Java
   - Package: `com.jobmatch.twa`

3. **Adicione dependência TWA** no `build.gradle`:
   ```gradle
   dependencies {
       implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
   }
   ```

4. **Configure o AndroidManifest.xml**:
   ```xml
   <activity
       android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
       android:label="@string/app_name">
       <intent-filter>
           <action android:name="android.intent.action.MAIN" />
           <category android:name="android.intent.category.LAUNCHER" />
       </intent-filter>
       <intent-filter android:autoVerify="true">
           <action android:name="android.intent.action.VIEW"/>
           <category android:name="android.intent.category.DEFAULT" />
           <category android:name="android.intent.category.BROWSABLE"/>
           <data
               android:scheme="https"
               android:host="pix-gateway-15.preview.emergentagent.com"/>
       </intent-filter>
   </activity>
   ```

5. **Build → Generate Signed Bundle / APK**

6. **Escolha APK** e siga o wizard

---

## 📋 Informações do App

| Campo | Valor |
|-------|-------|
| **Package Name** | com.jobmatch.twa |
| **App Name** | JobMatch AI Manager |
| **Short Name** | JobMatch |
| **Version** | 1.0.0 |
| **Version Code** | 1 |
| **Start URL** | https://pix-gateway-15.preview.emergentagent.com/ |
| **Manifest URL** | https://pix-gateway-15.preview.emergentagent.com/manifest.json |
| **Icon 512x512** | https://pix-gateway-15.preview.emergentagent.com/icon-512.png |

---

## 🔐 Credenciais de Assinatura

### Keystore gerado:
- **Arquivo**: `/app/android-app/android.keystore`
- **Alias**: `android`
- **Store Password**: `android123`
- **Key Password**: `android123`
- **SHA-256 Fingerprint**: 
  ```
  0F:FA:23:E2:89:AB:EF:75:2D:D4:F2:98:A8:D6:92:A4:F5:CE:90:7E:C9:DE:C2:90:C6:49:1B:CB:BC:F6:ED:47
  ```

⚠️ **IMPORTANTE**: Para produção, gere um novo keystore com senha forte!

---

## 🧪 Testando o APK

### Via ADB (USB Debugging):

```bash
# 1. Habilite USB Debugging no Android
# Configurações → Sobre o telefone → Toque 7x em "Número da versão"
# Configurações → Opções do desenvolvedor → USB Debugging

# 2. Conecte o celular via USB

# 3. Verifique a conexão
adb devices

# 4. Instale o APK
adb install app-release-signed.apk

# 5. Para desinstalar
adb uninstall com.jobmatch.twa
```

### Instalação Manual:

1. Envie o APK para o celular (email, WhatsApp, etc.)
2. Abra o arquivo no celular
3. Permita "Instalar apps de fontes desconhecidas"
4. Instale!

---

## ✅ Verificar Digital Asset Links

Para que o TWA funcione **SEM barra de navegação** do browser:

### 1. Verificar assetlinks.json:

Acesse no navegador:
```
https://pix-gateway-15.preview.emergentagent.com/.well-known/assetlinks.json
```

Deve retornar:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.jobmatch.twa",
      "sha256_cert_fingerprints": [
        "0F:FA:23:E2:89:AB:EF:75:2D:D4:F2:98:A8:D6:92:A4:F5:CE:90:7E:C9:DE:C2:90:C6:49:1B:CB:BC:F6:ED:47"
      ]
    }
  }
]
```

### 2. Testar validação:

Use o Google Statement List Generator:
```
https://developers.google.com/digital-asset-links/tools/generator
```

---

## 🚀 Publicar na Google Play Store

### Preparação:

1. **Criar conta de desenvolvedor**:
   - Acesse: https://play.google.com/console
   - Taxa única: $25 USD

2. **Gerar App Bundle (AAB)** ao invés de APK:
   ```bash
   # Com Bubblewrap
   bubblewrap build --skipPwaValidation

   # O AAB estará em:
   # app/build/outputs/bundle/release/app-release.aab
   ```

3. **Criar novo app** no Play Console

4. **Upload do AAB**

5. **Preencher informações**:
   - Título, descrição, screenshots
   - Ícone, banner
   - Categoria: Produtividade
   - Política de privacidade
   - Classificação de conteúdo

6. **Testar** via Internal Testing

7. **Enviar para revisão**

---

## 📦 Arquivos Gerados

```
/app/
├── public/
│   ├── manifest.json          # Manifest PWA
│   ├── sw.js                  # Service Worker
│   ├── icon-*.png             # Ícones (72, 96, 128, 144, 152, 192, 384, 512)
│   ├── favicon.ico            # Favicon
│   └── .well-known/
│       └── assetlinks.json    # Digital Asset Links
├── android-app/
│   ├── twa-manifest.json      # Configuração Bubblewrap
│   ├── android.keystore       # Keystore para assinatura
│   └── BUILD_INSTRUCTIONS.md  # Este arquivo
└── generate_apk.sh            # Script de geração
```

---

## 🎨 Personalização

### Alterar Ícone:

1. Substitua `/app/public/icon-512.png`
2. Regenere os outros tamanhos
3. Atualize o manifest.json

### Alterar Cores:

Edite `/app/public/manifest.json`:
```json
{
  "theme_color": "#3b82f6",      // Cor da barra de status
  "background_color": "#ffffff"   // Cor de fundo na inicialização
}
```

### Adicionar Splash Screen:

O Android gera automaticamente baseado no ícone e background_color.

---

## 🐛 Troubleshooting

### ❌ PWA não passa na validação:

**Erro**: "Manifest não encontrado"
- ✅ Verificar: https://pix-gateway-15.preview.emergentagent.com/manifest.json

**Erro**: "Service Worker não registrado"
- ✅ Verificar console do navegador
- ✅ Service Worker só funciona em HTTPS

### ❌ TWA abre com barra do Chrome:

**Causa**: Digital Asset Links não configurado
- ✅ Verificar `.well-known/assetlinks.json`
- ✅ SHA-256 fingerprint correto
- ✅ Package name correto

### ❌ APK não instala:

**Erro**: "App not installed"
- ✅ Desinstale versão antiga primeiro
- ✅ Verifique compatibilidade (Android 5.0+)

### ❌ Erro no Bubblewrap:

**Erro**: "Android SDK not found"
- ✅ Instale Android Studio
- ✅ Configure ANDROID_SDK_ROOT

**Erro**: "JDK not found"
- ✅ Instale JDK 17+
- ✅ Configure JAVA_HOME

---

## 📚 Recursos Úteis

- **PWABuilder**: https://www.pwabuilder.com/
- **Bubblewrap**: https://github.com/GoogleChromeLabs/bubblewrap
- **TWA Docs**: https://developer.chrome.com/docs/android/trusted-web-activity/
- **Play Console**: https://play.google.com/console
- **Asset Links**: https://developers.google.com/digital-asset-links

---

## 🎉 Resultado Final

Após seguir este guia, você terá:

- ✅ Um APK funcional do JobMatch
- ✅ App instalável no Android
- ✅ Experiência nativa (fullscreen)
- ✅ Ícone na home screen
- ✅ Offline capability (via Service Worker)
- ✅ Pronto para publicar na Play Store!

---

**Desenvolvido com ❤️ para JobMatch**

*Última atualização: Janeiro 2025*
