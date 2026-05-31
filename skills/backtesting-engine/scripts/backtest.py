#!/usr/bin/env python3
"""
Backtesting Engine - Test trading strategies on historical data
"""

import argparse
import json
import csv
import sys
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Callable
from datetime import datetime
from pathlib import Path

try:
    import yfinance as yf
    import pandas as pd
    import numpy as np
except ImportError:
    print("Error: Required packages not installed.")
    print("Run: pip install yfinance pandas numpy")
    sys.exit(1)


@dataclass
class Trade:
    entry_date: datetime
    exit_date: Optional[datetime] = None
    entry_price: float = 0.0
    exit_price: float = 0.0
    shares: float = 0.0
    pnl: float = 0.0
    pnl_pct: float = 0.0
    status: str = "open"


@dataclass
class BacktestResult:
    strategy: str
    symbol: str
    start_date: str
    end_date: str
    initial_cash: float
    final_value: float
    total_return: float
    total_return_pct: float
    sharpe_ratio: float
    max_drawdown: float
    max_drawdown_pct: float
    win_rate: float
    num_trades: int
    winning_trades: int
    losing_trades: int
    avg_trade_return: float
    trades: List[Dict]


def calculate_sma(data: pd.DataFrame, period: int) -> pd.Series:
    return data['Close'].rolling(window=period).mean()


def calculate_rsi(data: pd.DataFrame, period: int = 14) -> pd.Series:
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))


def calculate_bollinger_bands(data: pd.DataFrame, period: int = 20, std_dev: float = 2.0):
    sma = calculate_sma(data, period)
    std = data['Close'].rolling(window=period).std()
    upper = sma + (std * std_dev)
    lower = sma - (std * std_dev)
    return upper, sma, lower


def calculate_macd(data: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9):
    ema_fast = data['Close'].ewm(span=fast).mean()
    ema_slow = data['Close'].ewm(span=slow).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def sma_strategy(data: pd.DataFrame, fast: int = 20, slow: int = 50) -> pd.Series:
    sma_fast = calculate_sma(data, fast)
    sma_slow = calculate_sma(data, slow)
    signal = pd.Series(0, index=data.index)
    signal[sma_fast > sma_slow] = 1
    signal[sma_fast < sma_slow] = -1
    return signal


def rsi_strategy(data: pd.DataFrame, oversold: int = 30, overbought: int = 70) -> pd.Series:
    rsi = calculate_rsi(data)
    signal = pd.Series(0, index=data.index)
    signal[rsi < oversold] = 1
    signal[rsi > overbought] = -1
    return signal


def bollinger_strategy(data: pd.DataFrame) -> pd.Series:
    upper, middle, lower = calculate_bollinger_bands(data)
    signal = pd.Series(0, index=data.index)
    signal[data['Close'] < lower] = 1
    signal[data['Close'] > upper] = -1
    return signal


def macd_strategy(data: pd.DataFrame) -> pd.Series:
    macd_line, signal_line, _ = calculate_macd(data)
    signal = pd.Series(0, index=data.index)
    signal[macd_line > signal_line] = 1
    signal[macd_line < signal_line] = -1
    return signal


def run_backtest(
    data: pd.DataFrame,
    strategy_fn: Callable,
    initial_cash: float = 10000.0
) -> BacktestResult:
    signals = strategy_fn(data)
    
    cash = initial_cash
    position = 0.0
    trades: List[Trade] = []
    current_trade: Optional[Trade] = None
    
    portfolio_values = []
    
    for i, (date, row) in enumerate(data.iterrows()):
        price = row['Close']
        signal = signals.iloc[i]
        
        # Buy signal
        if signal == 1 and position == 0:
            shares = cash / price
            current_trade = Trade(
                entry_date=date,
                entry_price=price,
                shares=shares
            )
            position = shares
            cash = 0
        
        # Sell signal
        elif signal == -1 and position > 0 and current_trade:
            current_trade.exit_date = date
            current_trade.exit_price = price
            current_trade.status = "closed"
            proceeds = position * price
            current_trade.pnl = proceeds - (current_trade.shares * current_trade.entry_price)
            current_trade.pnl_pct = (current_trade.pnl / (current_trade.shares * current_trade.entry_price)) * 100
            trades.append(current_trade)
            cash = proceeds
            position = 0
            current_trade = None
        
        portfolio_value = cash + (position * price)
        portfolio_values.append(portfolio_value)
    
    # Close any open position at the end
    if position > 0 and current_trade:
        final_price = data['Close'].iloc[-1]
        current_trade.exit_date = data.index[-1]
        current_trade.exit_price = final_price
        current_trade.status = "closed"
        proceeds = position * final_price
        current_trade.pnl = proceeds - (current_trade.shares * current_trade.entry_price)
        current_trade.pnl_pct = (current_trade.pnl / (current_trade.shares * current_trade.entry_price)) * 100
        trades.append(current_trade)
        cash = proceeds
    
    final_value = cash
    
    # Calculate metrics
    returns = pd.Series(portfolio_values).pct_change().dropna()
    
    winning_trades = [t for t in trades if t.pnl > 0]
    losing_trades = [t for t in trades if t.pnl <= 0]
    
    total_return = final_value - initial_cash
    total_return_pct = (total_return / initial_cash) * 100
    
    # Sharpe ratio (annualized, assuming 252 trading days, risk-free rate ~2%)
    if len(returns) > 1 and returns.std() != 0:
        sharpe_ratio = ((returns.mean() * 252) - 0.02) / (returns.std() * np.sqrt(252))
    else:
        sharpe_ratio = 0
    
    # Max drawdown
    portfolio_series = pd.Series(portfolio_values)
    rolling_max = portfolio_series.expanding().max()
    drawdown = (portfolio_series - rolling_max) / rolling_max
    max_drawdown = drawdown.min()
    max_drawdown_pct = max_drawdown * 100
    
    win_rate = (len(winning_trades) / len(trades) * 100) if trades else 0
    avg_trade_return = sum(t.pnl_pct for t in trades) / len(trades) if trades else 0
    
    return BacktestResult(
        strategy=strategy_fn.__name__,
        symbol="",
        start_date=str(data.index[0]),
        end_date=str(data.index[-1]),
        initial_cash=initial_cash,
        final_value=final_value,
        total_return=total_return,
        total_return_pct=total_return_pct,
        sharpe_ratio=sharpe_ratio,
        max_drawdown=max_drawdown,
        max_drawdown_pct=max_drawdown_pct,
        win_rate=win_rate,
        num_trades=len(trades),
        winning_trades=len(winning_trades),
        losing_trades=len(losing_trades),
        avg_trade_return=avg_trade_return,
        trades=[asdict(t) for t in trades]
    )


