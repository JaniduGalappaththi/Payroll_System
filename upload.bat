@echo off
cls
echo ==========================================
echo      MANUAL UPLOAD SYSTEM
echo      (1. GitHub -> 2. Google Apps Script)
echo ==========================================

:: 1. GitHub වෙත යැවීම
echo.
echo [Step 1] Sending to GitHub...
git add .
git commit -m "Manual Update: %date% %time%"
git push

:: 2. Apps Script වෙත යැවීම
echo.
echo ------------------------------------------
echo [Step 2] Sending to Google Apps Script...
call clasp push --force

echo.
echo ==========================================
echo SUCCESS! All updates sent successfully.
echo ==========================================
pause
