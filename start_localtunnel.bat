@echo off
cd /d "%~dp0"
echo Starting MedVision AI Backend...
start cmd /k "python ai_service\main.py"

echo.
echo Waiting for AI Backend to start...
timeout /t 5

echo.
echo Starting Localtunnel on your permanent domain...
echo Your permanent link is: https://radmax-ai-app.loca.lt
echo.
npx localtunnel --port 8001 --subdomain radmax-ai-app
pause
