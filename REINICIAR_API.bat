@echo off
echo ========================================
echo REINICIANDO API MOCK
echo ========================================
echo.

echo Matando processo na porta 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo Aguardando 2 segundos...
timeout /t 2 /nobreak >nul

echo.
echo Iniciando API Mock...
cd api-mock
start cmd /k "npm start"

echo.
echo ========================================
echo API REINICIADA!
echo ========================================
echo.
echo Aguarde a mensagem "API Mock rodando!"
echo.
pause
