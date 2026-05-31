---
name: bankr
description: AI-powered trading on Base, Ethereum, Polygon, Unichain, and Solana via Bankr. Use for trading tokens, checking prices, managing portfolio, setting automations, and market research. Triggers on "trade", "buy", "sell", "price", "portfolio", "balance", "wallet", "stop loss", or any crypto trading query.
metadata:
  version: "1.0.0"
  clawdbot:
    emoji: "🏦"
---

# Bankr Skill 🏦

AI-powered trading and portfolio management across multiple chains via the Bankr API.

## Overview

Bankr is an AI-powered trading service that allows natural language trading commands. This skill provides a wrapper around the Bankr API to enable:

- **Trading**: Buy/sell tokens with natural language
- **Portfolio**: Check balances and positions
- **Research**: Query prices, market data, and token analysis
- **Automations**: DCA, limit orders, stop-losses
- **Wallet**: Manage your custodial wallets across chains

## Supported Chains

| Chain | Native Token | Notes |
|-------|--------------|-------|
| Base | ETH | Primary chain for trading |
| Ethereum | ETH | Mainnet trading |
| Polygon | POL | Layer 2 scaling |
| Unichain | ETH | Uniswap's L2 |
| Solana | SOL | SVM-based chain |

## Prerequisites

1. **Bankr Account**: Sign up at [bankr.bot/api](https://bankr.bot/api)
2. **API Key**: Generate an API key with Agent API access enabled
3. **Funds**: Deposit ETH/tokens to your Bankr wallet for trading

## Configuration

Copy the template and add your API key:

```bash
cp config.json.template config.json
# Edit config.json with your API key
```

**config.json:**
```json
{
  "api_key": "your_bankr_api_key_here",
  "base_url": "https://api.bankr.bot",
  "default_chain": "base"
}
```

⚠️ **Security Warning**: Never share your API key. Keep it in config.json (which is gitignored).

## Quick Start

```bash
# Check your wallet address
./scripts/bankr.sh "What is my wallet address?"

# Check portfolio
./scripts/bankr.sh "Show my portfolio on Base"

# Get token price
./scripts/bankr.sh "What is the price of ETH?"

# Buy tokens
./scripts/bankr.sh "Buy $10 of USDC on Base"

# Sell tokens
./scripts/bankr.sh "Sell $5 of ETH on Base"
```

## Core Commands

### Wallet & Account

```bash
# Get wallet addresses
./scripts/bankr.sh "What is my wallet address?"
./scripts/bankr.sh "Show my wallets"

# Get account info
./scripts/bankr.sh "What is my account info?"
```

### Portfolio

```bash
# Check balances
./scripts/bankr.sh "What are my balances?"
./scripts/bankr.sh "Show my portfolio on Base"
./scripts/bankr.sh "How much ETH do I have?"
```

### Trading

```bash
# Buy tokens
./scripts/bankr.sh "Buy $25 of TOKEN on Base"
./scripts/bankr.sh "Swap $10 ETH to USDC on base"

# Sell tokens
./scripts/bankr.sh "Sell $15 of TOKEN on Base"
./scripts/bankr.sh "Sell 50% of my TOKEN"

# Token swaps
./scripts/bankr.sh "Swap $50 USDC to ETH on base"
```

### Prices & Market Data

```bash
# Check prices
./scripts/bankr.sh "What is the price of ETH?"
./scripts/bankr.sh "Current price of TOKEN on Base"

# Market data
./scripts/bankr.sh "Show me TOKEN market data"
./scripts/bankr.sh "What's the market cap of TOKEN?"
```

### Research

```bash
# Technical analysis
./scripts/bankr.sh "Do technical analysis on TOKEN"
./scripts/bankr.sh "Show RSI for TOKEN"
./scripts/bankr.sh "Is TOKEN overbought?"

# Trending tokens
./scripts/bankr.sh "What tokens are trending on Base?"
./scripts/bankr.sh "Show top gainers today on Base"

# Compare tokens
./scripts/bankr.sh "Compare TOKEN1 vs TOKEN2"
```

### Automations

```bash
# Stop losses
./scripts/bankr.sh "Set stop loss for TOKEN at -15%"
./scripts/bankr.sh "Remove stop loss for TOKEN"

# Dollar Cost Averaging (DCA)
./scripts/bankr.sh "DCA $20 into ETH every week on Base"
./scripts/bankr.sh "Cancel my ETH DCA"

# Limit orders
./scripts/bankr.sh "Buy $30 of TOKEN if price drops to $0.50"
```

## API Reference

### Base URL
```
https://api.bankr.bot
```

### Authentication
All requests require the `X-API-Key` header with your API key.

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agent/prompt` | POST | Submit natural language commands |
| `/agent/job/{id}` | GET | Check job status |
| `/agent/job/{id}/cancel` | POST | Cancel a pending job |
| `/agent/user` | GET | Get account info & wallets |

### Job Flow

1. **Submit Prompt** → Returns `jobId`
2. **Poll Job Status** → Check until `status: "completed"`
3. **Get Response** → Extract response from completed job

See [references/api-details.md](references/api-details.md) for full API documentation.

## Script Usage

```bash
./scripts/bankr.sh [OPTIONS] "prompt"

Options:
  -c, --chain <chain>    Specify chain (base, ethereum, polygon, solana)
  -w, --wait             Wait for job completion (default: true)
  -t, --timeout <secs>   Timeout for job polling (default: 120)
  -j, --json             Output raw JSON response
  -h, --help             Show help

Examples:
  ./scripts/bankr.sh "Buy $10 of ETH"
  ./scripts/bankr.sh -c solana "Buy $5 of BONK"
  ./scripts/bankr.sh -j "What is my wallet address?"
```

## Response Format

### Text Response (Default)
```
ETH is currently trading at $3,245.67
```

### JSON Response (`-j` flag)
```json
{
  "success": true,
  "jobId": "abc123",
  "status": "completed",
  "prompt": "What is the price of ETH?",
  "response": "ETH is currently trading at $3,245.67",
  "richData": [...]
}
```

## Error Handling

The script handles common errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid API key | Check config.json |
| `403 Forbidden` | Agent access not enabled | Enable at bankr.bot/api |
| `400 Bad Request` | Invalid prompt | Check prompt format |
| Job timeout | Processing taking too long | Check job ID manually |

## Safety & Risk Management

⚠️ **Trading is risky. Never trade more than you can afford to lose.**

### Best Practices

1. **Start Small**: Test with small amounts first
2. **Verify Contracts**: Always check token contracts on Basescan/Etherscan
3. **Check Liquidity**: Ensure adequate liquidity before trading
4. **Set Stop Losses**: Protect against significant downside
5. **Use Testnet**: Practice with test tokens when possible

### Emergency Procedures

If you suspect your API key is compromised:

1. Revoke the key immediately at [bankr.bot/api](https://bankr.bot/api)
2. Generate a new key
3. Update your config.json

## Files

```
bankr/
├── SKILL.md                    # This file
├── config.json.template        # API key template
├── config.json                 # Your API key (gitignored)
├── scripts/
│   └── bankr.sh               # Main wrapper script
└── references/
    ├── api-details.md         # Full API documentation
    ├── trading-commands.md    # Common trading commands
    ├── price-commands.md      # Price and market commands
    └── research-commands.md   # Research and analysis commands
```

## See Also

- [Base Trader Skill](../base-trader/SKILL.md) - Autonomous trading strategies using Bankr
- [Bankr Documentation](https://docs.bankr.bot)
- [Bankr API Dashboard](https://bankr.bot/api)

## License

MIT - See base-trader skill for full trading philosophy and risk management strategies.

---

*Built for OpenClaw agents. Trade responsibly.*
