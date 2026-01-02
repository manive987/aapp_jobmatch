# JobMatch Deploy Script
# PowerShell Version

Clear-Host

Write-Host "================================================"
Write-Host "  JobMatch - Deploy Automatico Vercel"
Write-Host "================================================"
Write-Host ""

# Limpar vercel.json
Write-Host "[INFO] Limpando vercel.json antigo..."
if (Test-Path "vercel.json") {
    Remove-Item "vercel.json" -Force
    Write-Host "[OK] vercel.json removido"
} else {
    Write-Host "[INFO] vercel.json nao existia"
}
Write-Host ""

# Criar novo vercel.json
Write-Host "[INFO] Criando vercel.json limpo..."
@"
{
  "version": 2
}
"@ | Out-File -FilePath "vercel.json" -Encoding UTF8 -NoNewline
Write-Host "[OK] vercel.json criado"
Write-Host ""

# Verificar Vercel CLI
Write-Host "[INFO] Verificando Vercel CLI..."
try {
    $null = vercel --version 2>&1
    Write-Host "[OK] Vercel CLI encontrado"
} catch {
    Write-Host "[INFO] Instalando Vercel CLI..."
    npm install -g vercel
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Vercel CLI instalado"
    } else {
        Write-Host "[ERRO] Falha ao instalar Vercel CLI"
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}
Write-Host ""

# Verificar node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Instalando dependencias..."
    npm install
    Write-Host "[OK] Dependencias instaladas"
    Write-Host ""
}

# Limpar cache Vercel
if (Test-Path ".vercel") {
    Write-Host "[INFO] Limpando cache..."
    Remove-Item ".vercel" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Cache limpo"
    Write-Host ""
}

Write-Host "================================================"
Write-Host "  Iniciando Deploy"
Write-Host "================================================"
Write-Host ""
Write-Host "IMPORTANTE:"
Write-Host "- Se pedir login, escolha sua conta"
Write-Host "- Se pedir 'Link to project', escolha NO"
Write-Host "- Nome sugerido: jobmatch"
Write-Host ""
Read-Host "Pressione Enter para continuar"
Write-Host ""

# Deploy
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================"
    Write-Host "  Deploy Concluido!"
    Write-Host "================================================"
    Write-Host ""
    Write-Host "PROXIMOS PASSOS:"
    Write-Host ""
    Write-Host "1. Acesse: https://vercel.com/dashboard"
    Write-Host "2. Clique no projeto"
    Write-Host "3. Settings -> Environment Variables"
    Write-Host "4. Adicione as variaveis:"
    Write-Host ""
    Write-Host "   MONGODB_URI = sua_connection_string"
    Write-Host "   JWT_SECRET = seu_secret_123"
    Write-Host "   GEMINI_API_KEY = AIzaSyCog7QYLOesQDO66S61ji3WKEEoVDI2E2M"
    Write-Host "   MERCADOPAGO_ACCESS_TOKEN = APP_USR-3595746059942621-082712-..."
    Write-Host "   MERCADOPAGO_PUBLIC_KEY = APP_USR-601547e8-10ae-4515-bbff-..."
    Write-Host ""
    Write-Host "5. Execute novamente: vercel --prod"
    Write-Host ""
    Write-Host "6. Para gerar APK: https://www.pwabuilder.com/"
    Write-Host ""
    
    # Salvar info em arquivo
    @"
JobMatch - Deploy Info
======================

Deploy: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

PROXIMOS PASSOS:

1. MongoDB Atlas: https://cloud.mongodb.com/
2. Adicionar Environment Variables no Vercel
3. Redeploy: vercel --prod
4. Gerar APK: https://www.pwabuilder.com/

Admin: /secure-panel-x9
Senha: admin123
"@ | Out-File -FilePath "DEPLOY_INFO.txt" -Encoding UTF8
    
    Write-Host "[OK] Informacoes salvas em DEPLOY_INFO.txt"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERRO] Falha no deploy"
    Write-Host ""
    Write-Host "Tente:"
    Write-Host "1. vercel logout"
    Write-Host "2. vercel login"
    Write-Host "3. Execute este script novamente"
    Write-Host ""
}

Read-Host "Pressione Enter para sair"
