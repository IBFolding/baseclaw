#!/usr/bin/env python3
"""
Kelly Criterion Calculator - Calculate optimal bet size
Usage: ./kelly_calculator.py --win-rate 0.55 --avg-win 100 --avg-loss 50
"""

import argparse
import sys

def kelly_criterion(win_rate, avg_win, avg_loss):
    """
    Calculate Kelly Criterion optimal bet size.
    
    Formula: f* = (p × b - q) / b
    Where:
    - f* = fraction of bankroll to bet
    - p = probability of win
    - q = probability of loss (1-p)
    - b = average win / average loss
    """
    p = win_rate
    q = 1 - p
    b = avg_win / avg_loss
    
    kelly = (p * b - q) / b
    half_kelly = kelly / 2
    quarter_kelly = kelly / 4
    
    return {
        "kelly": kelly,
        "half_kelly": half_kelly,
        "quarter_kelly": quarter_kelly,
        "b": b,
        "expectancy": (p * avg_win) - (q * avg_loss)
    }

def main():
    parser = argparse.ArgumentParser(description="Kelly Criterion Calculator")
    parser.add_argument("--win-rate", "-w", type=float, required=True, 
                        help="Win rate as decimal (e.g., 0.55 for 55%)")
    parser.add_argument("--avg-win", type=float, required=True,
                        help="Average win amount")
    parser.add_argument("--avg-loss", type=float, required=True,
                        help="Average loss amount")
    parser.add_argument("--bankroll", "-b", type=float, default=10000,
                        help="Total bankroll/account size (default: 10000)")
    
    args = parser.parse_args()
    
    if args.win_rate <= 0 or args.win_rate >= 1:
        print("❌ Win rate must be between 0 and 1")
        sys.exit(1)
    
    if args.avg_loss <= 0:
        print("❌ Average loss must be positive")
        sys.exit(1)
    
    result = kelly_criterion(args.win_rate, args.avg_win, args.avg_loss)
    
    print("=" * 60)
    print("🎯 KELLY CRITERION CALCULATOR")
    print("=" * 60)
    print(f"\n📊 Inputs:")
    print(f"   Win Rate: {args.win_rate:.1%}")
    print(f"   Average Win: ${args.avg_win:,.2f}")
    print(f"   Average Loss: ${args.avg_loss:,.2f}")
    print(f"   Bankroll: ${args.bankroll:,.2f}")
    print(f"   Edge (b): {result['b']:.2f}")
    
    print(f"\n📈 Results:")
    print(f"   Expectancy per trade: ${result['expectancy']:.2f}")
    
    if result['kelly'] <= 0:
        print(f"\n⚠️  WARNING: Kelly is negative or zero ({result['kelly']:.2%})")
        print("   This strategy has NO EDGE. Do not trade.")
    else:
        print(f"\n💰 Optimal Bet Sizes:")
        print(f"   Full Kelly: {result['kelly']:.2%} = ${args.bankroll * result['kelly']:,.2f}")
        print(f"   Half Kelly: {result['half_kelly']:.2%} = ${args.bankroll * result['half_kelly']:,.2f}")
        print(f"   Quarter Kelly: {result['quarter_kelly']:.2%} = ${args.bankroll * result['quarter_kelly']:,.2f}")
        
        print(f"\n📝 Recommendations:")
        print(f"   Conservative (Quarter Kelly): ${args.bankroll * result['quarter_kelly']:,.2f}")
        print(f"   Moderate (Half Kelly): ${args.bankroll * result['half_kelly']:,.2f}")
        print(f"   Aggressive (Full Kelly): ${args.bankroll * result['kelly']:,.2f}")
        print(f"\n💡 Most traders use Half Kelly or less to reduce volatility")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
