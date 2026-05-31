# Notification System Skill

## Overview
Send alerts when contracts deploy, need approval, or have issues.

## Channels
- **Email** — SMTP or SendGrid
- **Discord** — Webhook notifications
- **Slack** — Incoming webhooks
- **Telegram** — Bot messages
- **Browser** — Push notifications
- **SMS** — Twilio integration

## Events
- **Contract Deployed** — Success/failure alerts
- **Approval Needed** — Multi-sig approval requests
- **Timelock Expired** — Operation ready to execute
- **Security Alert** — Vulnerability detected
- **Performance** — High gas, slow transactions
- **Analytics** — Milestone reached (1000 visitors)

## Usage
```javascript
baseclaw.notify.configure({
  discord: 'https://discord.com/api/webhooks/...',
  email: 'team@example.com'
})

baseclaw.notify.send({
  event: 'contractDeployed',
  message: 'Token deployed to mainnet: 0x...'
})
```

## Templates
- Deployment success
- Deployment failure
- Approval request
- Security warning
- Weekly summary
