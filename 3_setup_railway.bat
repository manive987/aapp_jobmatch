@echo off
echo ================================================
echo Focus Compass - Setup Railway Backend
echo ================================================
echo.

echo IMPORTANTE: Antes de continuar:
echo 1. Crie uma conta no Railway: https://railway.app
echo 2. Instale Railway CLI: npm install -g @railway/cli
echo 3. Faca login: railway login
echo 4. Tenha sua MongoDB Atlas connection string pronta
echo.
set /p continue="Deseja continuar? (S/N): "
if /i not "%continue%"=="S" (
    echo Setup cancelado.
    pause
    exit /b 0
)

echo.
echo Digite sua MongoDB Atlas connection string:
echo Exemplo: mongodb+srv://usuario:senha@cluster.xxxxx.mongodb.net/
set /p MONGO_URL="MongoDB URL: "

if "%MONGO_URL%"=="" (
    echo ERRO: MongoDB URL nao pode estar vazia!
    pause
    exit /b 1
)

echo.
echo Digite a URL do seu frontend Vercel:
echo Exemplo: https://focus-compass.vercel.app
set /p FRONTEND_URL="Frontend URL: "

if "%FRONTEND_URL%"=="" (
    echo ERRO: Frontend URL nao pode estar vazia!
    pause
    exit /b 1
)

echo.
echo [1/3] Criando arquivo de variaveis de ambiente...
(
echo MONGO_URL=%MONGO_URL%
echo DB_NAME=focus_compass
echo CORS_ORIGINS=%FRONTEND_URL%
echo STRIPE_API_KEY=sk_test_emergent
echo SECRET_KEY=%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%
echo ALGORITHM=HS256
echo PORT=8001
) > .env.railway
echo OK: Arquivo .env.railway criado
echo.

echo [2/3] Instrucoes para Railway:
echo.
echo OPCAO 1 - Via Interface Web (Recomendado):
echo 1. Acesse: https://railway.app/new
echo 2. Clique em "Deploy from GitHub repo"
echo 3. Conecte seu repositorio GitHub
echo 4. Railway detectara automaticamente Python
echo 5. Va em Variables e adicione as variaveis do arquivo .env.railway
echo 6. Deploy sera automatico!
echo.
echo OPCAO 2 - Via CLI:
echo 1. Execute: railway init
echo 2. Execute: railway up
echo 3. Configure variaveis: railway variables
echo.
echo.

echo [3/3] Criando arquivo de configuracao do Railway...
if not exist "Procfile" (
    echo web: cd backend ^&^& uvicorn server:app --host 0.0.0.0 --port $PORT > Procfile
    echo OK: Procfile criado
) else (
    echo Procfile ja existe
)
echo.

if not exist "runtime.txt" (
    echo python-3.11.0 > runtime.txt
    echo OK: runtime.txt criado
) else (
    echo runtime.txt ja existe
)
echo.

echo ================================================
echo Setup Railway completo!
echo ================================================
echo.
echo Arquivo .env.railway criado com suas configuracoes.
echo.
echo PROXIMOS PASSOS:
echo 1. Faca push do codigo para GitHub
echo 2. Conecte o repo no Railway
echo 3. Adicione as variaveis de .env.railway no Railway Dashboard
echo 4. Aguarde o deploy automatico
echo 5. Copie a URL do backend gerada pelo Railway
echo 6. Atualize REACT_APP_BACKEND_URL no Vercel com essa URL
echo.
echo Arquivo com suas variaveis: .env.railway
echo.
pause
