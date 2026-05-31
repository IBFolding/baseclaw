# Price & Market Commands Reference

Commands for querying prices, market data, and token information.

## Price Commands

### Current Price
```bash
./scripts/bankr.sh "What is the price of ETH?"
./scripts/bankr.sh "Current price of TOKEN on Base"
./scripts/bankr.sh "How much is BTC worth?"
./scripts/bankr.sh "Price of SOL"
```

### Price in Different Currencies
```bash
./scripts/bankr.sh "What is the price of ETH in USD?"
./scripts/bankr.sh "How much is TOKEN in ETH?"
./scripts/bankr.sh "Price of BTC in USDC"
```

### Price Change
```bash
./scripts/bankr.sh "What is the 24h change for ETH?"
./scripts/bankr.sh "Show 7d price change for TOKEN"
./scripts/bankr.sh "How much has BTC changed today?"
```

## Market Data Commands

### Market Cap
```bash
./scripts/bankr.sh "What is the market cap of ETH?"
./scripts/bankr.sh "Market cap of TOKEN on Base"
./scripts/bankr.sh "Fully diluted valuation of TOKEN"
```

### Trading Volume
```bash
./scripts/bankr.sh "What is the trading volume for ETH?"
./scripts/bankr.sh "24h volume for TOKEN"
./scripts/bankr.sh "Show volume for BTC"
```

### Supply Information
```bash
./scripts/bankr.sh "What is the circulating supply of ETH?"
./scripts/bankr.sh "Total supply of TOKEN"
./scripts/bankr.sh "Max supply of BTC"
```

### Holders
```bash
./scripts/bankr.sh "How many holders does TOKEN have?"
./scripts/bankr.sh "Show holder count for TOKEN"
```

### Liquidity
```bash
./scripts/bankr.sh "What is the liquidity for TOKEN on Base?"
./scripts/bankr.sh "Show liquidity pools for ETH-USDC"
```

## Trending & Discovery

### Trending Tokens
```bash
./scripts/bankr.sh "What tokens are trending on Base?"
./scripts/bankr.sh "Show trending tokens on Solana"
./scripts/bankr.sh "Top trending crypto today"
```

### Top Gainers
```bash
./scripts/bankr.sh "Show top gainers today on Base"
./scripts/bankr.sh "What are the biggest gainers this week?"
./scripts/bankr.sh "Top gainers on Solana"
```

### Top Losers
```bash
./scripts/bankr.sh "Show top losers today on Base"
./scripts/bankr.sh "What are the biggest losers this week?"
```

### New Tokens
```bash
./scripts/bankr.sh "Show new tokens on Base"
./scripts/bankr.sh "What new tokens launched today?"
./scripts/bankr.sh "Latest token launches on Solana"
```

## Technical Analysis Commands

### Basic Technical Analysis
```bash
./scripts/bankr.sh "Do technical analysis on ETH"
./scripts/bankr.sh "Technical analysis for TOKEN"
./scripts/bankr.sh "TA for BTC"
```

### RSI (Relative Strength Index)
```bash
./scripts/bankr.sh "Show RSI for ETH"
./scripts/bankr.sh "What is the RSI for TOKEN?"
./scripts/bankr.sh "Is BTC overbought?"
./scripts/bankr.sh "Is TOKEN oversold?"
```

**RSI Interpretation:**
- RSI < 30: Oversold (potential buy signal)
- RSI 30-70: Neutral
- RSI > 70: Overbought (potential sell signal)

### Moving Averages
```bash
./scripts/bankr.sh "Show moving averages for ETH"
./scripts/bankr.sh "What is the 50-day MA for TOKEN?"
./scripts/bankr.sh "Show 200-day moving average for BTC"
```

### Support & Resistance
```bash
./scripts/bankr.sh "Show support and resistance levels for ETH"
./scripts/bankr.sh "What are the support levels for TOKEN?"
```

### MACD
```bash
./scripts/bankr.sh "Show MACD for ETH"
./scripts/bankr.sh "MACD analysis for TOKEN"
```

### Volume Analysis
```bash
./scripts/bankr.sh "Analyze volume for ETH"
./scripts/bankr.sh "Show volume trends for TOKEN"
```

## Historical Data

### Price History
```bash
./scripts/bankr.sh "Show price history for ETH"
./scripts/bankr.sh "Historical prices for TOKEN"
./scripts/bankr.sh "ETH all-time high"
./scripts/bankr.sh "TOKEN all-time low"
```

### ATH & ATL
```bash
./scripts/bankr.sh "What is ETH all-time high?"
./scripts/bankr.sh "Show all-time low for TOKEN"
./scripts/bankr.sh "How far is TOKEN from ATH?"
```

## Comparison Commands

### Token Comparison
```bash
./scripts/bankr.sh "Compare ETH vs BTC"
./scripts/bankr.sh "Which is better: TOKEN1 or TOKEN2?"
./scripts/bankr.sh "Compare market caps of ETH and BTC"
```

### Price Comparison
```bash
./scripts/bankr.sh "Compare prices of ETH, BTC, and SOL"
./scripts/bankr.sh "Price comparison for top 10 cryptos"
```

## Sentiment & Social

### Social Metrics
```bash
./scripts/bankr.sh "What's the sentiment on ETH?"
./scripts/bankr.sh "Social metrics for TOKEN"
./scripts/bankr.sh "Twitter mentions of BTC"
```

### Community Stats
```bash
./scripts/bankr.sh "Show community stats for TOKEN"
./scripts/bankr.sh "Social volume for ETH"
```

## Chain-Specific Queries

### Base
```bash
./scripts/bankr.sh "Top tokens on Base by volume"
./scripts/bankr.sh "Base ecosystem tokens"
```

### Solana
```bash
./scripts/bankr.sh "Top tokens on Solana"
./scripts/bankr.sh "Solana ecosystem performance"
```

### Ethereum
```bash
./scripts/bankr.sh "Top ERC20 tokens by market cap"
./scripts/bankr.sh "Ethereum gas prices"
```

## Market Overview

### General Market
```bash
./scripts/bankr.sh "Show crypto market overview"
./scripts/bankr.sh "Market sentiment today"
./scripts/bankr.sh "Crypto fear and greed index"
```

### Sector Performance
```bash
./scripts/bankr.sh "DeFi tokens performance"
./scripts/bankr.sh "Gaming tokens performance"
./scripts/bankr.sh "AI tokens performance"
```

## Pre-Trade Research Workflow

### Quick Analysis (2 minutes)
```bash
# 1. Current price
./scripts/bankr.sh "What is the price of TOKEN?"

# 2. Quick TA
./scripts/bankr.sh "Show RSI for TOKEN"

# 3. Trending status
./scripts/bankr.sh "Is TOKEN trending on Base?"
```

### Deep Analysis (10 minutes)
```bash
# 1. Full technical analysis
./scripts/bankr.sh "Do technical analysis on TOKEN"

# 2. Market data
./scripts/bankr.sh "Show TOKEN market data"

# 3. Compare to peers
./scripts/bankr.sh "Compare TOKEN vs COMPETITOR"

# 4. Sentiment check
./scripts/bankr.sh "What's the sentiment on TOKEN?"
```

## Interpretation Guide

### Bullish Signals
- RSI < 30 (oversold)
- Price above 50-day MA
- Increasing volume
- Positive sentiment
- Higher lows forming

### Bearish Signals
- RSI > 70 (overbought)
- Price below 50-day MA
- Decreasing volume
- Negative sentiment
- Lower highs forming

### Neutral/Wait
- RSI 40-60
- Price at MA (testing)
- Flat volume
- Mixed sentiment
