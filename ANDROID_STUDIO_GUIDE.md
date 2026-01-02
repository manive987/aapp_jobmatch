# 📱 Gerar APK JobMatch com Android Studio

## Guia Completo Passo a Passo

---

## 📋 Pré-requisitos

1. ✅ Android Studio instalado
   - Download: https://developer.android.com/studio
2. ✅ Site no ar no Vercel
   - Ex: https://jobmatch.vercel.app
3. ✅ Keystore gerado (já temos em `/app/android-app/android.keystore`)

---

## 🚀 Método 1: Criar Projeto TWA do Zero (Recomendado)

### Passo 1: Instalar Android Studio

1. Baixe: https://developer.android.com/studio
2. Instale (próximo, próximo, finish)
3. Abra o Android Studio
4. Aguarde download de componentes (primeira vez demora)

---

### Passo 2: Criar Novo Projeto

1. **File → New → New Project**

2. Escolha template: **Empty Activity**
   - Clique em "Next"

3. Configure o projeto:
   ```
   Name: JobMatch
   Package name: com.jobmatch.twa
   Save location: C:\Users\marco\AndroidStudioProjects\JobMatch
   Language: Kotlin (ou Java)
   Minimum SDK: API 21 (Android 5.0)
   ```
mongodb+srv://testmemanibi:Strong@001@cluster0.th6pxqo.mongodb.net/
4. Clique **Finish**

5. Aguarde o Gradle Build (primeira vez demora)

---

### Passo 3: Adicionar Dependência TWA

1. Abra o arquivo: **app/build.gradle** (ou build.gradle.kts)

2. Na seção `dependencies`, adicione:

```gradle
dependencies {
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
    
    // Outras dependências que já existem...
}
```

3. Clique em **"Sync Now"** no topo (aparece uma barra amarela)

---

### Passo 4: Configurar AndroidManifest.xml

1. Abra: **app/src/main/AndroidManifest.xml**

2. **Substitua TODO o conteúdo** por:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.JobMatch"
        tools:targetApi="31">

        <!-- TWA Activity -->
        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:exported="true"
            android:label="@string/app_name">
            
            <!-- Main launcher -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep links para verificação -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW"/>
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE"/>
                
                <!-- IMPORTANTE: Mude para SUA URL do Vercel -->
                <data
                    android:scheme="https"
                    android:host="jobmatch.vercel.app"/>
            </intent-filter>

            <!-- Splash screen -->
            <meta-data
                android:name="android.support.customtabs.trusted.SPLASH_IMAGE_DRAWABLE"
                android:resource="@drawable/ic_launcher_foreground" />
                
            <!-- Status bar color -->
            <meta-data
                android:name="android.support.customtabs.trusted.STATUS_BAR_COLOR"
                android:resource="@color/colorPrimary" />
        </activity>

        <!-- Provider para o TWA -->
        <activity
            android:name="com.google.androidbrowserhelper.trusted.FocusActivity" />

    </application>

</manifest>
```
 https://aapp-jobmatch-main.vercel.app https://aapp-jobmatch-main.vercel.app
**⚠️ IMPORTANTE:** Mude `android:host="jobmatch.vercel.app"` para SUA URL!

---

### Passo 5: Criar arquivo TWA (asset_statements)

1. Crie a estrutura de pastas:
   - Botão direito em **app/src/main**
   - **New → Directory**
   - Nome: `assets`

2. Dentro de `assets`, crie outro diretório chamado `.well-known`

3. Dentro de `.well-known`, crie arquivo: **assetlinks.json**

4. Cole o conteúdo:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "web",
      "site": "https://jobmatch.vercel.app"
    }
  }
]
```

**Estrutura final:**
```
app/src/main/assets/.well-known/assetlinks.json
```

---

### Passo 6: Criar res/xml/shortcuts.xml (opcional mas recomendado)

1. Botão direito em **res**
2. **New → Android Resource Directory**
3. Resource type: **xml**
4. OK

5. Dentro de `res/xml`, crie arquivo: **shortcuts.xml**

```xml
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
    <shortcut
        android:shortcutId="app"
        android:enabled="true"
        android:icon="@mipmap/ic_launcher"
        android:shortcutShortLabel="@string/app_name"
        android:shortcutLongLabel="@string/app_name">
        <intent
            android:action="android.intent.action.VIEW"
            android:targetPackage="com.jobmatch.twa"
            android:targetClass="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:data="https://jobmatch.vercel.app/" />
    </shortcut>
</shortcuts>
```

---

### Passo 7: Configurar Cores (opcional)

Abra: **res/values/colors.xml**

Adicione:
```xml
<resources>
    <color name="colorPrimary">#3b82f6</color>
    <color name="colorPrimaryDark">#2563eb</color>
    <color name="colorAccent">#8b5cf6</color>
</resources>
```

---

### Passo 8: Configurar Signing (Keystore)

1. **Build → Generate Signed Bundle / APK**

2. Escolha: **APK**

3. Clique **Next**

