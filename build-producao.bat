@echo off
setlocal
set "ROOT=%~dp0"
set "OUT=%ROOT%buildpro"
set "CLIENT=%OUT%\clientsaf"
set "SERVER=%OUT%\serversaf"

echo ============================================
echo SGAF - Build de Producao
echo Pasta: %ROOT%
echo ============================================

cd /d "%ROOT%" || exit /b 1

echo.
echo [1/3] Instalando dependencias (backend)...
call npm install
if errorlevel 1 exit /b %errorlevel%

echo.
echo [2/3] Instalando dependencias (frontend)...
call npm --prefix frontend install
if errorlevel 1 exit /b %errorlevel%

echo.
echo [3/3] Gerando build do frontend...
call npm run build
if errorlevel 1 exit /b %errorlevel%

echo.
echo [4/4] Preparando pastas de distribuicao (clientsaf / serversaf)...
if exist "%CLIENT%" rmdir /s /q "%CLIENT%"
if exist "%SERVER%" rmdir /s /q "%SERVER%"
if not exist "%OUT%" mkdir "%OUT%"
mkdir "%CLIENT%" >nul 2>&1
mkdir "%SERVER%" >nul 2>&1

robocopy "%ROOT%frontend\dist" "%CLIENT%" /MIR /NFL /NDL /NJH /NJS >nul
if errorlevel 8 exit /b 1

robocopy "%ROOT%src" "%SERVER%\src" /MIR /NFL /NDL /NJH /NJS >nul
if errorlevel 8 exit /b 1

copy /Y "%ROOT%server.js" "%SERVER%\server.js" >nul
if errorlevel 1 exit /b %errorlevel%
copy /Y "%ROOT%package.json" "%SERVER%\package.json" >nul
if errorlevel 1 exit /b %errorlevel%
if exist "%ROOT%package-lock.json" copy /Y "%ROOT%package-lock.json" "%SERVER%\package-lock.json" >nul
if errorlevel 1 exit /b %errorlevel%

if exist "%ROOT%.env.production" (
  copy /Y "%ROOT%.env.production" "%SERVER%\.env" >nul
) else if exist "%ROOT%.env" (
  copy /Y "%ROOT%.env" "%SERVER%\.env" >nul
)

echo.
echo Build concluido com sucesso.
echo Client: %CLIENT%
echo Server: %SERVER%
exit /b 0
