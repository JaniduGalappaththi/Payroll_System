@echo off
echo [GitHub] Saving changes to GitHub only...
git add .
git commit -m "Manual Save: %date% %time%"
git push
echo Done! Saved to GitHub.