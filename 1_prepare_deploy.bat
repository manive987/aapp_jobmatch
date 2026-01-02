@echo off
echo ================================================
echo Focus Compass - Preparacao para Deploy
echo ================================================
echo.

echo [1/5] Verificando estrutura do projeto...
if not exist "backend" (
    echo ERRO: Pasta backend nao encontrada!
    pause
    exit /b 1
)
if not exist "frontend" (
    echo ERRO: Pasta frontend nao encontrada!
    pause
    exit /b 1
)
echo OK: Estrutura do projeto encontrada
echo.

echo [2/5] Criando arquivo .gitignore na raiz...
(
echo node_modules/
echo __pycache__/
echo *.pyc
echo .env
echo .env.local
echo build/
echo dist/
echo .vscode/
echo .idea/
echo *.log
echo .DS_Store
) > .gitignore
echo OK: .gitignore criado
echo.

echo [3/5] Criando arquivo railway.json para backend...
(
echo {
 echo   "build": {
 echo     "builder": "NIXPACKS"
 echo   },
 echo   "deploy": {
 echo     "startCommand": "cd backend ^&^& uvicorn server:app --host 0.0.0.0 --port $PORT",
 echo     "restartPolicyType": "ON_FAILURE",
 echo     "restartPolicyMaxRetries": 10
 echo   }
 echo }
) > railway.json
echo OK: railway.json criado
echo.

echo [4/5] Criando arquivo vercel.json para frontend...
cd frontend
(
echo {
 echo   "builds": [
 echo     {
 echo       "src": "package.json",
 echo       "use": "@vercel/static-build",
 echo       "config": {
 echo         "distDir": "build"
 echo       }
 echo     }
 echo   ],
 echo   "routes": [
 echo     {
 echo       "src": "/static/(.*)",
 echo       "dest": "/static/$1"
 echo     },
 echo     {
 echo       "src": "/(.*)",
 echo       "dest": "/index.html"
 echo     }
 echo   ]
 echo }
) > vercel.json
cd ..
echo OK: vercel.json criado
echo.

echo [5/5] Criando requirements.txt no root para Railway...
copy backend\requirements.txt requirements.txt >nul
echo OK: requirements.txt copiado para root
echo.

echo ================================================
echo Preparacao completa!
echo ================================================
echo.
echo Proximos passos:
echo 1. Configure MongoDB Atlas e copie a connection string
echo 2. Execute 2_deploy_frontend.bat
echo 3. Execute 3_setup_railway.bat
echo.
pause
