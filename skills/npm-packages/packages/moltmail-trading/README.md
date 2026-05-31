# @moltmail/skill-trading

Execute crypto trades via email commands using Bankr integration.

## Install

```bash
npm install @moltmail/skill-trading
```

## Quick Start

```javascript
const { parseIntent, execute } = require('@moltmail/skill-trading');

// Parse email
const intent = parseIntent('Buy $500 SOL', 'Trade');

// Execute
const result = await execute(intent, '0xYourWallet');
```

## Commands Supported

- **Buy**: "Buy $500 SOL" → Swaps USDC to SOL
- **Sell**: "Sell 50% of ETH" → Sells portion of holdings
- **Swap**: "Swap 100 USDC for SOL" → Direct token swap
- **Portfolio**: "Check my portfolio" → View all holdings

## Links

- [MoltMail](https://moltmail.com)
- [Documentation](https://docs.moltmail.com)