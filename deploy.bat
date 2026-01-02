@echo off
chcp 65001 >nul
cls

echo ================================================
echo   JobMatch - Deploy Automatico Vercel
echo ================================================
echo.

REM Limpar vercel.json problematico
if exist vercel.json (
    del vercel.json
    echo [OK] vercel.json antigo removido
) else (
    echo [INFO] vercel.json nao existia
)
echo.

REM Criar novo vercel.json
echo [INFO] Criando vercel.json limpo...
(
echo {
echo   "version": 2
echo }
) > vercel.json
echo [OK] vercel.json criado
echo.

REM Verificar Vercel CLI
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Instalando Vercel CLI...
    call npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo [ERRO] Falha ao instalar Vercel CLI
        pause
        exit /b 1
    )
    echo [OK] Vercel CLI instalado
)

echo [OK] Vercel CLI encontrado
echo.

REM Verificar node_modules
if not exist node_modules (
    echo [INFO] Instalando dependencias...
    call npm install
    echo [OK] Dependencias instaladas
    echo.
)

echo ================================================
echo   Iniciando Deploy
echo ================================================
echo.
echo IMPORTANTE:
echo - Se pedir login, escolha sua conta
echo - Se pedir "Link to project", escolha NO
echo - Nome sugerido: jobmatch
echo.
pause

REM Deploy
call vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo   Deploy Concluido!
    echo ================================================
    echo.
    echo PROXIMOS PASSOS:
    echo.
    echo 1. Acesse: https://vercel.com/dashboard
    echo 2. Clique no projeto
    echo 3. Settings -^> Environment Variables
    echo 4. Adicione:
    echo    - MONGODB_URI
    echo    - JWT_SECRET
    echo    - GEMINI_API_KEY
    echo    - MERCADOPAGO_ACCESS_TOKEN
    echo    - MERCADOPAGO_PUBLIC_KEY
    echo.
    echo 5. Execute novamente: vercel --prod
    echo.
) else (
    echo.
    echo [ERRO] Falha no deploy
    echo.
    echo Tente:
    echo 1. vercel logout
    echo 2. vercel login
    echo 3. Execute este script novamente
    echo.
)

pause
