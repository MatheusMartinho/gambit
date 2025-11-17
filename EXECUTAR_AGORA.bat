@echo off
echo ========================================
echo INICIANDO API MOCK
echo ========================================
echo.

cd /d "%~dp0api-mock"

echo Instalando dependencias...
call npm install

echo.
echo Iniciando servidor...
call npm start

pause
