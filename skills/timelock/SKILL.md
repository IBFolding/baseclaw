# Timelock Integration Skill

## Overview
Delay sensitive operations by configurable time period. Prevents immediate execution of critical functions.

## Features
- **Configurable Delay** — Set delay period (e.g., 24 hours, 48 hours)
- **Queued Operations** — Show pending operations with countdown
- **Cancel Operation** — Allow cancellation before execution
- **Emergency Override** — Multi-sig can bypass timelock in emergencies

## Usage
```javascript
baseclaw.timelock.configure({
  delay: 86400, // 24 hours in seconds
  operations: ['deployMainnet', 'upgradeContract', 'transferOwnership']
})

baseclaw.timelock.schedule({
  operation: 'deployMainnet',
  contract: '0x...',
  executeAt: Date.now() + 86400000
})

baseclaw.timelock.execute({
  operationId: '...'
})
```

## Flow
1. User requests sensitive operation
2. System checks if timelock is configured
3. If yes: schedule operation for future execution
4. Show countdown timer in UI
5. Allow cancellation during delay period
6. After delay: execute automatically or allow manual execution
7. If no timelock: warn user about irreversible operation

## UI Integration
- Show countdown timer for pending operations
- Alert when operation is ready to execute
- History of executed operations with timestamps
