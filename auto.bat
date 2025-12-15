@echo off
:loop
cls
echo ==========================================
echo      AUTO SYNC SYSTEM (GitHub -> Apps Script)
echo ==========================================

:: 1. මුලින්ම GitHub එකට දාන්න
echo [Step 1] Pushing to GitHub...
git add .
git commit -m "Auto Update: %date% %time%"
git push

echo.
echo ------------------------------------------

:: 2. ඊට පස්සේ Apps Script එකට දාන්න
echo [Step 2] Pushing to Apps Script...
call clasp push --force

echo.
echo ==========================================
echo Sync Complete! Waiting 10 seconds...
timeout /t 10 >nul
goto loop