4. Na tela de keystore:
   - Clique **Choose existing...**
   - Navegue até seu arquivo `android.keystore`
   - Key store password: `android123`
   - Key alias: `android`
   - Key password: `android123`

5. ✅ **Marcar:** Remember passwords

6. Clique **Next**

7. Escolha:
   - Destination folder: (deixe padrão ou escolha Desktop)
   - Build Variants: **release**
   - Signature Versions: ✅ V1, ✅ V2

8. Clique **Finish**

9. **Aguarde o build...**

10. Quando terminar, aparecerá: **"locate"**
    - Clique para abrir a pasta com o APK!

---

### Passo 9: Localizar o APK

O APK estará em:
```
app/release/app-release.apk
```

**Renomeie para:** `JobMatch.apk`

---

## 🧪 Testar o APK

### No Emulador (Android Studio):

1. **Tools → AVD Manager**
2. **Create Virtual Device**
3. Escolha um device (ex: Pixel 6)
4. Download system image (API 33)
5. Finish
6. Clique ▶️ para iniciar
7. Arraste o APK para o emulador

### No Celular Real (Recomendado):

1. **Habilitar USB Debugging:**
   - Configurações → Sobre o telefone
   - Toque 7x em "Número da versão"
   - Volte → Opções do desenvolvedor
   - Ative "USB Debugging"

2. **Conecte o celular via USB**

3. No Android Studio:
   - No topo, selecione seu device
   - Clique ▶️ Run

4. Ou instale manualmente:
   - Envie o APK para o celular
   - Abra e instale

---

## 🔧 Troubleshooting

### Erro: "Gradle sync failed"
```
File → Invalidate Caches → Invalidate and Restart
```

### Erro: "SDK not found"
```
Tools → SDK Manager
Instale: Android SDK Platform 33
         Build Tools 33.0.0
```

### Erro: "Keystore password incorrect"
- Verifique senha: `android123`
- Alias: `android`

### APK não instala
- Permita "Instalar de fontes desconhecidas"
- Configurações → Segurança → Fontes desconhecidas

### App abre com barra do Chrome
- Verifique assetlinks.json no servidor
- URL: `https://jobmatch.vercel.app/.well-known/assetlinks.json`
- SHA-256 fingerprint correto

---

## 📦 Gerar AAB (App Bundle) para Play Store

AAB é menor e preferido pela Play Store:

1. **Build → Generate Signed Bundle / APK**
2. Escolha: **Android App Bundle**
3. Siga os mesmos passos do keystore
4. O AAB estará em: `app/release/app-release.aab`

---

## 🎨 Personalizar Ícone

1. **res → mipmap** (botão direito)
2. **New → Image Asset**
3. **Icon Type:** Launcher Icons
4. **Foreground Layer:**
   - Asset Type: Image
   - Path: (navegue até seu ícone PNG 512x512)
5. **Background Layer:**
   - Color: #3b82f6 (azul JobMatch)
6. **Next → Finish**

---

## 📝 Checklist Final

Antes de gerar APK:

- [ ] URL do Vercel correta no AndroidManifest.xml
- [ ] Package name: com.jobmatch.twa
- [ ] Keystore configurado
- [ ] assetlinks.json criado
- [ ] Dependência TWA adicionada
- [ ] Build → Clean Project
- [ ] Build → Rebuild Project
- [ ] Generate Signed APK

---

## 🚀 Publicar na Play Store

1. **Play Console:** https://play.google.com/console
2. **Criar app** ($25 taxa única)
3. **Upload AAB** (não APK)
4. Preencher informações:
   - Screenshots (mínimo 2)
   - Ícone 512x512
   - Feature graphic 1024x500
   - Descrição
5. **Enviar para revisão**
6. Aguardar aprovação (3-7 dias)

---

## 💡 Dicas

### Build mais rápido:
```
File → Settings → Build → Gradle
Use Gradle offline mode: ✅
```

### Ver logs do app:
```
View → Tool Windows → Logcat
Filtre por: com.jobmatch.twa
```

### Debugar TWA:
```
chrome://inspect
Devices → Seu app
```

---

## 🔗 Links Úteis

- **Android Studio:** https://developer.android.com/studio
- **TWA Docs:** https://developer.chrome.com/docs/android/trusted-web-activity/
- **Play Console:** https://play.google.com/console
- **Asset Links:** https://developers.google.com/digital-asset-links/tools/generator

---

## 📋 Resumo Rápido

```
1. Criar projeto Empty Activity
2. Adicionar dependência TWA (build.gradle)
3. Configurar AndroidManifest.xml
4. Criar assetlinks.json
5. Build → Generate Signed APK
6. Usar keystore existente
7. APK pronto em app/release/
```

---

## ⏱️ Tempo Estimado

- **Setup inicial:** 30-40 minutos
- **Builds seguintes:** 5-10 minutos
- **Total primeira vez:** ~1 hora

---

**Sucesso! Qualquer dúvida, me avise! 🚀**
