# 🚀 Guia Completo: Deploy Vercel + APK Android

## Parte 1: Deploy no Vercel

### Opção A: Deploy via Vercel CLI (Mais Rápido) ⚡

#### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login no Vercel
```bash
vercel login
```
Escolha o método (GitHub, Email, etc.)

#### 3. Fazer Deploy
```bash
cd /app
vercel
```

**Responda as perguntas:**
- Set up and deploy? → `Y`
- Which scope? → Escolha sua conta
- Link to existing project? → `N`
- What's your project's name? → `jobmatch` (ou outro nome)
- In which directory is your code located? → `./`
- Want to override settings? → `N`

Aguarde o deploy... ⏳

#### 4. Configurar Variáveis de Ambiente

Vá para: https://vercel.com/dashboard

1. Clique no seu projeto `jobmatch`
2. Settings → Environment Variables
3. Adicione:

```
MONGODB_URI = mongodb+srv://usuario:senha@cluster.mongodb.net/jobmatch
JWT_SECRET = seu_segredo_super_secreto_aqui_123456
GEMINI_API_KEY = AIzaSyCog7QYLOesQDO66S61ji3WKEEoVDI2E2M
MERCADOPAGO_ACCESS_TOKEN = APP_USR-3595746059942621-082712-a66b43c5eef3e27189815df67f6bfeb4-2655345330
MERCADOPAGO_PUBLIC_KEY = APP_USR-601547e8-10ae-4515-bbff-30eb7ffd0fd1
```

#### 5. Fazer Deploy de Produção
```bash
vercel --prod
```

✅ Seu site estará em: `https://jobmatch.vercel.app`

---

### Opção B: Deploy via GitHub (Mais Fácil) 🐙

#### 1. Criar Repositório GitHub

**No seu computador local:**
```bash
cd /app
git init
git add .
git commit -m "Initial commit - JobMatch"
```

#### 2. Criar Repo no GitHub
- Vá em: https://github.com/new
- Nome: `jobmatch`
- Público ou Privado: Escolha
- Não adicione README, .gitignore, etc
- Clique "Create repository"

#### 3. Push para GitHub
```bash
# Copie os comandos que o GitHub mostra, algo como:
git remote add origin https://github.com/seu-usuario/jobmatch.git
git branch -M main
git push -u origin main
```

#### 4. Conectar Vercel ao GitHub

1. Vá em: https://vercel.com/new
2. Clique em "Import Git Repository"
3. Escolha seu repositório `jobmatch`
4. Configure:
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: (deixe padrão)
   - Output Directory: (deixe padrão)

5. **Environment Variables** - Adicione:
```
MONGODB_URI
JWT_SECRET
GEMINI_API_KEY
MERCADOPAGO_ACCESS_TOKEN
MERCADOPAGO_PUBLIC_KEY
```

6. Clique "Deploy"

Aguarde... ⏳

✅ Pronto! Seu site está no ar!

---

## Parte 2: Configurar MongoDB Atlas ☁️

**IMPORTANTE:** Vercel precisa de MongoDB na nuvem!

### 1. Criar Conta MongoDB Atlas
- Vá em: https://www.mongodb.com/cloud/atlas/register
- Cadastre-se grátis

### 2. Criar Cluster
1. Clique "Build a Database"
2. Escolha "M0 FREE"
3. Escolha região: `São Paulo` ou mais próxima
4. Database Name: `jobmatch`
5. Clique "Create"

### 3. Criar Usuário do Banco
1. Security → Database Access
2. Add New Database User
   - Username: `jobmatch_admin`
   - Password: Clique "Autogenerate" e **COPIE A SENHA**
3. Database User Privileges: `Read and write to any database`
4. Add User

### 4. Liberar IP
1. Security → Network Access
2. Add IP Address
3. **IMPORTANTE:** Adicione `0.0.0.0/0` (Allow access from anywhere)
   - Isso permite Vercel acessar
4. Confirm

