# GitHub Actions Setup Guide

This guide explains how to configure GitHub Actions secrets and environment variables for the FocusFlow CI/CD pipeline.

## Overview

The CI workflow (`.github/workflows/ci.yml`) runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

## Workflow Features

- ✅ Lint checking (backend and frontend)
- ✅ Build verification (frontend production build)
- ✅ Test execution (if tests exist)
- ✅ Smoke testing (health endpoint check)
- ✅ Node modules caching for faster builds

## Setting Up Secrets and Environment Variables

### Step 1: Access Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** (top navigation bar)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Repository Secrets

Repository secrets are encrypted and used for sensitive data that should not be exposed in logs.

**For CI/CD (Optional - only if needed for deployment):**

1. Click **New repository secret**
2. Add the following secrets if you need them for deployment:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DEPLOY_TOKEN` | Token for deployment (if using automated deployment) | `ghp_xxxxxxxxxxxx` |
| `DOCKER_HUB_TOKEN` | Docker Hub authentication token (if pushing images) | `dckr_pat_xxxxxxxxxxxx` |
| `DATABASE_URL` | Production database URL (if needed for tests) | `postgresql://user:pass@host:5432/db` |

**Note**: The current CI workflow uses test/mock values and doesn't require real secrets for basic CI operations.

### Step 3: Add Environment Variables (Optional)

Environment variables are used for non-sensitive configuration.

1. In **Secrets and variables** → **Actions**, click on **Variables** tab
2. Click **New repository variable**

**Optional Variables:**

| Variable Name | Description | Default Value |
|--------------|-------------|---------------|
| `NODE_VERSION` | Node.js version to use | `18.x` |
| `FRONTEND_BUILD_TIMEOUT` | Frontend build timeout (seconds) | `300` |
| `TEST_TIMEOUT` | Test execution timeout (seconds) | `600` |

**Note**: The workflow has sensible defaults, so these are optional.

## Workflow Configuration

### Current CI Workflow Jobs

1. **lint-and-test**
   - Installs dependencies (with caching)
   - Runs lint checks
   - Builds frontend
   - Runs tests (if available)
   - Performs smoke test on `/health` endpoint

2. **build-verification**
   - Verifies frontend production build
   - Checks build output structure

### Environment Variables Used in CI

The workflow uses these environment variables (set inline in the workflow):

```yaml
NODE_ENV: production
PORT: 4000
DATABASE_URL: postgresql://test:test@localhost:5432/test
JWT_SECRET: test-jwt-secret-for-ci-only
TOKEN_ENCRYPTION_KEY: dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItY2ktb25seQ==
FRONTEND_URL: http://localhost:3000
LOG_LEVEL: error
```

**These are test values only** - they are not used in production and are safe to expose in logs.

## Customizing the Workflow

### Adding New Secrets

If you need to add secrets for deployment or external service integration:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the secret name and value
4. Update `.github/workflows/ci.yml` to use the secret:

```yaml
env:
  MY_SECRET: ${{ secrets.MY_SECRET }}
```

### Adding Environment-Specific Variables

For different environments (staging, production):

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **Environments** (left sidebar)
3. Create new environment (e.g., "staging", "production")
4. Add environment-specific secrets/variables
5. Reference in workflow:

```yaml
jobs:
  deploy:
    environment: production
    steps:
      - name: Deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}
```

## Workflow Status

### Viewing Workflow Runs

1. Go to your repository
2. Click **Actions** tab
3. View workflow runs and their status
4. Click on a run to see detailed logs

### Workflow Badge

Add a status badge to your README:

```markdown
![CI](https://github.com/username/repo/workflows/CI/badge.svg)
```

Replace `username/repo` with your GitHub username and repository name.

## Troubleshooting

### Workflow Fails on Lint

**Issue**: Lint step fails but code is correct.

**Solution**: The workflow uses `continue-on-error: true` for lint, so it won't fail the build. To make it strict:

```yaml
- name: Run backend lint
  run: npm run lint
  # Remove: continue-on-error: true
```

### Tests Fail in CI but Pass Locally

**Issue**: Tests pass locally but fail in GitHub Actions.

**Possible Causes**:
- Missing environment variables
- Database connection issues
- Timeout issues

**Solution**: 
- Check workflow logs for specific error
- Ensure all required environment variables are set
- Increase timeout if needed:

```yaml
- name: Run tests
  timeout-minutes: 10
  run: npm test
```

### Health Check Fails

**Issue**: Smoke test fails to connect to `/health` endpoint.

**Possible Causes**:
- Server not starting properly
- Port conflicts
- Missing dependencies

**Solution**:
- Check server logs in workflow output
- Verify all dependencies are installed
- Increase wait time before health check:

```yaml
- name: Smoke test - Start backend server
  run: |
    npm start &
    sleep 15  # Increase from 10 to 15
```

### Cache Issues

**Issue**: Node modules cache not working.

**Solution**: Clear cache by updating cache key or manually:

1. Go to **Actions** → **Caches**
2. Delete old caches
3. Re-run workflow

## Best Practices

1. **Never commit secrets** - Always use GitHub Secrets
2. **Use environment-specific secrets** - Separate staging/production
3. **Review workflow logs** - Check for exposed secrets
4. **Set appropriate timeouts** - Prevent hanging workflows
5. **Use matrix builds** - Test multiple Node versions if needed
6. **Cache dependencies** - Speed up workflow runs
7. **Fail fast** - Use `continue-on-error` sparingly

## Advanced Configuration

### Matrix Builds

Test multiple Node.js versions:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

### Conditional Steps

Run steps only on specific branches:

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

### Artifact Upload

Save build artifacts:

```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: frontend-build
    path: frontend/dist
```

## Security Considerations

1. **Secrets are encrypted** - Never log secrets
2. **Use least privilege** - Only grant necessary permissions
3. **Review third-party actions** - Check for security vulnerabilities
4. **Rotate secrets regularly** - Update secrets periodically
5. **Audit workflow permissions** - Review what actions can do

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Environment Variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Note**: The current CI workflow is designed to work without any secrets for basic linting, building, and testing. Secrets are only needed if you add deployment or external service integration steps.



