# Backup/Restore Skill

## Overview
Save and restore project states. Rollback to previous versions if something goes wrong.

## Features
- **Auto-save** — Save state every 5 minutes
- **Manual Snapshot** — Save current state with note
- **Restore** — Revert to previous snapshot
- **Export** — Download project as ZIP
- **Import** — Upload project ZIP
- **History** — View all saved states
- **Compare** — Diff between versions

## Usage
```javascript
baseclaw.backup.create('Before mainnet deploy')
baseclaw.backup.restore('snapshot-123')
baseclaw.backup.export()
baseclaw.backup.import(file)
```

## Storage
- localStorage for small projects
- IndexedDB for large projects
- Export to file for external backup

## UI Integration
- Backup button in project menu
- Restore dropdown with timestamps
- Auto-save indicator
