# Collaboration Skill

## Overview
Share projects with team members, add comments, and get approvals before deployment.

## Features
- **Share Project** — Invite by email or link
- **Role Management** — Viewer, Editor, Admin roles
- **Comments** — Comment on specific sections
- **Approvals** — Request approval before mainnet deploy
- **Activity Log** — Track all changes
- **Notifications** — Email/Discord alerts
- **Real-time** — See others' cursors and edits

## Usage
```javascript
baseclaw.collab.share({
  email: 'teammate@example.com',
  role: 'editor'
})

baseclaw.collab.comment({
  section: 'hero',
  text: 'Change the headline to be more catchy'
})

baseclaw.collab.requestApproval({
  type: 'mainnet-deploy',
  reason: 'Ready for production'
})
```

## Roles
- **Viewer** — View only, can comment
- **Editor** — Can edit content, deploy to testnet
- **Admin** — Full access, can deploy to mainnet

## Notifications
- Email on comments
- Discord webhook on deployments
- Browser notifications for approvals
