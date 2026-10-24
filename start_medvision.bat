@echo off
cd /d "%~dp0"
echo ===================================================
echo   Starting MedVision AI (Unified Frontend + Backend)
echo ===================================================
echo.
echo Launching server on http://localhost:8001 ...
start "MedVision AI Server" cmd /k "python ai_service\main.py"

timeout /t 4 /nobreak >nul
echo.
echo Opening unified application in your browser...
start http://localhost:8001/dashboard

echo.
echo [OK] MedVision AI is running at: http://localhost:8001/dashboard
echo Press any key to exit this launcher window (server continues in its own window).
pause >nul
