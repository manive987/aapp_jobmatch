# 🚀 Como Usar os Scripts de Deploy

## Para Windows

Você tem 2 opções:

---

## Opção 1: Script .BAT (Mais Simples)

### Como usar:
1. Copie o arquivo `deploy-windows.bat` para sua pasta do projeto
2. Dê dois cliques no arquivo
3. Siga as instruções na tela

**OU**

No PowerShell/CMD:
```cmd
cd C:\Users\marco\Desktop\aapp_jobmatch-main
deploy-windows.bat
```

---

## Opção 2: Script PowerShell (Mais Completo)

### Como usar:

No PowerShell:
```powershell
cd C:\Users\marco\Desktop\aapp_jobmatch-main

# Se der erro de execução, rode primeiro:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Depois execute:
.\deploy-windows.ps1
```

---

## 📋 O que os scripts fazem:

1. ✅ Verificam se Vercel CLI está instalado (instalam se necessário)
2. ✅ Limpam o `vercel.json` problemático
3. ✅ Criam um novo `vercel.json` correto
4. ✅ Verificam dependências (node_modules)
5. ✅ Fazem o deploy no Vercel
6. ✅ Mostram próximos passos
7. ✅ Salvam informações em arquivo `VERCEL_DEPLOY.txt`

---

## 🎯 Próximos Passos (Automático)

Depois do deploy, você vai ver na tela:

1. **URL do seu site** (copie!)
   - Exemplo: `https://jobmatch-abc123.vercel.app`

2. **Instruções para adicionar variáveis de ambiente**

3. **Link para gerar APK**

---

## 🔧 Se der erro:

### "Cannot run scripts" no PowerShell:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\deploy-windows.ps1
```

### "Vercel CLI not found":
```cmd
npm install -g vercel
```

### "Module not found":
```cmd
npm install
# ou
yarn install
```

---

## 📁 Arquivos Criados:

- `vercel.json` - Configuração limpa
- `VERCEL_DEPLOY.txt` - Informações do deploy
- `.vercel/` - Cache do Vercel (pode ignorar)

---

## 🎉 Resumo de Uso:

### Primeira vez:
1. Execute o script (qualquer um dos 2)
2. Faça login quando pedir
3. Aguarde o deploy
4. Copie a URL
5. Vá no dashboard Vercel e adicione env vars
6. Execute o script novamente

### Próximas vezes:
```cmd
deploy-windows.bat
```
Pronto! 🚀

---

## 🌐 Links Úteis:

- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com/
- **PWABuilder (APK):** https://www.pwabuilder.com/

---

## 💡 Dica:

Depois do primeiro deploy, você pode usar direto:
```cmd
vercel --prod
```

Mas o script é útil para limpar problemas! 🧹
