@echo off
cd /d "C:\AI-Edudigest-main new"
echo Checking git status...
git status
echo.
echo Staging all changes...
git add -A
echo.
echo Committing changes...
git commit -m "Add event editing functionality, time field, and createdAt sorting"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Check the output above for any errors.
pause