def load_data(symbol: str, start: str, end: str) -> pd.DataFrame:
    print(f"Loading data for {symbol} from {start} to {end}...")
    ticker = yf.Ticker(symbol)
    data = ticker.history(start=start, end=end)
    if data.empty:
        raise ValueError(f"No data found for {symbol}")
    return data


def load_csv_data(filepath: str) -> pd.DataFrame:
    print(f"Loading data from {filepath}...")
    data = pd.read_csv(filepath, parse_dates=['Date'] if 'Date' in pd.read_csv(filepath, nrows=0).columns else True)
    if 'Date' in data.columns:
        data.set_index('Date', inplace=True)
    return data


def export_results(result: BacktestResult, format_type: str, output_path: str):
    if format_type == 'json':
        with open(output_path, 'w') as f:
            json.dump(asdict(result), f, indent=2, default=str)
    elif format_type == 'csv':
        with open(output_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Metric', 'Value'])
            for key, value in asdict(result).items():
                if key != 'trades':
                    writer.writerow([key, value])
            if result.trades:
                writer.writerow([])
                writer.writerow(['Trades'])
                if result.trades:
                    writer.writerow(result.trades[0].keys())
                    for trade in result.trades:
                        writer.writerow(trade.values())
    print(f"Results exported to {output_path}")


def main():
    parser = argparse.ArgumentParser(description='Backtesting Engine')
    parser.add_argument('--symbol', type=str, help='Stock/crypto symbol')
    parser.add_argument('--data', type=str, help='Path to CSV data file')
    parser.add_argument('--start', type=str, default='2020-01-01', help='Start date')
    parser.add_argument('--end', type=str, default='2024-01-01', help='End date')
    parser.add_argument('--strategy', type=str, default='sma', choices=['sma', 'rsi', 'bollinger', 'macd'])
    parser.add_argument('--initial-cash', type=float, default=10000.0)
    parser.add_argument('--sma-fast', type=int, default=20)
    parser.add_argument('--sma-slow', type=int, default=50)
    parser.add_argument('--export', type=str, choices=['json', 'csv'])
    parser.add_argument('--output', type=str)
    
    args = parser.parse_args()
    
    if not args.symbol and not args.data:
        parser.error("Either --symbol or --data must be provided")
    
    # Load data
    if args.data:
        data = load_csv_data(args.data)
    else:
        data = load_data(args.symbol, args.start, args.end)
    
    # Select strategy
    strategies = {
        'sma': lambda d: sma_strategy(d, args.sma_fast, args.sma_slow),
        'rsi': rsi_strategy,
        'bollinger': bollinger_strategy,
        'macd': macd_strategy
    }
    
    strategy_fn = strategies[args.strategy]
    
    print(f"Running {args.strategy} strategy backtest...")
    result = run_backtest(data, strategy_fn, args.initial_cash)
    
    if args.symbol:
        result.symbol = args.symbol
    
    # Print results
    print("\n" + "="*50)
    print("BACKTEST RESULTS")
    print("="*50)
    print(f"Strategy:        {result.strategy}")
    print(f"Symbol:          {result.symbol}")
    print(f"Period:          {result.start_date[:10]} to {result.end_date[:10]}")
    print(f"Initial Cash:    ${result.initial_cash:,.2f}")
    print(f"Final Value:     ${result.final_value:,.2f}")
    print(f"Total Return:    ${result.total_return:,.2f} ({result.total_return_pct:.2f}%)")
    print(f"Sharpe Ratio:    {result.sharpe_ratio:.3f}")
    print(f"Max Drawdown:    {result.max_drawdown_pct:.2f}%")
    print(f"Win Rate:        {result.win_rate:.1f}%")
    print(f"Total Trades:    {result.num_trades}")
    print(f"Winning Trades:  {result.winning_trades}")
    print(f"Losing Trades:   {result.losing_trades}")
    print(f"Avg Trade Return: {result.avg_trade_return:.2f}%")
    print("="*50)
    
    # Export if requested
    if args.export:
        output = args.output or f"backtest_result.{args.export}"
        export_results(result, args.export, output)


if __name__ == '__main__':
    main()
