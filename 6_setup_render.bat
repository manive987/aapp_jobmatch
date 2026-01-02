@echo off
echo ================================================
echo Focus Compass - Setup Render Backend
echo ================================================
echo.

echo IMPORTANTE: Alternativa ao Railway
echo Use este script se o Railway nao funcionar.
echo.
set /p continue="Deseja continuar? (S/N): "
if /i not "%continue%"=="S" (
    echo Setup cancelado.
    pause
    exit /b 0
)

echo.
echo [1/3] Criando arquivo render.yaml...
(
echo services:
echo   - type: web
echo     name: focus-compass-backend
echo     env: python
echo     region: oregon
echo     plan: free
echo     buildCommand: pip install -r requirements.txt
echo     startCommand: cd backend ^&^& uvicorn server:app --host 0.0.0.0 --port $PORT
echo     envVars:
echo       - key: PYTHON_VERSION
echo         value: 3.11.0
) > render.yaml
echo OK: render.yaml criado
echo.

echo [2/3] Instrucoes para Render:
echo.
echo 1. Acesse: https://dashboard.render.com/
echo 2. Clique em "New +" ^> "Web Service"
echo 3. Conecte seu GitHub OU selecione "Public Git repository"
echo 4. Configure:
echo    - Name: focus-compass-backend
echo    - Environment: Python 3
echo    - Build Command: pip install -r requirements.txt
echo    - Start Command: cd backend ^&^& uvicorn server:app --host 0.0.0.0 --port $PORT
echo    - Plan: Free
echo.
echo 5. Adicione Environment Variables:
echo.
echo Digite sua MongoDB Atlas connection string:
set /p MONGO_URL="MongoDB URL: "
echo.
echo Digite a URL do frontend (ou deixe * por enquanto):
set /p CORS="CORS Origins (ou *): "

if "%CORS%"=="" set CORS=*

echo.
echo [3/3] Variaveis para adicionar no Render:
echo.
echo MONGO_URL=%MONGO_URL%
echo DB_NAME=focus_compass
echo CORS_ORIGINS=%CORS%
echo STRIPE_API_KEY=sk_test_emergent
echo SECRET_KEY=%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%
echo ALGORITHM=HS256
echo.
echo.
echo Salvando em .env.render...
(
echo MONGO_URL=%MONGO_URL%
echo DB_NAME=focus_compass
echo CORS_ORIGINS=%CORS%
echo STRIPE_API_KEY=sk_test_emergent
echo SECRET_KEY=%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%
echo ALGORITHM=HS256
) > .env.render
echo OK: .env.render criado
echo.
echo.
echo ================================================
echo Setup Render completo!
echo ================================================
echo.
echo PROXIMOS PASSOS:
echo 1. Faca push do codigo para GitHub (se nao fez)
echo 2. Configure o Web Service no Render
echo 3. Adicione as variaveis de .env.render
echo 4. Aguarde o deploy (5-10 minutos no free tier)
echo 5. Copie a URL fornecida pelo Render
echo 6. Use essa URL no frontend (REACT_APP_BACKEND_URL)
echo.
echo NOTA: O free tier do Render hiberna apos 15 min de inatividade.
echo A primeira requisicao pode demorar ~30 segundos para "acordar".
echo.
pause
