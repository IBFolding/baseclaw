# Git Integration Skill

## Overview
Auto-commit project changes to Git. Track version history, branch per feature, collaborate with team.

## Features
- **Auto-commit** — Save changes automatically
- **Version History** — View all commits with diffs
- **Branching** — Feature branches for experiments
- **Pull Requests** — Review before merging
- **Merge** — Combine branches
- **Rollback** — Revert to any commit
- **Tags** — Mark releases (v1.0, v2.0)

## Usage
```javascript
baseclaw.git.commit('Add staking pool template')
baseclaw.git.branch('feature/nft-template')
baseclaw.git.merge('feature/nft-template')
baseclaw.git.rollback('abc123')
baseclaw.git.tag('v1.0.0')
```

## UI Integration
- Commit graph visualization
- Diff viewer
- Branch selector
- Tag list

## Storage
- Git repository in project directory
- Remote: GitHub, GitLab, Bitbucket
- Sync on deploy
