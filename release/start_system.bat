@echo off
setlocal
pushd "%~dp0"
echo Iniciando SIAPP...

if not exist "server\\node_modules" (
  echo Instalando dependencias do SIAPP Server ^(server^)...
  pushd "server"
  npm.cmd install --omit=dev
  popd
)

if not exist "serversaf\\node_modules" (
  echo Instalando dependencias do SAF Server ^(serversaf^)...
  pushd "serversaf"
  npm.cmd install --omit=dev
  popd
)

echo Iniciando Backend na porta 3000...
start "SIAPP Server" /D "server" cmd /k "set NODE_ENV=production&& set PORT=3000&& node index.js"

echo Iniciando SAF Backend na porta 3001...
start "SAF Server" /D "serversaf" cmd /k "set NODE_ENV=production&& set PORT=3001&& node server.js"

echo Iniciando Nginx nas portas 80 (SIAPP) e 8080 (SAF)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '.\\nginx.exe' -WorkingDirectory (Get-Location) -Verb RunAs"

echo Sistema iniciado.
echo SIAPP: http://localhost/
echo SAF:   http://localhost:8080/
pause
popd
