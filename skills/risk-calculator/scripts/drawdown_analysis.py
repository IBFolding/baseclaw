#!/usr/bin/env python3
"""
Drawdown Analysis - Calculate maximum drawdown from returns
Usage: ./drawdown_analysis.py --returns "10,-5,8,-12,15,-3,20"
         ./drawdown_analysis.py --file returns.csv
"""

import argparse
import sys
from pathlib import Path

def calculate_drawdown(returns):
    """
    Calculate maximum drawdown and related metrics.
    
    Returns: list of percentage returns (can be float or string)
    """
    # Convert to floats
    returns = [float(r) for r in returns]
    
    # Calculate cumulative equity curve
    equity = [100]  # Start at 100
    for r in returns:
        equity.append(equity[-1] * (1 + r/100))
    
    # Calculate running maximum and drawdown
    running_max = []
    current_max = equity[0]
    for e in equity:
        current_max = max(current_max, e)
        running_max.append(current_max)
    
    drawdowns = []
    for i, (e, rm) in enumerate(zip(equity, running_max)):
        dd = (e - rm) / rm * 100
        drawdowns.append(dd)
    
    max_dd = min(drawdowns)
    max_dd_idx = drawdowns.index(max_dd)
    
    # Find recovery
    recovery_idx = None
    for i in range(max_dd_idx + 1, len(equity)):
        if equity[i] >= running_max[max_dd_idx]:
            recovery_idx = i
            break
    
    return {
        "returns": returns,
        "equity": equity,
        "max_drawdown": max_dd,
        "max_dd_idx": max_dd_idx,
        "recovery_idx": recovery_idx,
        "total_return": (equity[-1] - 100),
        "avg_return": sum(returns) / len(returns),
        "positive_months": sum(1 for r in returns if r > 0),
        "negative_months": sum(1 for r in returns if r < 0)
    }

def parse_returns_string(s):
    """Parse comma-separated returns"""
    return [float(x.strip()) for x in s.split(",")]

def main():
    parser = argparse.ArgumentParser(description="Drawdown Analysis")
    parser.add_argument("--returns", "-r", help="Comma-separated returns (e.g., '10,-5,8')")
    parser.add_argument("--file", "-f", help="File with returns (one per line)")
    
    args = parser.parse_args()
    
    if args.returns:
        returns = parse_returns_string(args.returns)
    elif args.file:
        if not Path(args.file).exists():
            print(f"❌ File not found: {args.file}")
            sys.exit(1)
        with open(args.file) as f:
            returns = [float(line.strip()) for line in f if line.strip()]
    else:
        print("❌ Please specify --returns or --file")
        sys.exit(1)
    
    result = calculate_drawdown(returns)
    
    print("=" * 60)
    print("📉 DRAWDOWN ANALYSIS")
    print("=" * 60)
    
    print(f"\n📊 Returns Data ({len(returns)} periods):")
    print(f"   Returns: {returns}")
    
    print(f"\n💰 Performance Summary:")
    print(f"   Total Return: {result['total_return']:+.2f}%")
    print(f"   Average Return: {result['avg_return']:+.2f}%")
    print(f"   Positive Periods: {result['positive_months']}")
    print(f"   Negative Periods: {result['negative_months']}")
    print(f"   Win Rate: {result['positive_months']/len(returns):.1%}")
    
    print(f"\n📉 Drawdown Analysis:")
    print(f"   Maximum Drawdown: {result['max_drawdown']:.2f}%")
    print(f"   Peak Index: Period {result['max_dd_idx']}")
    
    if result['recovery_idx']:
        recovery_time = result['recovery_idx'] - result['max_dd_idx']
        print(f"   Recovered: Period {result['recovery_idx']} ({recovery_time} periods)")
    else:
        print(f"   Status: ⚠️  Still in drawdown - not yet recovered")
    
    # Drawdown severity
    dd = abs(result['max_drawdown'])
    print(f"\n🏆 Drawdown Assessment:")
    if dd < 10:
        print(f"   🟢 EXCELLENT: Max DD under 10%")
    elif dd < 20:
        print(f"   ✅ GOOD: Max DD between 10-20%")
    elif dd < 30:
        print(f"   ⚠️  MODERATE: Max DD between 20-30%")
    else:
        print(f"   🔴 HIGH: Max DD over 30% - consider risk reduction")
    
    # Calmar ratio (return / max DD)
    calmar = abs(result['total_return'] / result['max_drawdown']) if result['max_drawdown'] != 0 else 0
    print(f"\n📈 Risk-Adjusted Return:")
    print(f"   Calmar Ratio: {calmar:.2f}")
    print(f"   (Higher is better, >2 is good, >3 is excellent)")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
