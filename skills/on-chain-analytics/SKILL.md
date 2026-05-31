# on-chain-analytics

Blockchain data analysis for crypto trading insights.

## Features

- Track whale wallet movements and alerts
- Monitor exchange inflows/outflows
- Network health metrics (hash rate, difficulty)
- Gas price tracking for Ethereum
- Whale transaction alerts

## Usage

```bash
# Track whale wallets (transactions > $1M)
./whale_tracker.py --chain bitcoin --min-value 1000000

# Monitor exchange flows
./exchange_flows.py --exchange coinbase --days 7

# Check network health
./network_health.py --chain ethereum

# Track gas prices
./gas_tracker.py --network ethereum --alert 50
```

## API Setup

Get a free API key from one of these providers:
- **Alchemy** - alchemy.com (recommended)
- **Infura** - infura.io
- **Etherscan** - etherscan.io
- **Glassnode** - glassnode.com

Set your API key:
```bash
export ALCHEMY_API_KEY="your_key_here"
# or
export ETHERSCAN_API_KEY="your_key_here"
```

## Commands

### whale_tracker.py
Monitor large wallet movements
- `--chain` - bitcoin, ethereum
- `--min-value` - Minimum USD value to track
- `--watch` - Continuous monitoring mode
- `--alert` - Alert threshold in USD

### exchange_flows.py
Track exchange deposits/withdrawals
- `--exchange` - coinbase, binance, kraken
- `--days` - Number of days to analyze
- `--direction` - inflow, outflow, or both

### network_health.py
Check blockchain network status
- `--chain` - bitcoin, ethereum
- `--metrics` - hash_rate, difficulty, fees, tps

### gas_tracker.py
Ethereum gas price monitor
- `--network` - ethereum, polygon, arbitrum
- `--alert` - Alert when gas exceeds threshold
- `--watch` - Continuous monitoring

## Requirements

- Python 3.8+
- requests, websockets

## Install

```bash
pip install requests websockets
```
