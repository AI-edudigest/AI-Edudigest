# GitHub Setup Guide for AI-Edudigest

## Prerequisites

1. **Install Git for Windows**
   - Download from: https://git-scm.com/download/win
   - During installation, make sure to select "Add Git to PATH"
   - Or use GitHub Desktop: https://desktop.github.com/

## Setup Instructions

### Option 1: Using Git Command Line (Recommended)

1. **Open PowerShell or Command Prompt** in your project directory:
   ```powershell
   cd "D:\AI-Today\AI-Edudigest"
   ```

2. **Configure Git (if not already done)**:
   ```bash
   git config --global user.name "AI-edudigest"
   git config --global user.email "your-email@example.com"
   ```
   Replace `your-email@example.com` with your GitHub email.

3. **Check current remote**:
   ```bash
   git remote -v
   ```

4. **Add/Update remote repository**:
   ```bash
   git remote add origin https://github.com/AI-edudigest/AI-Edudigest.git
   ```
   Or if remote already exists:
   ```bash
   git remote set-url origin https://github.com/AI-edudigest/AI-Edudigest.git
   ```

5. **Verify remote**:
   ```bash
   git remote -v
   ```
   Should show:
   ```
   origin  https://github.com/AI-edudigest/AI-Edudigest.git (fetch)
   origin  https://github.com/AI-edudigest/AI-Edudigest.git (push)
   ```

6. **Check current branch**:
   ```bash
   git branch
   ```

7. **Stage all changes**:
   ```bash
   git add -A
   ```

8. **Commit changes**:
   ```bash
   git commit -m "Update: Fix TypeScript errors and improve code quality"
   ```

9. **Push to GitHub**:
   ```bash
   git push -u origin main
   ```
   Or if your branch is named `master`:
   ```bash
   git push -u origin master
   ```

### Option 2: Using GitHub Desktop

1. Download and install GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. Go to File → Clone Repository
4. Select the "URL" tab
5. Enter: `https://github.com/AI-edudigest/AI-Edudigest.git`
6. Choose local path: `D:\AI-Today\AI-Edudigest`
7. Click "Clone"
8. Make your changes
9. Commit and push through the GUI

### Option 3: Using the Existing Batch Script

After installing Git, you can use the existing `push_to_github.bat` script:

1. **Update the commit message** in `push_to_github.bat` if needed
2. **Double-click** `push_to_github.bat` or run:
   ```powershell
   .\push_to_github.bat
   ```

## Authentication

### Using Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. When pushing, use token as password:
   - Username: `AI-edudigest`
   - Password: `your-personal-access-token`

### Using SSH (Alternative)

1. Generate SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

2. Add SSH key to GitHub:
   - Copy public key from `~/.ssh/id_ed25519.pub`
   - GitHub → Settings → SSH and GPG keys → New SSH key

3. Change remote to SSH:
   ```bash
   git remote set-url origin git@github.com:AI-edudigest/AI-Edudigest.git
   ```

## Troubleshooting

### Git not found
- Make sure Git is installed and added to PATH
- Restart terminal after installation
- Check: `git --version`

### Authentication failed
- Use Personal Access Token instead of password
- Or set up SSH keys

### Branch name mismatch
- Check current branch: `git branch`
- Rename if needed: `git branch -M main`
- Or push to correct branch: `git push origin <branch-name>`

## Quick Commands Reference

```bash
# Check status
git status

# Stage all changes
git add -A

# Commit
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Check remote
git remote -v

# View commit history
git log --oneline
```

## Next Steps

After successful setup:
1. ✅ All TypeScript errors are fixed
2. ✅ Code compiles successfully
3. ✅ Ready to push to GitHub
4. 🔄 Install Git and configure remote
5. 🔄 Push your code to GitHub
