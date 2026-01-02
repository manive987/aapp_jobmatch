@echo off
echo ================================================
echo Focus Compass - Atualizar Variaveis de Ambiente
echo ================================================
echo.

echo Este script ajuda a atualizar as variaveis de ambiente
echo depois que voce tiver as URLs finais.
echo.

echo Digite a URL do BACKEND (Railway/Render):
set /p BACKEND_URL="Backend URL: "

echo.
echo Digite a URL do FRONTEND (Vercel):
set /p FRONTEND_URL="Frontend URL: "

if "%BACKEND_URL%"=="" (
    echo ERRO: Backend URL nao pode estar vazia!
    pause
    exit /b 1
)

if "%FRONTEND_URL%"=="" (
    echo ERRO: Frontend URL nao pode estar vazia!
    pause
    exit /b 1
)

echo.
echo ================================================
echo Configuracoes Finais
echo ================================================
echo.
echo VERCEL (Frontend):
echo 1. Acesse: https://vercel.com/dashboard
echo 2. Selecione: focus-compass
echo 3. Va em: Settings ^> Environment Variables
echo 4. Adicione/Atualize:
echo    REACT_APP_BACKEND_URL = %BACKEND_URL%
echo 5. Redeploy: Deployments ^> ... ^> Redeploy
echo.
echo.
echo RAILWAY (Backend):
echo 1. Acesse: https://railway.app/project/seu-projeto
echo 2. Selecione seu servico
echo 3. Va em: Variables
echo 4. Adicione/Atualize:
echo    CORS_ORIGINS = %FRONTEND_URL%
echo 5. Deploy automatico sera acionado
echo.
echo.
echo ================================================
echo.
echo Atualizando arquivo local frontend/.env...
cd frontend
(
echo REACT_APP_BACKEND_URL=%BACKEND_URL%
) > .env.production
echo OK: frontend/.env.production atualizado
cd ..
echo.
echo.
echo TESTE FINAL:
echo 1. Acesse: %FRONTEND_URL%
echo 2. Teste o login
echo 3. Teste criacao de projeto
echo 4. Verifique o console do navegador para erros
echo.
echo Se houver erro de CORS:
echo - Confirme CORS_ORIGINS no Railway
echo - Deve ser exatamente: %FRONTEND_URL%
echo.
pause
