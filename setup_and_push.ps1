# Git Setup and Push Script for AI-Edudigest
# Email: aiedudigest@gmail.com
# Repository: https://github.com/AI-edudigest/AI-Edudigest.git

Write-Host "=== AI-Edudigest Git Setup and Push ===" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed or not in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Make sure to select 'Add Git to PATH' during installation." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installing Git, restart PowerShell and run this script again." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Configuring Git..." -ForegroundColor Cyan

# Configure Git user
git config --global user.name "AI-edudigest"
git config --global user.email "aiedudigest@gmail.com"

Write-Host "✓ Git user configured:" -ForegroundColor Green
Write-Host "  Name: AI-edudigest" -ForegroundColor Gray
Write-Host "  Email: aiedudigest@gmail.com" -ForegroundColor Gray

Write-Host ""
Write-Host "Checking repository status..." -ForegroundColor Cyan

# Check current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Gray

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "✗ Not a Git repository. Initializing..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Repository initialized" -ForegroundColor Green
}

# Check remote
Write-Host ""
Write-Host "Checking remote configuration..." -ForegroundColor Cyan
$remote = git remote get-url origin 2>$null

if ($remote) {
    Write-Host "✓ Remote found: $remote" -ForegroundColor Green
    if ($remote -ne "https://github.com/AI-edudigest/AI-Edudigest.git") {
        Write-Host "Updating remote URL..." -ForegroundColor Yellow
        git remote set-url origin "https://github.com/AI-edudigest/AI-Edudigest.git"
        Write-Host "✓ Remote updated" -ForegroundColor Green
    }
} else {
    Write-Host "Adding remote..." -ForegroundColor Yellow
    git remote add origin "https://github.com/AI-edudigest/AI-Edudigest.git"
    Write-Host "✓ Remote added" -ForegroundColor Green
}

# Check current branch
Write-Host ""
Write-Host "Checking branch..." -ForegroundColor Cyan
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    Write-Host "No branch found. Creating main branch..." -ForegroundColor Yellow
    git checkout -b main
    $currentBranch = "main"
}
Write-Host "Current branch: $currentBranch" -ForegroundColor Gray

# If not on main, switch to main
if ($currentBranch -ne "main") {
    Write-Host "Switching to main branch..." -ForegroundColor Yellow
    git checkout -b main 2>$null
    if ($LASTEXITCODE -ne 0) {
        git checkout main
    }
}

# Check status
Write-Host ""
Write-Host "Checking for changes..." -ForegroundColor Cyan
git status --short

# Stage all changes
Write-Host ""
Write-Host "Staging all changes..." -ForegroundColor Cyan
git add -A
Write-Host "✓ All changes staged" -ForegroundColor Green

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host ""
    Write-Host "Committing changes..." -ForegroundColor Cyan
    $commitMessage = "Update: Fix TypeScript errors, improve code quality, and add GitHub setup"
    git commit -m $commitMessage
    Write-Host "✓ Changes committed" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "No changes to commit." -ForegroundColor Yellow
}

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "Repository: https://github.com/AI-edudigest/AI-Edudigest.git" -ForegroundColor Gray
Write-Host "Branch: main" -ForegroundColor Gray
Write-Host ""
Write-Host "You will be prompted for GitHub credentials:" -ForegroundColor Yellow
Write-Host "  Username: AI-edudigest" -ForegroundColor Yellow
Write-Host "  Password: Use a Personal Access Token (not your GitHub password)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Generate token at: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "Select 'repo' scope when creating the token." -ForegroundColor Cyan
Write-Host ""

$push = Read-Host "Press Enter to push, or type 'skip' to skip pushing"
if ($push -ne "skip") {
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "View your repository at: https://github.com/AI-edudigest/AI-Edudigest" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "✗ Push failed. Please check your credentials and try again." -ForegroundColor Red
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "1. Make sure you have a Personal Access Token" -ForegroundColor Gray
        Write-Host "2. Use the token as your password (not your GitHub password)" -ForegroundColor Gray
        Write-Host "3. Token must have 'repo' scope" -ForegroundColor Gray
    }
} else {
    Write-Host "Push skipped." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
pause
