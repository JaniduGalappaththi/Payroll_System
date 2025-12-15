@echo off
:loop
cls
echo ==========================================
echo      Auto Backup Started (Every 30s)
echo ==========================================

git add .
git commit -m "Auto Update: %date% %time%"
git push

echo.
echo Waiting for 30 seconds...
timeout /t 30 >nul
goto loop