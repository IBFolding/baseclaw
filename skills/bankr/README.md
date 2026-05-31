# Bankr Skill for OpenClaw

AI-powered trading and portfolio management across Base, Ethereum, Polygon, Unichain, and Solana.

## Quick Start

1. **Copy config template and add your API key:**
   ```bash
   cp config.json.template config.json
   # Edit config.json with your API key from bankr.bot/api
   ```

2. **Test the connection:**
   ```bash
   ./scripts/bankr.sh "What is my wallet address?"
   ```

3. **Start trading:**
   ```bash
   ./scripts/bankr.sh "Buy $10 of ETH on Base"
   ```

## Supported Features

| Feature | Description |
|---------|-------------|
| 💼 **Wallet** | Get wallet addresses across chains |
| 📊 **Portfolio** | Check balances and positions |
| 🔄 **Trading** | Buy, sell, swap tokens |
| 📈 **Prices** | Real-time price data |
| 🔍 **Research** | Token analysis and research |
| 🛑 **Stop Loss** | Automated stop-loss orders |
| 📅 **DCA** | Dollar-cost averaging |
| 🎯 **Limit Orders** | Set buy/sell targets |

## Supported Chains

- **Base** (primary) - ETH
- **Ethereum** - ETH
- **Polygon** - POL
- **Unichain** - ETH
- **Solana** - SOL

## Usage Examples

```bash
# Portfolio
./scripts/bankr.sh "Show my portfolio on Base"

# Trading
./scripts/bankr.sh "Buy $25 of TOKEN on Base"
./scripts/bankr.sh "Sell 50% of my ETH"

# Prices
./scripts/bankr.sh "What is the price of ETH?"

# Research
./scripts/bankr.sh "Do technical analysis on TOKEN"

# Automations
./scripts/bankr.sh "Set stop loss for TOKEN at -15%"
./scripts/bankr.sh "DCA $20 into ETH every week"
```

## Documentation

- [SKILL.md](SKILL.md) - Full skill documentation
- [references/api-details.md](references/api-details.md) - API reference
- [references/trading-commands.md](references/trading-commands.md) - Trading commands
- [references/price-commands.md](references/price-commands.md) - Price commands
- [references/research-commands.md](references/research-commands.md) - Research commands

## Prerequisites

- Bankr account at [bankr.bot/api](https://bankr.bot/api)
- API key with Agent API access enabled
- ETH/tokens for trading

## Security

⚠️ **Never share your API key.** Keep it in `config.json` (gitignored by default).

If your key is compromised:
1. Revoke immediately at bankr.bot/api
2. Generate a new key
3. Update config.json

## Script Options

```bash
./scripts/bankr.sh [OPTIONS] "prompt"

Options:
  -c, --chain <chain>    Specify chain (base, ethereum, polygon, solana)
  -t, --timeout <secs>   Timeout for job polling (default: 120)
  -j, --json             Output raw JSON response
  -v, --verbose          Verbose output
  -h, --help             Show help
```

## See Also

- [base-trader](../base-trader/) - Autonomous trading strategies using this skill
- [Bankr Docs](https://docs.bankr.bot)

## License

MIT
