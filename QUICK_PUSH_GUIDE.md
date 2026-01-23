# Quick Push Guide - AI-Edudigest

## Your Credentials
- **GitHub Username:** AI-edudigest
- **Email:** aiedudigest@gmail.com
- **Repository:** https://github.com/AI-edudigest/AI-Edudigest.git
- **Branch:** main

## Quick Start

### Step 1: Install Git (if not installed)
1. Download Git: https://git-scm.com/download/win
2. During installation, **check "Add Git to PATH"**
3. Restart PowerShell after installation

### Step 2: Run the Setup Script
1. Open PowerShell in your project directory
2. Run:
   ```powershell
   .\setup_and_push.ps1
   ```

### Step 3: Authenticate with GitHub

When prompted for credentials:
- **Username:** `AI-edudigest`
- **Password:** Use a **Personal Access Token** (NOT your GitHub password)

#### How to Create a Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "AI-Edudigest Local"
4. Select scope: **`repo`** (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing

## Manual Commands (Alternative)

If you prefer to run commands manually:

```powershell
# Navigate to project
cd "D:\AI-Today\AI-Edudigest"

# Configure Git
git config --global user.name "AI-edudigest"
git config --global user.email "aiedudigest@gmail.com"

# Check remote
git remote -v

# If remote is not set or wrong:
git remote set-url origin https://github.com/AI-edudigest/AI-Edudigest.git

# Stage all changes
git add -A

# Commit
git commit -m "Update: Fix TypeScript errors and improve code quality"

# Push to GitHub
git push -u origin main
```

## Troubleshooting

### "Git is not recognized"
- Install Git from https://git-scm.com/download/win
- Make sure "Add Git to PATH" is checked during installation
- Restart PowerShell after installation

### "Authentication failed"
- Use Personal Access Token, not your GitHub password
- Make sure token has `repo` scope
- Token must be copied exactly (no extra spaces)

### "Remote origin already exists"
- Update it: `git remote set-url origin https://github.com/AI-edudigest/AI-Edudigest.git`

### "Branch name mismatch"
- Check current branch: `git branch`
- Switch to main: `git checkout main`
- Or rename: `git branch -M main`

## What's Ready to Push

✅ All TypeScript errors fixed
✅ Code compiles successfully
✅ All files properly configured
✅ Git repository initialized
✅ Remote configured correctly

## Next Steps After Push

1. Verify on GitHub: https://github.com/AI-edudigest/AI-Edudigest
2. Check that all files are uploaded
3. Review the commit history
4. Set up branch protection if needed

## Security Note

⚠️ **Never commit sensitive information:**
- API keys
- Passwords
- `.env` files (already in .gitignore)
- Firebase service account keys

Your `.gitignore` already excludes:
- `node_modules/`
- `dist/`
- `.env` files
- Other sensitive files

---

**Need Help?** Check the full guide: `GITHUB_SETUP_GUIDE.md`
