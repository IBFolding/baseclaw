# Multi-Sig Support Skill

## Overview
Require multiple approvals for sensitive operations like mainnet deployment.

## Features
- **Approval Threshold** — Set required number of approvals (e.g., 2 of 3)
- **Approver List** — Designate multiple approvers
- **Pending Operations** — Queue operations awaiting approval
- **Approval History** — Track who approved what

## Usage
```javascript
baseclaw.multisig.configure({
  threshold: 2,
  approvers: ['0x...', '0x...', '0x...']
})

baseclaw.multisig.request({
  operation: 'deployMainnet',
  contract: '0x...',
  reason: 'Production deployment'
})

baseclaw.multisig.approve({
  operationId: '...'
})
```

## Flow
1. User requests mainnet deployment
2. System checks if multi-sig is configured
3. If yes: create pending operation, notify approvers
4. Approvers review and approve/reject
5. Once threshold reached: execute operation
6. If no multi-sig: warn user and require explicit confirmation

## UI Integration
- Show pending approvals in dashboard
- Email/notify approvers
- Show approval status in project view
