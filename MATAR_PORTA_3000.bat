@echo off
echo ========================================
echo MATANDO PROCESSO NA PORTA 3000
echo ========================================
echo.

echo Procurando processo na porta 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Encontrado PID: %%a
    echo Matando processo...
    taskkill /F /PID %%a
    echo.
    echo ✅ Processo encerrado!
)

echo.
echo ========================================
echo PRONTO! Agora execute: npm start
echo ========================================
echo.
pause
