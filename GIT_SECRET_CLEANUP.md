# Git Secret Cleanup Guide

This guide provides exact commands to remove secrets from Git history if they were accidentally committed.

## ⚠️ WARNING

**Before proceeding:**
- Backup your repository
- Coordinate with team members (history rewrite affects everyone)
- Ensure you have admin access to the repository
- Consider the impact on forks and clones

## Pre-Cleanup Checks

### 1. Check if .env was ever committed

```bash
# Check if .env exists in history
git log --all --full-history --source -- .env

# Check for specific secrets in history
git log -p -S "JWT_SECRET" --all
git log -p -S "TOKEN_ENCRYPTION_KEY" --all
git log -p -S "focusflow_password" --all
git log -p -S "ZOHO_CLIENT_SECRET" --all
```

### 2. Check current .env status

```bash
# Verify .env is in .gitignore
grep -E "^\.env$" .gitignore

# Check if .env is tracked
git ls-files | grep "\.env$"
```

## Method 1: Using git-filter-repo (Recommended)

### Installation

```bash
# macOS
brew install git-filter-repo

# Linux (Debian/Ubuntu)
pip install git-filter-repo

# Windows (via pip)
pip install git-filter-repo
```

### Remove .env file from history

```bash
# Backup repository first
cd ..
cp -r focus_flow_deploy focus_flow_deploy_backup
cd focus_flow_deploy

# Remove .env from entire history
git filter-repo --path .env --invert-paths

# Force push (coordinate with team!)
git push origin --force --all
git push origin --force --tags
```

### Remove specific secrets from history

```bash
# Remove lines containing JWT_SECRET with actual values
git filter-repo --replace-text <(echo "JWT_SECRET=.*==>JWT_SECRET=<REDACTED>")

# Remove TOKEN_ENCRYPTION_KEY values
git filter-repo --replace-text <(echo "TOKEN_ENCRYPTION_KEY=.*==>TOKEN_ENCRYPTION_KEY=<REDACTED>")

# Remove database passwords
git filter-repo --replace-text <(echo "postgresql://.*:.*@==>postgresql://user:password@")

# Remove Zoho secrets
git filter-repo --replace-text <(echo "ZOHO_CLIENT_SECRET=.*==>ZOHO_CLIENT_SECRET=<REDACTED>")
```

### Create replacement file

Create `replacements.txt`:
```
JWT_SECRET=.*==>JWT_SECRET=<REDACTED>
TOKEN_ENCRYPTION_KEY=.*==>TOKEN_ENCRYPTION_KEY=<REDACTED>
postgresql://focusflow:focusflow_password@==>postgresql://user:password@
ZOHO_CLIENT_SECRET=.*==>ZOHO_CLIENT_SECRET=<REDACTED>
STRIPE_SECRET_KEY=sk_live.*==>STRIPE_SECRET_KEY=<REDACTED>
RAZORPAY_KEY_SECRET=.*==>RAZORPAY_KEY_SECRET=<REDACTED>
```

Then run:
```bash
git filter-repo --replace-text replacements.txt
```

## Method 2: Using BFG Repo-Cleaner

### Installation

```bash
# Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Or use Homebrew (macOS)
brew install bfg
```

### Remove .env file from history

```bash
# Clone a fresh copy (BFG works on clones)
cd ..
git clone --mirror https://github.com/your-username/focus_flow_deploy.git focus_flow_deploy.git

# Remove .env file
java -jar bfg-1.14.0.jar --delete-files .env focus_flow_deploy.git

# Clean up
cd focus_flow_deploy.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Push changes
git push
```

### Replace secrets with placeholders

Create `secrets.txt`:
```
JWT_SECRET=.*
TOKEN_ENCRYPTION_KEY=.*
focusflow_password
ZOHO_CLIENT_SECRET=.*
```

Then:
```bash
java -jar bfg-1.14.0.jar --replace-text secrets.txt focus_flow_deploy.git
cd focus_flow_deploy.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push
```

## Method 3: Manual git filter-branch (Legacy)

⚠️ **Not recommended** - Use git-filter-repo or BFG instead.

```bash
# Remove .env from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
git push origin --force --tags
```

## Post-Cleanup Steps

### 1. Verify cleanup

```bash
# Check .env is gone from history
git log --all --full-history -- .env

# Search for secrets
git log -p -S "JWT_SECRET" --all | grep -v "<REDACTED>"
```

### 2. Update .gitignore (if needed)

Ensure `.env` is in `.gitignore`:
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
git add .gitignore
git commit -m "chore: ensure .env files are ignored"
```

### 3. Rotate all secrets

**IMPORTANT**: After removing secrets from history, rotate all affected secrets:

- Generate new JWT_SECRET
- Generate new TOKEN_ENCRYPTION_KEY
- Change database passwords
- Regenerate API keys (Zoho, Stripe, Razorpay)
- Update all environment variables

### 4. Notify team members

```bash
# Team members need to re-clone or reset
# Send them this message:

"Git history has been rewritten to remove secrets. 
Please re-clone the repository or run:
git fetch origin
git reset --hard origin/main
"

# Or provide reset script
cat > reset-repo.sh << 'EOF'
#!/bin/bash
git fetch origin
git reset --hard origin/main
git clean -fd
EOF
```

## Prevention

### Pre-commit hook

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Prevent committing .env files
if git diff --cached --name-only | grep -E "\.env$|\.env\."; then
  echo "ERROR: Attempted to commit .env file!"
  echo "Please remove .env files from staging area."
  exit 1
fi

# Check for common secret patterns
if git diff --cached | grep -E "(JWT_SECRET|TOKEN_ENCRYPTION_KEY|password|secret|api_key)\s*=\s*[^<]"; then
  echo "WARNING: Potential secret detected in staged changes!"
  echo "Please review before committing."
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### Use git-secrets (AWS tool)

```bash
# Install
brew install git-secrets  # macOS
# Or: https://github.com/awslabs/git-secrets

# Setup
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'JWT_SECRET\s*=\s*[^<].*'
git secrets --add 'TOKEN_ENCRYPTION_KEY\s*=\s*[^<].*'
```

## Recovery

If cleanup went wrong:

```bash
# Restore from backup
cd ..
rm -rf focus_flow_deploy
cp -r focus_flow_deploy_backup focus_flow_deploy
cd focus_flow_deploy
```

## Summary Commands

**Quick cleanup checklist:**

```bash
# 1. Backup
cp -r . ../backup

# 2. Check what needs cleaning
git log -p -S "JWT_SECRET" --all | head -20

# 3. Remove .env from history (if committed)
git filter-repo --path .env --invert-paths

# 4. Replace secrets with placeholders
git filter-repo --replace-text replacements.txt

# 5. Force push (coordinate with team!)
git push origin --force --all

# 6. Rotate all secrets
# (Generate new values and update environment variables)

# 7. Verify
git log -p -S "JWT_SECRET" --all
```

---

**Remember**: History rewriting is destructive. Always backup first and coordinate with your team!



