# Trading Commands Reference

Common trading commands for the Bankr API.

## Buy Commands

### Basic Buy
```bash
./scripts/bankr.sh "Buy $10 of ETH"
./scripts/bankr.sh "Buy $25 of TOKEN on Base"
./scripts/bankr.sh "Buy 0.5 ETH worth of USDC"
```

### Buy on Specific Chain
```bash
./scripts/bankr.sh "Buy $5 of BONK on solana"
./scripts/bankr.sh "Buy $20 of MATIC on polygon"
./scripts/bankr.sh "Buy $100 of ETH on ethereum"
```

### Buy with Slippage (if supported)
```bash
./scripts/bankr.sh "Buy $10 of TOKEN with 1% slippage"
```

## Sell Commands

### Basic Sell
```bash
./scripts/bankr.sh "Sell $10 of ETH"
./scripts/bankr.sh "Sell $25 of TOKEN on Base"
```

### Sell by Percentage
```bash
./scripts/bankr.sh "Sell 50% of my TOKEN"
./scripts/bankr.sh "Sell 100% of my ETH"
./scripts/bankr.sh "Sell all of my TOKEN"
```

### Sell on Specific Chain
```bash
./scripts/bankr.sh "Sell $5 of BONK on solana"
./scripts/bankr.sh "Sell $20 of MATIC on polygon"
```

## Swap Commands

### Direct Swaps
```bash
./scripts/bankr.sh "Swap $10 ETH to USDC on base"
./scripts/bankr.sh "Swap 100 USDC to ETH on polygon"
./scripts/bankr.sh "Swap $50 TOKEN1 to TOKEN2 on base"
```

### With Amount Specified
```bash
./scripts/bankr.sh "Swap 0.1 ETH to USDC"
./scripts/bankr.sh "Swap all my USDC to ETH"
```

## Portfolio Commands

### Check Balances
```bash
./scripts/bankr.sh "What are my balances?"
./scripts/bankr.sh "Show my portfolio on Base"
./scripts/bankr.sh "How much ETH do I have?"
./scripts/bankr.sh "Show my complete portfolio"
```

### Check Specific Token Balance
```bash
./scripts/bankr.sh "How much USDC do I have?"
./scripts/bankr.sh "What is my TOKEN balance?"
```

## Stop Loss Commands

### Set Stop Loss
```bash
./scripts/bankr.sh "Set stop loss for TOKEN at -15%"
./scripts/bankr.sh "Set stop loss for ETH at $3000"
./scripts/bankr.sh "Set trailing stop loss for TOKEN at 10%"
```

### Remove Stop Loss
```bash
./scripts/bankr.sh "Remove stop loss for TOKEN"
./scripts/bankr.sh "Cancel stop loss on ETH"
```

### Check Stop Losses
```bash
./scripts/bankr.sh "Show my stop losses"
./scripts/bankr.sh "What stop losses do I have?"
```

## Dollar Cost Averaging (DCA)

### Setup DCA
```bash
./scripts/bankr.sh "DCA $20 into ETH every week on Base"
./scripts/bankr.sh "DCA $10 into USDC every day on base"
./scripts/bankr.sh "DCA $100 into BTC every month"
```

### Cancel DCA
```bash
./scripts/bankr.sh "Cancel my ETH DCA"
./scripts/bankr.sh "Stop DCA for USDC"
```

### Check DCA Orders
```bash
./scripts/bankr.sh "Show my DCA orders"
./scripts/bankr.sh "What DCA automations do I have?"
```

## Limit Orders

### Buy Limit Orders
```bash
./scripts/bankr.sh "Buy $30 of TOKEN if price drops to $0.50"
./scripts/bankr.sh "Buy $100 ETH if it hits $3000"
```

### Sell Limit Orders
```bash
./scripts/bankr.sh "Sell $50 of TOKEN if price reaches $1.00"
./scripts/bankr.sh "Sell all my ETH if it hits $5000"
```

### Cancel Limit Orders
```bash
./scripts/bankr.sh "Cancel limit order for TOKEN"
./scripts/bankr.sh "Show my limit orders"
```

## Wallet Commands

### Get Wallet Address
```bash
./scripts/bankr.sh "What is my wallet address?"
./scripts/bankr.sh "Show my wallets"
./scripts/bankr.sh "What is my Base address?"
./scripts/bankr.sh "What is my Solana address?"
```

### Account Info
```bash
./scripts/bankr.sh "What is my account info?"
./scripts/bankr.sh "Show my Bankr Club status"
```

## Advanced Trading

### Leverage Trading (if supported)
```bash
./scripts/bankr.sh "Long ETH with 2x leverage $100"
./scripts/bankr.sh "Short BTC with 3x leverage $50"
```

### Token Launch
```bash
./scripts/bankr.sh "Deploy a token called MyToken with symbol MTK on base"
```

## Pre-Trade Checklist

Before executing trades, consider running:

```bash
# 1. Check your balance
./scripts/bankr.sh "What are my balances?"

# 2. Check token price
./scripts/bankr.sh "What is the price of TOKEN?"

# 3. Check market conditions
./scripts/bankr.sh "Do technical analysis on TOKEN"

# 4. Verify liquidity (if applicable)
./scripts/bankr.sh "What is the liquidity for TOKEN on Base?"
```

## Risk Management Reminders

Always remember:

- **Never trade more than you can afford to lose**
- **Set stop losses** on all positions
- **Start with small amounts** when testing
- **Verify contracts** before trading new tokens
- **Check liquidity** before entering positions

## Command Quick Reference

| Command | Example |
|---------|---------|
| Buy | `Buy $10 of ETH on Base` |
| Sell | `Sell $10 of ETH` |
| Sell % | `Sell 50% of my TOKEN` |
| Swap | `Swap $10 ETH to USDC` |
| Portfolio | `Show my portfolio on Base` |
| Stop Loss | `Set stop loss for TOKEN at -15%` |
| DCA | `DCA $20 into ETH every week` |
| Limit Buy | `Buy $30 of TOKEN if price drops to $0.50` |
| Limit Sell | `Sell $50 of TOKEN if price reaches $1.00` |
| Wallet | `What is my wallet address?` |