### 5. Obter Connection String
1. Database → Connect
2. Connect your application
3. Driver: Node.js
4. Copie a string:
```
mongodb+srv://jobmatch_admin:<password>@cluster0.xxxxx.mongodb.net/jobmatch
```
5. **Substitua `<password>`** pela senha que você copiou

### 6. Testar Conexão
```bash
# No terminal local, teste:
export MONGODB_URI="mongodb+srv://jobmatch_admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/jobmatch"
node -e "require('mongodb').MongoClient.connect(process.env.MONGODB_URI).then(() => console.log('✅ Conectado!')).catch(e => console.error('❌ Erro:', e))"
```

### 7. Adicionar no Vercel
1. Vercel Dashboard → Seu Projeto → Settings → Environment Variables
2. Edite `MONGODB_URI`
3. Cole a connection string completa
4. Save

### 8. Fazer Redeploy
```bash
vercel --prod
```
ou no dashboard: Deployments → ... → Redeploy

---

## Parte 3: Atualizar Configurações para Vercel 🔧

Depois do deploy, você terá uma URL tipo: `https://jobmatch.vercel.app`

### 1. Atualizar Manifest e Asset Links

**Edite localmente:**

```bash
# Atualizar manifest.json
nano /app/public/manifest.json
```

Mude:
```json
{
  "start_url": "https://jobmatch.vercel.app/",
  "scope": "https://jobmatch.vercel.app/"
}
```

**Atualizar assetlinks.json:**
```bash
nano /app/public/.well-known/assetlinks.json
```

A URL será: `https://jobmatch.vercel.app/.well-known/assetlinks.json`

### 2. Commit e Push
```bash
cd /app
git add .
git commit -m "Update URLs for Vercel"
git push
```

Vercel vai fazer redeploy automaticamente!

---

## Parte 4: Gerar APK Android 📱

### Método 1: PWABuilder (MAIS FÁCIL) ⭐

#### 1. Acesse PWABuilder
https://www.pwabuilder.com/

#### 2. Cole sua URL
```
https://jobmatch.vercel.app
```

#### 3. Clique "Start"
Aguarde análise do PWA (deve passar em todos os testes!)

#### 4. Clique "Package For Stores"

#### 5. Escolha "Android"

#### 6. Configure o APK

**Options:**
- **Package ID:** `com.jobmatch.twa`
- **App name:** `JobMatch`
- **Host:** `jobmatch.vercel.app`
- **Start URL:** `/`

**Signing Key:**
- Upload: `/app/android-app/android.keystore`
- Key alias: `android`
- Key password: `android123`
- Store password: `android123`

#### 7. Clique "Generate"

#### 8. Baixe o APK!
Download será algo como: `jobmatch-signed.apk`

✅ **Pronto! Seu APK está gerado!**

---

### Método 2: Bubblewrap CLI (Avançado)

```bash
cd /app/android-app

# Atualizar twa-manifest.json com nova URL
nano twa-manifest.json

# Mudar:
"host": "jobmatch.vercel.app",
"startUrl": "https://jobmatch.vercel.app/",
"webManifestUrl": "https://jobmatch.vercel.app/manifest.json"

# Build
bubblewrap build

# APK estará em:
# app/build/outputs/apk/release/app-release-signed.apk
```

---

## Parte 5: Testar o APK 🧪

### No Celular Android:

#### Via Download Direto:
1. Envie o APK para seu celular (email, WhatsApp, Drive)
2. Abra o arquivo no celular
3. Android vai pedir "Instalar de fonte desconhecida" → Permitir
4. Instale!

#### Via ADB (USB):
```bash
# Habilitar USB Debugging no celular:
# Configurações → Sobre → Toque 7x em "Número da versão"
# Configurações → Opções do desenvolvedor → USB Debugging

# Conectar celular via USB
adb devices

# Instalar
adb install jobmatch-signed.apk

# Desinstalar (se precisar)
adb uninstall com.jobmatch.twa
```

---

## Parte 6: Verificações Finais ✅

### 1. Testar Site Vercel
```bash
curl https://jobmatch.vercel.app
```

