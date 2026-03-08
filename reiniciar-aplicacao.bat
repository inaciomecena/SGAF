@echo off
setlocal
set "ROOT=%~dp0"

for %%P in (3000 5173) do call :KillPort %%P

start "SGAF API" cmd /k "cd /d "%ROOT%" && node server.js"
start "SGAF Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev"

echo Aplicacao reiniciada.
exit /b 0

:KillPort
for /f "tokens=5" %%A in ('netstat -ano ^| findstr :%1 ^| findstr LISTENING') do (
  taskkill /F /PID %%A >nul 2>&1
)
goto :eof
