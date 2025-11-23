# GitHub Configuration

This directory contains GitHub configuration files for the FocusFlow project.

## Files

- **`workflows/ci.yml`** - Continuous Integration workflow
- **`pull_request_template.md`** - Pull Request template with checklist
- **`GITHUB_ACTIONS_SETUP.md`** - Setup guide for GitHub Actions secrets and variables

## Quick Start

### CI Workflow

The CI workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**What it does:**
1. ✅ Lints backend and frontend code
2. ✅ Builds frontend for production
3. ✅ Runs tests (if available)
4. ✅ Performs smoke test on `/health` endpoint
5. ✅ Caches node_modules for faster builds

### PR Template

When creating a pull request, the template will automatically appear with a checklist including:
- Code quality checks
- Testing requirements
- Documentation updates
- Security considerations
- Demo/screenshot updates

### Setup

For detailed setup instructions, see [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md).

**Note**: The CI workflow works out of the box without any additional configuration. Secrets are only needed if you add deployment steps.

## Workflow Status

View workflow runs in the **Actions** tab of your GitHub repository.

Add a status badge to your README:

```markdown
![CI](https://github.com/username/repo/workflows/CI/badge.svg)
```



