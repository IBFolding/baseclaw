# Publish to NPM

## Prerequisites

1. NPM account (create at npmjs.com)
2. Logged in locally:
   ```bash
   npm login
   ```

3. Organization created: `@moltmail`
   ```bash
   npm org create moltmail
   ```

## Publish Steps

### 1. Core Skill

```bash
cd packages/moltmail-core
npm publish --access public
```

### 2. Trading Skill

```bash
cd packages/moltmail-trading
npm publish --access public
```

### Or both at once:

```bash
npm run publish:all
```

## Version Updates

1. Update version in package.json
2. Update CHANGELOG.md
3. Run publish command

## Verify Installation

```bash
npm install @moltmail/skill-core
npm install @moltmail/skill-trading
```