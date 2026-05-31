# Team Workspace Skill

## Overview
Collaborate with your team on BaseClaw projects. Shared templates, multi-sig deployments, and role-based access.

## Features
- **Team Projects** — Shared project workspace
- **Role Management** — Admin, Editor, Viewer roles
- **Shared Templates** — Team template library
- **Multi-Sig Deploy** — Require team approval for mainnet
- **Activity Feed** — See what team members are doing
- **Comments** — Discuss contracts and deployments
- **Notifications** — Slack/Discord/email alerts

## Roles
- **Admin** — Full access, can delete projects, manage team
- **Editor** — Can deploy to testnet, edit code, generate webpages
- **Viewer** — Read-only, can comment and suggest
- **Deployer** — Special role for mainnet deployment (multi-sig)

## Usage
```javascript
baseclaw.team.create({
  name: 'My DeFi Team',
  members: [
    { email: 'alice@example.com', role: 'admin' },
    { email: 'bob@example.com', role: 'editor' },
    { email: 'charlie@example.com', role: 'viewer' }
  ]
})

baseclaw.team.invite('david@example.com', 'editor')
baseclaw.team.setDeployRule({
  requireApproval: true,
  minApprovers: 2,
  approvers: ['alice', 'bob']
})
```

## Shared Resources
- **Templates** — Team template library
- **Components** — Shared UI components
- **Contracts** — Reusable contract modules
- **Docs** — Team documentation
- **API Keys** — Shared API keys (encrypted)

## Activity Feed
```
[2:30 PM] Alice deployed MyToken to Sepolia
[2:45 PM] Bob audited the contract (Score: 95)
[3:00 PM] Alice requested mainnet deployment
[3:15 PM] Bob approved mainnet deployment
[3:20 PM] Charlie approved mainnet deployment
[3:25 PM] MyToken deployed to Base Mainnet!
```

## Notifications
- **Slack** — Webhook integration
- **Discord** — Bot notifications
- **Email** — Digest or instant
- **In-app** — Real-time notifications

## Pricing
- Free: 3 team members
- Pro: 10 members ($20/month)
- Enterprise: Unlimited ($100/month)

## Security
- Encrypted API keys
- Audit logs
- 2FA required for admins
- IP allowlisting (enterprise)
