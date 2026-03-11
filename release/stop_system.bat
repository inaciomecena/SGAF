@echo off
echo Parando SIAPP...

taskkill /F /IM node.exe
taskkill /F /IM nginx.exe

echo Sistema parado.
pause
