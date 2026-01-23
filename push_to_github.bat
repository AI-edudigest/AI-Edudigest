@echo off
cd /d "%~dp0"
echo ========================================
echo AI-Edudigest Git Push Script
echo ========================================
echo.
echo Current directory: %CD%
echo.

REM Configure Git (if not already configured)
git config user.name "AI-edudigest" 2>nul
git config user.email "aiedudigest@gmail.com" 2>nul

echo Git configured:
echo   Username: AI-edudigest
echo   Email: aiedudigest@gmail.com
echo.

echo Checking git status...
git status
echo.

echo Staging all changes...
git add -A
echo.

echo Committing changes...
git commit -m "Update: Fix TypeScript errors, improve code quality, and update configuration"
echo.

echo ========================================
echo Pushing to GitHub...
echo Repository: https://github.com/AI-edudigest/AI-Edudigest.git
echo Branch: main
echo ========================================
echo.
echo NOTE: You will be prompted for GitHub credentials
echo   Username: AI-edudigest
echo   Password: Use Personal Access Token (not GitHub password)
echo   Get token at: https://github.com/settings/tokens
echo.
pause

git push origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo SUCCESS! Code pushed to GitHub
    echo ========================================
    echo View repository: https://github.com/AI-edudigest/AI-Edudigest
) else (
    echo ========================================
    echo ERROR: Push failed
    echo ========================================
    echo.
    echo Troubleshooting:
    echo 1. Make sure Git is installed and in PATH
    echo 2. Use Personal Access Token as password
    echo 3. Token must have 'repo' scope
    echo.
)

echo.
echo Done! Check the output above for any errors.
pause

