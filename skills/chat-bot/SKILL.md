# Discord/Telegram Bot Skill

## Overview
Manage your BaseClaw contracts from Discord or Telegram. Deploy, check status, get alerts - all from chat.

## Features
- **Deploy Commands** — `/deploy token` from Discord
- **Status Checks** — `/status` shows all contracts
- **Alerts** — Get notified on events
- **Multi-Sig** — Approve transactions from chat
- **Analytics** — `/stats` shows key metrics

## Discord Commands
```
/deploy token <name> <symbol> <supply>
/deploy nft <name> <maxSupply> <price>
/status <contract-address>
/audit <contract-address>
/verify <contract-address>
/webpage <project-name>
/stats <contract-address>
/alert <contract-address> <event>
```

## Telegram Commands
```
/deploy token ...
/status ...
/audit ...
```

## Setup
1. Create Discord bot at https://discord.com/developers
2. Add bot token to BaseClaw settings
3. Invite bot to your server
4. Start using commands

## Alerts
- Contract deployed
- Large transfer
- Security issue detected
- Upgrade ready
- Low gas prices

## Usage
```javascript
baseclaw.bot.discord.configure({
  token: '...',
  guildId: '...',
  channelId: '...'
})

baseclaw.bot.telegram.configure({
  token: '...',
  chatId: '...'
})
```
