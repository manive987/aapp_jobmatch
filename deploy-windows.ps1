# ================================================
#   JobMatch - Deploy Automatico para Vercel
#   PowerShell Script para Windows
# ================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   🚀 JobMatch Deploy Vercel            ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Verificar se Vercel CLI esta instalado
Write-Host "🔍 Verificando Vercel CLI..." -ForegroundColor Yellow

try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar Vercel CLI" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "✅ Vercel CLI instalado!" -ForegroundColor Green
}

Write-Host ""

# Limpar vercel.json problematico
Write-Host "🧹 Limpando configurações antigas..." -ForegroundColor Yellow

if (Test-Path "vercel.json") {
    Remove-Item "vercel.json" -Force
    Write-Host "✅ vercel.json removido" -ForegroundColor Green
} else {
    Write-Host "ℹ️  vercel.json não existia" -ForegroundColor Gray
}

Write-Host ""

# Criar novo vercel.json limpo
Write-Host "📝 Criando vercel.json limpo..." -ForegroundColor Yellow

$vercelConfig = @"
{
  "version": 2
}
"@

$vercelConfig | Out-File -FilePath "vercel.json" -Encoding utf8 -NoNewline
Write-Host "✅ vercel.json criado" -ForegroundColor Green
Write-Host ""

# Verificar node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules não encontrado" -ForegroundColor Yellow
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    
    if (Test-Path "yarn.lock") {
        yarn install
    } else {
        npm install
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependências instaladas" -ForegroundColor Green
    }
    Write-Host ""
}

# Limpar cache do Vercel se existir
if (Test-Path ".vercel") {
    Write-Host "🧹 Limpando cache do Vercel..." -ForegroundColor Yellow
    Remove-Item ".vercel" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cache limpo" -ForegroundColor Green
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Iniciando deploy no Vercel..." -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   - Se pedir login, escolha sua conta" -ForegroundColor White
Write-Host "   - Se pedir 'Link to project', escolha NO" -ForegroundColor White
Write-Host "   - Nome sugerido: jobmatch" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""

# Deploy de producao
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Copie a URL que apareceu acima" -ForegroundColor White
    Write-Host "   Exemplo: https://jobmatch-xxxx.vercel.app" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Acesse: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Clique no projeto > Settings > Environment Variables" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Adicione as seguintes variáveis:" -ForegroundColor White
    Write-Host ""
    Write-Host "   MONGODB_URI =" -NoNewline -ForegroundColor Cyan
    Write-Host " sua_connection_string_mongodb_atlas" -ForegroundColor Gray
    Write-Host "   JWT_SECRET =" -NoNewline -ForegroundColor Cyan
    Write-Host " seu_secret_super_secreto_123" -ForegroundColor Gray
    Write-Host "   GEMINI_API_KEY =" -NoNewline -ForegroundColor Cyan
    Write-Host " AIzaSyCog7QYLOesQDO66S61ji3WKEEoVDI2E2M" -ForegroundColor Gray
    Write-Host "   MERCADOPAGO_ACCESS_TOKEN =" -NoNewline -ForegroundColor Cyan
    Write-Host " APP_USR-3595746059942621-082712-..." -ForegroundColor Gray
    Write-Host "   MERCADOPAGO_PUBLIC_KEY =" -NoNewline -ForegroundColor Cyan
    Write-Host " APP_USR-601547e8-10ae-4515-bbff-..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Depois de adicionar, rode novamente:" -ForegroundColor White
    Write-Host "   vercel --prod" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "6. Para gerar APK, vá em:" -ForegroundColor White
    Write-Host "   https://www.pwabuilder.com/" -ForegroundColor Cyan
    Write-Host "   Cole sua URL do Vercel" -ForegroundColor Gray
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    # Salvar URL em arquivo
    Write-Host "💾 Salvando informações em VERCEL_DEPLOY.txt..." -ForegroundColor Yellow
    
    $deployInfo = @"
JobMatch - Deploy Info
======================

Deploy realizado em: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

PRÓXIMOS PASSOS:

1. Configurar MongoDB Atlas:
   https://www.mongodb.com/cloud/atlas/register

2. Adicionar Environment Variables no Vercel:
   https://vercel.com/dashboard
   
   MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/jobmatch
   JWT_SECRET = seu_secret_aqui
   GEMINI_API_KEY = AIzaSyCog7QYLOesQDO66S61ji3WKEEoVDI2E2M
   MERCADOPAGO_ACCESS_TOKEN = APP_USR-3595746059942621-082712-a66b43c5eef3e27189815df67f6bfeb4-2655345330
   MERCADOPAGO_PUBLIC_KEY = APP_USR-601547e8-10ae-4515-bbff-30eb7ffd0fd1

3. Redeploy:
   vercel --prod

4. Gerar APK:
   https://www.pwabuilder.com/
   Cole a URL do Vercel

Admin Panel: /secure-panel-x9
Senha: admin123
"@
    
    $deployInfo | Out-File -FilePath "VERCEL_DEPLOY.txt" -Encoding utf8
    Write-Host "✅ Informações salvas em VERCEL_DEPLOY.txt" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "❌ Erro durante o deploy" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Tente:" -ForegroundColor Yellow
    Write-Host "1. vercel logout" -ForegroundColor White
    Write-Host "2. vercel login" -ForegroundColor White
    Write-Host "3. Execute este script novamente" -ForegroundColor White
    Write-Host ""
}

Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
