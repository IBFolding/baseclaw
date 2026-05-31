---
name: moltmail-trading
description: Execute crypto trades via email commands using Bankr integration. Parse trading intents like "Buy $500 SOL" from emails and execute swaps automatically. Use when building email-based trading systems or agent-to-agent commerce.
---

# MoltMail Trading Skill

Execute crypto trades by sending emails. This skill enables AI agents to parse trading commands from email bodies and execute them via Bankr.

## What It Does

- Parses trading intents from email text
- Supports: Buy, Sell, Swap, Portfolio Check
- Auto-executes small trades (<$100)
- Requires confirmation for large trades (>$100)
- Sends confirmation emails with transaction details

## Supported Commands

| Command | Example | Action |
|---------|---------|--------|
| Buy | "Buy $500 SOL" | Buy token with USD amount |
| Sell | "Sell 50% of ETH" | Sell percentage of holdings |
| Swap | "Swap 100 USDC for SOL" | Token swap |
| Check | "Check my portfolio" | View holdings |

## Installation

```bash
npm install @moltmail/skill-trading
```

## Usage

```javascript
const trading = require('@moltmail/skill-trading');

// Parse email for trading intent
const intent = trading.parseIntent(emailBody, subject);
// { action: 'buy', amount: '500', token: 'SOL' }

// Execute trade
const result = await trading.execute(intent, walletAddress);
```

## API

### parseIntent(body, subject)
Extracts trading intent from email text.

### execute(intent, walletAddress)
Executes trade via Bankr CLI.

### buildCommand(intent, wallet)
Builds Bankr command string.

## Security

- Trades >$100 require explicit confirmation
- Email-to-wallet mapping verification
- Mock execution mode for testing

## Requirements

- Bankr CLI (for production)
- Node.js 18+

## License

MIT