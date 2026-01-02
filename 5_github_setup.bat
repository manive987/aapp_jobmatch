@echo off
echo ================================================
echo Focus Compass - Setup GitHub
echo ================================================
echo.

echo Este script ajuda a configurar o GitHub para deploy.
echo.
set /p continue="Deseja continuar? (S/N): "
if /i not "%continue%"=="S" (
    echo Setup cancelado.
    pause
    exit /b 0
)

echo.
echo [1/5] Inicializando repositorio Git...
if not exist ".git" (
    git init
    echo OK: Git inicializado
) else (
    echo Git ja esta inicializado
)
echo.

echo [2/5] Adicionando arquivos ao Git...
git add .
echo OK: Arquivos adicionados
echo.

echo [3/5] Criando commit inicial...
git commit -m "Initial commit - Focus Compass SaaS"
if errorlevel 1 (
    echo Commit ja existe ou nada para commitar
) else (
    echo OK: Commit criado
)
echo.

echo [4/5] Instrucoes para GitHub:
echo.
echo 1. Acesse: https://github.com/new
echo 2. Nome do repositorio: focus-compass
echo 3. Deixe como Privado (recomendado)
echo 4. NAO inicialize com README
echo 5. Clique em "Create repository"
echo.
echo.
echo Digite a URL do repositorio criado:
echo Exemplo: https://github.com/seu-usuario/focus-compass.git
set /p REPO_URL="Repository URL: "

if "%REPO_URL%"=="" (
    echo ERRO: URL do repositorio nao pode estar vazia!
    pause
    exit /b 1
)

echo.
echo [5/5] Conectando ao GitHub e fazendo push...
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ERRO: Falha ao fazer push!
    echo.
    echo Possiveis solucoes:
    echo 1. Verifique se a URL esta correta
    echo 2. Verifique suas credenciais do GitHub
    echo 3. Tente manualmente:
    echo    git remote add origin %REPO_URL%
    echo    git push -u origin main
    pause
    exit /b 1
)

echo.
echo ================================================
echo GitHub configurado com sucesso!
echo ================================================
echo.
echo Repositorio: %REPO_URL%
echo.
echo PROXIMOS PASSOS:
echo 1. Conecte este repositorio no Railway para deploy automatico
echo 2. A cada push, o Railway fara deploy automaticamente
echo.
pause
