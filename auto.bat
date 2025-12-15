@echo off
:loop
cls
echo ==========================================
echo      Auto Backup Running...
echo      (Checking for changes every 10s)
echo ==========================================

:: 1. අලුත් වෙනස්කම් එකතු කරගන්න
git add .

:: 2. වෙනස්කම් තියෙනවා නම් Save කරන්න, නැත්නම් පණිවිඩයක් දෙන්න
git commit -m "Auto Update: %date% %time%" || echo [INFO] No new changes found to save.

:: 3. GitHub එකට යවන්න
git push
: : // 
echo.
echo Waiting 10 seconds...
timeout /t 10 >nul
goto loop