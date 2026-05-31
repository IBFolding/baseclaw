# Portfolio Tracker Skill

Real-time P&L tracking across all cryptocurrency positions with multi-exchange support.

## Features

- Track positions across multiple exchanges
- Calculate real-time P&L, win rate, and max drawdown
- Support for manual position entry
- Export data to CSV/JSON
- Portfolio allocation visualization

## Installation

```bash
pip install requests python-dotenv
```

## Environment Variables

```bash
# Optional: Add exchange API keys for live data
BINANCE_API_KEY=your_key
BINANCE_SECRET=your_secret
COINBASE_API_KEY=your_key
COINBASE_SECRET=your_secret
```

## Usage

### Track a Position

```bash
./track_position.py --symbol BTC --entry 45000 --size 0.5 --exchange binance
```

### View Portfolio Summary

```bash
./portfolio_summary.py
```

### Export Portfolio

```bash
./export_portfolio.py --format csv --output my_portfolio.csv
./export_portfolio.py --format json --output my_portfolio.json
```

### Add Manual Position

```bash
./add_position.py --symbol ETH --entry 3000 --size 10 --side long --exchange manual
```

## Data Storage

Positions are stored in `~/.openclaw/portfolio/positions.json`

## Commands

| Command | Description |
|---------|-------------|
| `track_position.py` | Track a new position with live updates |
| `portfolio_summary.py` | Show complete portfolio overview |
| `export_portfolio.py` | Export to CSV/JSON |
| `add_position.py` | Add manual position entry |
| `remove_position.py` | Remove a position |
| `update_price.py` | Fetch latest prices for all positions |
