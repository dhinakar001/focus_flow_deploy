# Secret Management Guide

Complete guide for managing secrets securely in FocusFlow using GitHub Secrets and environment variables.

## Overview

This guide covers:
- Setting up GitHub Secrets for CI/CD
- Managing environment variables
- Secret rotation procedures
- Best practices for secret management

## GitHub Secrets Setup

### Step 1: Access Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (top navigation)
3. Navigate to **Secrets and variables** → **Actions**

### Step 2: Add Repository Secrets

Click **New repository secret** for each secret:

#### Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `JWT_SECRET` | JWT signing secret (32+ chars) | `a1b2c3d4e5f6...` (hex) |
| `TOKEN_ENCRYPTION_KEY` | AES encryption key (base64) | `YWJjZGVmZ2hpams...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ZOHO_CLIENT_ID` | Zoho OAuth client ID | `1000.ABC123...` |
| `ZOHO_CLIENT_SECRET` | Zoho OAuth client secret | `abc123def456...` |

#### Optional Secrets (if using)

| Secret Name | Description |
|------------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret |

### Step 3: Generate Secure Secrets

#### Generate JWT Secret

```bash
# Generate 32-byte hex secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

#### Generate Encryption Key

```bash
# Generate base64-encoded 32-byte key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or using OpenSSL
openssl rand -base64 32
```

### Step 4: Reference Secrets in Workflows

Update `.github/workflows/ci.yml`:

```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  TOKEN_ENCRYPTION_KEY: ${{ secrets.TOKEN_ENCRYPTION_KEY }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  ZOHO_CLIENT_ID: ${{ secrets.ZOHO_CLIENT_ID }}
  ZOHO_CLIENT_SECRET: ${{ secrets.ZOHO_CLIENT_SECRET }}
```

## Environment Variables Management

### Local Development

#### 1. Create .env file

```bash
# Copy example
cp env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

#### 2. Never commit .env

Ensure `.env` is in `.gitignore`:
```bash
# Verify
grep "^\.env$" .gitignore

# If not present, add it
echo ".env" >> .gitignore
```

#### 3. Use .env.example as template

Keep `env.example` updated with all required variables (without actual values).

### Production Deployment

#### Option 1: Environment Variables (Recommended)

Set environment variables on your hosting platform:

**Vercel:**
```bash
vercel env add JWT_SECRET
vercel env add TOKEN_ENCRYPTION_KEY
# ... repeat for all secrets
```

**Heroku:**
```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set TOKEN_ENCRYPTION_KEY=your-key
# ... repeat for all secrets
```

**Render:**
- Go to Dashboard → Your Service → Environment
- Add each environment variable

**Railway:**
- Go to Project → Variables
- Add each secret

#### Option 2: Docker Secrets

For Docker deployments:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      JWT_SECRET: ${JWT_SECRET}
      TOKEN_ENCRYPTION_KEY: ${TOKEN_ENCRYPTION_KEY}
    secrets:
      - jwt_secret
      - encryption_key

secrets:
  jwt_secret:
    external: true
  encryption_key:
    external: true
```

Create secrets:
```bash
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "your-encryption-key" | docker secret create encryption_key -
```

## Secret Rotation Procedure

### When to Rotate

- Every 90 days (recommended)
- After security incident
- When team member leaves
- If secret is exposed

### Rotation Steps

#### 1. Generate New Secrets

```bash
# New JWT secret
NEW_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "New JWT Secret: $NEW_JWT_SECRET"

# New encryption key
NEW_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "New Encryption Key: $NEW_ENCRYPTION_KEY"
```

#### 2. Update GitHub Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on secret name
3. Click **Update**
4. Paste new value
5. Click **Update secret**

#### 3. Update Production Environment

Update environment variables on your hosting platform.

#### 4. Deploy

```bash
# Deploy with new secrets
git push origin main
# Or trigger deployment manually
```

#### 5. Verify

```bash
# Test health endpoint
curl https://your-domain.com/health

# Test authentication
curl -X POST https://your-domain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

#### 6. Clean Up Old Secrets

After verification:
- Remove old secrets from GitHub (optional, for audit)
- Document rotation in security log

## Environment-Specific Secrets

### Development

```bash
# .env (local)
NODE_ENV=development
JWT_SECRET=dev-jwt-secret-minimum-32-characters-long
TOKEN_ENCRYPTION_KEY=dGV2LWVuY3J5cHRpb24ta2V5LWZvci1kZXZlbG9wbWVudA==
DATABASE_URL=postgresql://localhost:5432/focusflow_dev
```

### Staging

```bash
# Staging environment variables
NODE_ENV=staging
JWT_SECRET=<staging-secret>
TOKEN_ENCRYPTION_KEY=<staging-key>
DATABASE_URL=<staging-db-url>
```

### Production

```bash
# Production environment variables (set on hosting platform)
NODE_ENV=production
JWT_SECRET=<production-secret>
TOKEN_ENCRYPTION_KEY=<production-key>
DATABASE_URL=<production-db-url>
```

## Best Practices

### 1. Never Commit Secrets

✅ **DO:**
- Use `.env.example` with placeholders
- Store secrets in GitHub Secrets
- Use environment variables

❌ **DON'T:**
- Commit `.env` files
- Hardcode secrets in code
- Share secrets in chat/email

### 2. Use Different Secrets Per Environment

- Development: `dev-*` prefix
- Staging: `staging-*` prefix
- Production: Strong, unique secrets

### 3. Limit Secret Access

- Only grant access to necessary team members
- Use GitHub environments for production secrets
- Rotate secrets when team members leave

### 4. Monitor Secret Usage

- Enable GitHub audit logs
- Monitor API key usage
- Set up alerts for unusual activity

### 5. Use Secret Scanning

Enable GitHub secret scanning:
1. Go to **Settings** → **Security**
2. Enable **Secret scanning**
3. Review alerts regularly

## Secret Reference in Code

### Server Configuration

```javascript
// server/server.config.js
const serverConfig = {
  security: {
    jwtSecret: process.env.JWT_SECRET, // ✅ From environment
    tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY, // ✅ From environment
    // ❌ Never: jwtSecret: 'hardcoded-secret'
  }
};
```

### GitHub Actions

```yaml
# .github/workflows/ci.yml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }} # ✅ From GitHub Secrets
  DATABASE_URL: ${{ secrets.DATABASE_URL }} # ✅ From GitHub Secrets
```

### Docker Compose

```yaml
# docker-compose.yml
environment:
  JWT_SECRET: ${JWT_SECRET} # ✅ From environment
  DATABASE_URL: ${DATABASE_URL} # ✅ From environment
```

## Troubleshooting

### Secret Not Found

**Error**: `JWT_SECRET is not defined`

**Solution**:
1. Check environment variable is set
2. Verify `.env` file exists (local)
3. Check GitHub Secrets (CI/CD)
4. Verify hosting platform environment variables

### Secret Too Short

**Error**: `JWT_SECRET must be at least 32 characters`

**Solution**:
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Secret Rotation Issues

**Problem**: Users can't login after rotation

**Solution**:
1. Keep old secret active during transition
2. Support both old and new secrets temporarily
3. Force re-login for all users
4. Remove old secret after transition

## Security Checklist

- [ ] All secrets stored in GitHub Secrets
- [ ] `.env` in `.gitignore`
- [ ] No secrets in code
- [ ] Different secrets per environment
- [ ] Secrets rotated regularly
- [ ] Secret scanning enabled
- [ ] Access limited to necessary team members
- [ ] Secrets documented (without values)
- [ ] Backup/recovery plan for secrets
- [ ] Audit log enabled

## Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OWASP Secret Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_cryptographic_key)
- [12-Factor App: Config](https://12factor.net/config)

---

**Remember**: Secrets are like passwords - treat them with the same care. Never commit them, rotate them regularly, and limit access.



