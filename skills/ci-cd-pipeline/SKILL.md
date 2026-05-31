# ci-cd-pipeline Skill

GitHub Actions workflow automation for seamless CI/CD pipelines.

## Overview

This skill provides tools for:
- Auto-deploy on push to main branch
- Run tests on Pull Requests
- Environment management (dev/staging/prod)
- Templates for common workflows

## Quick Start

### 1. Generate a Workflow

```bash
# Generate a Node.js CI workflow
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/generate-workflow.sh nodejs

# Generate a Python CI workflow
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/generate-workflow.sh python

# Generate a Docker deployment workflow
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/generate-workflow.sh docker
```

### 2. Deploy to Environments

```bash
# Deploy to development
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/deploy.sh dev

# Deploy to staging
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/deploy.sh staging

# Deploy to production (requires confirmation)
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/deploy.sh prod
```

### 3. Run Tests on PR

```bash
# Trigger PR test suite
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/pr-test.sh <pr-number>
```

## Scripts

| Script | Purpose |
|--------|---------|
| `generate-workflow.sh` | Generate GitHub Actions workflow files |
| `deploy.sh` | Deploy to specific environments |
| `pr-test.sh` | Run tests on pull requests |
| `env-manager.sh` | Manage environment variables and secrets |
| `status-check.sh` | Check CI/CD pipeline status |

## Environment Management

### Environment Variables

Set environment-specific variables:

```bash
# Set dev environment variables
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/env-manager.sh set dev DB_HOST localhost

# Set staging secrets
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/env-manager.sh set-secret staging API_KEY

# List all environments
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/env-manager.sh list
```

### Workflow Templates

Available templates:
- **nodejs** - Node.js app with npm/yarn, testing, and deployment
- **python** - Python app with pip, pytest, and deployment
- **docker** - Docker build, push, and deploy
- **terraform** - Infrastructure as Code deployment
- **static-site** - Static site deployment (GitHub Pages, S3, etc.)

## Advanced Usage

### Custom Workflow Generation

```bash
# Generate workflow with custom triggers
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/generate-workflow.sh nodejs \
  --branches "main develop" \
  --node-version "18.x" \
  --test-command "npm run test:ci"
```

### Pipeline Status Monitoring

```bash
# Watch pipeline status
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/status-check.sh --watch

# Get recent failures
~/.openclaw/workspace/skills/ci-cd-pipeline/scripts/status-check.sh --failed
```

## Integration with Other Skills

- **test-automation**: Automatically runs test suites in CI
- **database-manager**: Handles database migrations during deployment
- **email-automation**: Sends notifications on deployment status

## Configuration

Create `.openclaw/cicd-config.yml` in your project root:

```yaml
project:
  name: my-app
  type: nodejs
  
environments:
  dev:
    url: https://dev.example.com
    auto_deploy: true
  staging:
    url: https://staging.example.com
    auto_deploy: true
  prod:
    url: https://example.com
    auto_deploy: false
    require_approval: true
```

## References

- `references/github-actions-syntax.md` - GitHub Actions YAML reference
- `references/workflow-examples.md` - Common workflow patterns
- `references/security-best-practices.md` - CI/CD security guidelines
