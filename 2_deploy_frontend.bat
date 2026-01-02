@echo off
echo ================================================
echo Focus Compass - Deploy Frontend (Vercel)
echo ================================================
echo.

echo IMPORTANTE: Antes de continuar, voce precisa:
echo 1. Ter uma conta no Vercel (https://vercel.com)
echo 2. Ter instalado Vercel CLI: npm install -g vercel
echo 3. Ter feito login: vercel login
echo 4. Ter a URL do backend (Railway/Render)
echo.
set /p continue="Deseja continuar? (S/N): "
if /i not "%continue%"=="S" (
    echo Deploy cancelado.
    pause
    exit /b 0
)

echo.
echo Digite a URL do seu BACKEND (exemplo: https://focus-compass-backend.railway.app)
set /p BACKEND_URL="URL do Backend: "

if "%BACKEND_URL%"=="" (
    echo ERRO: URL do backend nao pode estar vazia!
    pause
    exit /b 1
)

echo.
echo [1/4] Atualizando .env do frontend...
cd frontend
(
echo REACT_APP_BACKEND_URL=%BACKEND_URL%
) > .env.production
echo OK: .env.production criado com backend URL
echo.

echo [2/4] Instalando dependencias...
call c
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)
echo OK: Dependencias instaladas
echo.

echo [3/4] Testando build local...
call yarn build
if errorlevel 1 (
    echo ERRO: Build falhou! Corrija os erros antes de fazer deploy.
    pause
    exit /b 1
)
echo OK: Build local bem-sucedido
echo.

echo [4/4] Fazendo deploy no Vercel...
echo.
echo ATENCAO: O Vercel vai abrir no navegador para autenticacao.
echo Durante o deploy, configure:
echo - Framework: Create React App
echo - Build Command: yarn build
echo - Output Directory: build
echo - Environment Variable: REACT_APP_BACKEND_URL = %BACKEND_URL%
echo.
pause

call vercel --prod

if errorlevel 1 (
    echo.
    echo ERRO: Deploy falhou!
    echo.
    echo Solucoes:
    echo 1. Verifique se voce fez login: vercel login
    echo 2. Tente novamente manualmente: cd frontend ^&^& vercel --prod
    echo 3. Adicione a variavel de ambiente no Vercel Dashboard
    pause
    exit /b 1
)

echo.
echo ================================================
echo Deploy concluido!
echo ================================================
echo.
echo Seu frontend esta no ar!
echo Copie a URL fornecida pelo Vercel.
echo.
echo IMPORTANTE: Configure a variavel de ambiente no Vercel:
echo 1. Acesse: https://vercel.com/dashboard
echo 2. Selecione seu projeto
echo 3. Settings ^> Environment Variables
echo 4. Adicione: REACT_APP_BACKEND_URL = %BACKEND_URL%
echo 5. Redeploy o projeto
echo.
cd ..
pause
