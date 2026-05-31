# CI/CD Security Best Practices

## Secrets Management

### ✅ DO
- Store secrets in GitHub Secrets (Settings → Secrets → Actions)
- Use environment-level secrets for production
- Rotate secrets regularly
- Audit secret access logs
- Use short-lived credentials where possible

### ❌ DON'T
- Never commit secrets to git
- Don't log secrets in workflow outputs
- Don't share secrets between untrusted forks

### Masking Secrets
```yaml
- run: echo "::add-mask::$MY_SECRET"
- run: echo $MY_SECRET  # This will be masked in logs
```

## Dependency Security

### Pin Action Versions
```yaml
# ✅ Good - Pinned to specific version
- uses: actions/checkout@v4.1.1

# ❌ Risky - Uses latest
- uses: actions/checkout@main

# ✅ Better - Pinned to commit SHA
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11
```

### Dependency Scanning
```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## Workflow Permissions

### Minimal Permissions
```yaml
permissions:
  contents: read      # Only read repository content
  issues: write       # Only write to issues
```

### Read-Only Default
```yaml
permissions: read-all

jobs:
  deploy:
    permissions:
      contents: write  # Override for specific job
```

## Code Injection Prevention

### Dangerous (user-controlled input)
```yaml
# ❌ DON'T - Can inject commands
- run: echo "${{ github.event.head_commit.message }}"
```

### Safe
```yaml
# ✅ DO - Use environment variables
env:
  COMMIT_MESSAGE: ${{ github.event.head_commit.message }}
run: echo "$COMMIT_MESSAGE"
```

## PR Security

### Fork Protection
```yaml
on:
  pull_request_target:  # Has write access, be careful!
    
jobs:
  build:
    # Only run if PR is not from a fork, or for trusted users
    if: github.event.pull_request.head.repo.full_name == github.repository
```

### Require Reviews for Sensitive Workflows
```yaml
environment: production  # Requires approval before running
```

## Container Security

### Non-Root User
```dockerfile
# ✅ Run as non-root
RUN useradd -m -u 1000 appuser
USER appuser
```

### Scan Images
```yaml
- name: Scan image
  uses: anchore/scan-action@v3
  with:
    image: "my-image:latest"
```

## OIDC Authentication

### AWS with OIDC (No long-term credentials)
```yaml
permissions:
  id-token: write
  contents: read

steps:
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::ACCOUNT:role/ROLE
    aws-region: us-east-1
```

## Audit and Monitoring

### Security Scanning Workflow
```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: javascript
    
    - name: Autobuild
      uses: github/codeql-action/autobuild@v2
    
    - name: Analyze
      uses: github/codeql-action/analyze@v2
```

## Incident Response

### Revoke Compromised Secrets
1. Immediately revoke in GitHub Settings
2. Rotate the actual secret value in the service
3. Add new secret value to GitHub
4. Audit workflow runs for unauthorized access

### Audit Log
Check Settings → Audit log for:
- Secret access patterns
- Workflow dispatches
- Environment approvals