### 2. Testar Admin
```
https://jobmatch.vercel.app/secure-panel-x9
```

### 3. Testar Manifest
```
https://jobmatch.vercel.app/manifest.json
```

### 4. Testar Asset Links
```
https://jobmatch.vercel.app/.well-known/assetlinks.json
```

### 5. Validar PWA
- Chrome → F12 → Lighthouse
- Run análise
- PWA deve ter 100%

### 6. Testar Webhook Mercado Pago
Atualize no painel Mercado Pago:
```
https://jobmatch.vercel.app/api/payment/webhook
```

---

## Parte 7: Publicar na Google Play Store 🏪

### 1. Criar Conta Desenvolvedor
- Vá em: https://play.google.com/console
- Taxa única: $25 USD
- Cadastre-se

### 2. Criar Novo App
1. All apps → Create app
2. App name: `JobMatch`
3. Default language: Português (Brasil)
4. App or game: App
5. Free or paid: Free

### 3. Upload do APK/AAB
1. Production → Create new release
2. Upload APK ou AAB (AAB é preferido)
3. Se usar AAB, rode:
```bash
bubblewrap build --skipPwaValidation
# AAB em: app/build/outputs/bundle/release/app-release.aab
```

### 4. Preencher Informações
- **Store listing:**
  - Short description
  - Full description
  - App icon (512x512)
  - Feature graphic (1024x500)
  - Screenshots (pelo menos 2)

- **Content rating:**
  - Complete o questionário
  - Provavelmente será "Everyone"

- **Target audience:**
  - 18+

- **Privacy policy:**
  - URL: `https://jobmatch.vercel.app/privacy`

### 5. Enviar para Revisão
1. Review → Send for review
2. Aguardar aprovação (3-7 dias)

✅ App publicado!

---

## 📝 Checklist Final

Antes de gerar APK:

- [ ] Deploy no Vercel funcionando
- [ ] MongoDB Atlas conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Manifest.json atualizado com URL do Vercel
- [ ] Assetlinks.json atualizado
- [ ] Site acessível via HTTPS
- [ ] Webhook Mercado Pago atualizado
- [ ] PWA passando em todos os testes
- [ ] Admin acessível
- [ ] Blog funcionando
- [ ] Pagamentos testados

Depois do APK:

- [ ] APK gerado com sucesso
- [ ] Testado em dispositivo físico
- [ ] App abre em fullscreen (sem barra do navegador)
- [ ] Ícone aparece correto
- [ ] Deep links funcionando
- [ ] Push notifications (se habilitadas)

---

## 🆘 Troubleshooting

### Erro: "Module not found" no Vercel
```bash
# Verifique package.json
# Adicione dependências faltantes
yarn add nome-do-pacote
git commit -am "Add missing dependency"
git push
```

### Erro: MongoDB connection timeout
- Verifique se liberou IP `0.0.0.0/0` no Atlas
- Verifique connection string no Vercel
- Teste conexão localmente primeiro

### APK não abre em fullscreen
- Verifique assetlinks.json
- SHA-256 fingerprint deve estar correto
- Teste em: https://developers.google.com/digital-asset-links/tools/generator

### PWA não passa no Lighthouse
- Manifest deve estar acessível
- Service Worker deve estar registrado
- HTTPS obrigatório (Vercel já tem)

---

## 🎉 Resumo Rápido

```bash
# 1. Deploy Vercel
cd /app
vercel --prod

# 2. Configurar MongoDB Atlas
# (via interface web)

# 3. Atualizar URLs
# Editar manifest.json e assetlinks.json

# 4. Gerar APK
# Ir em pwabuilder.com
# Cole URL do Vercel
# Download APK

# 5. Testar
adb install jobmatch.apk

# 🚀 PRONTO!
```

---

**Dúvidas?** Qualquer erro, me avise que eu ajudo! 🤝

**URLs Importantes:**
- Vercel: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com/
- PWABuilder: https://www.pwabuilder.com/
- Play Console: https://play.google.com/console
