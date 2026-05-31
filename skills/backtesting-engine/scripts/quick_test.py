#!/usr/bin/env python3
"""
Quick backtest utility - run simple tests with default parameters
"""

import sys
import subprocess
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent

EXAMPLES = [
    ("AAPL with SMA", ["--symbol", "AAPL", "--strategy", "sma", "--start", "2022-01-01"]),
    ("BTC with RSI", ["--symbol", "BTC-USD", "--strategy", "rsi", "--start", "2022-01-01"]),
    ("TSLA with Bollinger", ["--symbol", "TSLA", "--strategy", "bollinger", "--start", "2022-01-01"]),
]


def run_example(name: str, args: list):
    print(f"\n{'='*60}")
    print(f"Example: {name}")
    print(f"{'='*60}")
    cmd = [sys.executable, str(SCRIPT_DIR / "backtest.py")] + args
    subprocess.run(cmd)


def main():
    if len(sys.argv) > 1:
        # Run specific example
        idx = int(sys.argv[1]) - 1
        if 0 <= idx < len(EXAMPLES):
            run_example(EXAMPLES[idx][0], EXAMPLES[idx][1])
        else:
            print(f"Example {sys.argv[1]} not found. Choose 1-{len(EXAMPLES)}")
    else:
        # Show available examples
        print("Backtesting Quick Examples")
        print("Usage: ./quick_test.py [example_number]")
        print("\nAvailable examples:")
        for i, (name, _) in enumerate(EXAMPLES, 1):
            print(f"  {i}. {name}")


if __name__ == '__main__':
    main()
