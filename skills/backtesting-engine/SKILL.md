# backtesting-engine

Test trading strategies on historical price data.

## Features

- Load historical OHLCV data from Yahoo Finance or CSV files
- Run strategy simulations with configurable parameters
- Calculate key metrics: returns, Sharpe ratio, max drawdown, win rate
- Export results to JSON or CSV
- Built-in sample strategies (SMA crossover, RSI, Bollinger Bands)

## Usage

```bash
# Run backtest with default SMA crossover strategy on AAPL
./backtest.py --symbol AAPL --start 2020-01-01 --end 2024-01-01

# Use RSI strategy
./backtest.py --symbol BTC-USD --strategy rsi --start 2022-01-01

# Export results to CSV
./backtest.py --symbol TSLA --strategy bollinger --export csv --output results.csv

# Load custom data from CSV
./backtest.py --data ./my_data.csv --strategy sma --sma-fast 10 --sma-slow 50
```

## Options

- `--symbol` - Stock/crypto symbol (e.g., AAPL, BTC-USD)
- `--data` - Path to custom CSV data file
- `--start` - Start date (YYYY-MM-DD)
- `--end` - End date (YYYY-MM-DD)
- `--strategy` - Strategy name: sma, rsi, bollinger, macd
- `--initial-cash` - Starting capital (default: 10000)
- `--export` - Export format: json, csv
- `--output` - Output file path

## Strategies

### SMA Crossover
Buy when fast SMA crosses above slow SMA, sell when opposite.

### RSI
Buy when RSI < 30 (oversold), sell when RSI > 70 (overbought).

### Bollinger Bands
Buy when price touches lower band, sell when touches upper band.

### MACD
Buy on MACD line crossing above signal line, sell on opposite.

## Requirements

- Python 3.8+
- yfinance, pandas, numpy

## Install

```bash
pip install yfinance pandas numpy
```
