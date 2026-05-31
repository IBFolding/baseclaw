# GitHub Actions Syntax Reference

## Workflow Structure

```yaml
name: Workflow Name

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:  # Manual trigger

env:
  GLOBAL_VAR: value

jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
```

## Event Triggers

### Push
```yaml
on:
  push:
    branches: [ main, develop ]
    tags: [ 'v*' ]
    paths: [ 'src/**' ]
```

### Pull Request
```yaml
on:
  pull_request:
    types: [ opened, synchronize, closed ]
    branches: [ main ]
```

### Schedule (Cron)
```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Mondays at 9am
```

## Job Configuration

### Matrix Strategy
```yaml
strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x]
    os: [ubuntu-latest, windows-latest]
    exclude:
      - node-version: 16.x
        os: windows-latest
```

### Conditional Jobs
```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [test, lint]
```

### Environment Protection
```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://example.com
```

## Actions

### Checkout
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Full history
    lfs: true       # Git LFS
```

### Setup Node.js
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    registry-url: 'https://npm.pkg.github.com'
```

### Setup Python
```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'
```

### Cache
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## Secrets and Variables

### Using Secrets
```yaml
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
  run: ./deploy.sh
```

### Repository Variables
```yaml
- name: Build
  env:
    VERSION: ${{ vars.VERSION }}
  run: echo $VERSION
```

## Contexts

### github Context
```yaml
${{ github.repository }}
${{ github.ref }}
${{ github.sha }}
${{ github.actor }}
${{ github.event_name }}
```

### env Context
```yaml
${{ env.MY_VAR }}
```

### job Context
```yaml
${{ job.status }}
```

### steps Context
```yaml
${{ steps.step-id.outputs.output-name }}
```

## Artifacts

### Upload
```yaml
- uses: actions/upload-artifact@v4
  with:
    name: my-artifact
    path: |
      dist/
      !dist/**/*.map
    retention-days: 30
```

### Download
```yaml
- uses: actions/download-artifact@v4
  with:
    name: my-artifact
    path: dist/
```

## Reusable Workflows

### Calling
```yaml
jobs:
  call-workflow:
    uses: owner/repo/.github/workflows/reusable.yml@main
    with:
      input1: value1
    secrets:
      secret1: ${{ secrets.SECRET1 }}
```

### Definition
```yaml
on:
  workflow_call:
    inputs:
      input1:
        required: true
        type: string
    secrets:
      secret1:
        required: true

jobs:
  # ...
```

## Expressions

### Conditionals
```yaml
if: github.event_name == 'pull_request'
if: contains(github.ref, 'feature')
if: startsWith(github.ref, 'refs/tags/v')
if: endsWith(github.ref, '-release')
```

### Functions
```yaml
${{ format('Hello {0}', github.actor) }}
${{ join(github.event.*.body, '') }}
${{ toJson(github) }}
${{ fromJson(steps.get-data.outputs.result) }}
```
