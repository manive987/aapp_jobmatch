@echo off
REM ================================================
REM   JobMatch - Deploy Automatico para Vercel
REM   Script para Windows
REM ================================================

echo.
echo ╔════════════════════════════════════════╗
echo ║   🚀 JobMatch Deploy Vercel            ║
echo ╚════════════════════════════════════════╝
echo.

REM Verificar se Vercel CLI esta instalado
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI nao encontrado!
    echo.
    echo Instalando Vercel CLI...
    npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao instalar Vercel CLI
        pause
        exit /b 1
    )
    echo ✅ Vercel CLI instalado!
    echo.
)

echo ✅ Vercel CLI encontrado
echo.

REM Limpar vercel.json problematico
echo 🧹 Limpando vercel.json antigo...
if exist vercel.json (
    del vercel.json
    echo ✅ vercel.json removido
) else (
    echo ℹ️  vercel.json nao existia
)
echo.

REM Criar novo vercel.json limpo
echo 📝 Criando vercel.json limpo...
(
echo {
echo   "version": 2
echo }
) > vercel.json
echo ✅ vercel.json criado
echo.

REM Verificar node_modules
if not exist node_modules (
    echo ⚠️  node_modules nao encontrado
    echo 📦 Instalando dependencias...
    call yarn install
    if %ERRORLEVEL% NEQ 0 (
        call npm install
    )
    echo ✅ Dependencias instaladas
    echo.
)

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🚀 Iniciando deploy no Vercel...
echo.
echo ⚠️  IMPORTANTE: 
echo    - Se pedir login, escolha sua conta
echo    - Se pedir "Link to project", escolha NO
echo    - Nome sugerido: jobmatch
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause

REM Deploy de producao
vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo ✅ Deploy concluido com sucesso!
    echo.
    echo 📋 PROXIMOS PASSOS:
    echo.
    echo 1. Copie a URL que apareceu acima
    echo    Exemplo: https://jobmatch-xxxx.vercel.app
    echo.
    echo 2. Acesse: https://vercel.com/dashboard
    echo.
    echo 3. Clique no projeto ^> Settings ^> Environment Variables
    echo.
    echo 4. Adicione as seguintes variaveis:
    echo.
    echo    MONGODB_URI = sua_connection_string_mongodb_atlas
    echo    JWT_SECRET = seu_secret_super_secreto_123
    echo    GEMINI_API_KEY = AIzaSyCog7QYLOesQDO66S61ji3WKEEoVDI2E2M
    echo    MERCADOPAGO_ACCESS_TOKEN = APP_USR-3595746059942621-082712-a66b43c5eef3e27189815df67f6bfeb4-2655345330
    echo    MERCADOPAGO_PUBLIC_KEY = APP_USR-601547e8-10ae-4515-bbff-30eb7ffd0fd1
    echo.
    echo 5. Depois de adicionar, rode novamente:
    echo    vercel --prod
    echo.
    echo 6. Para gerar APK, va em:
    echo    https://www.pwabuilder.com/
    echo    Cole sua URL do Vercel
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
) else (
    echo.
    echo ❌ Erro durante o deploy
    echo.
    echo Tente:
    echo 1. vercel logout
    echo 2. vercel login
    echo 3. Execute este script novamente
    echo.
)

pause
