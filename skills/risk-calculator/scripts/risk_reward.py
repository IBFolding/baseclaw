#!/usr/bin/env python3
"""
Risk/Reward Calculator - Calculate R/R ratio for trades
Usage: ./risk_reward.py --entry 100 --stop 95 --target 115
"""

import argparse
import sys

def calculate_risk_reward(entry, stop, target):
    """Calculate risk/reward metrics"""
    risk = abs(entry - stop)
    reward = abs(target - entry)
    
    if risk == 0:
        return None
    
    rr_ratio = reward / risk
    
    # Break-even win rate
    break_even = 1 / (1 + rr_ratio)
    
    # Expected value at different win rates
    win_rates = [0.3, 0.4, 0.5, 0.6, 0.7]
    expectations = []
    for wr in win_rates:
        ev = (wr * reward) - ((1 - wr) * risk)
        expectations.append((wr, ev))
    
    return {
        "risk": risk,
        "reward": reward,
        "rr_ratio": rr_ratio,
        "break_even": break_even,
        "expectations": expectations,
        "risk_pct": (risk / entry) * 100,
        "reward_pct": (reward / entry) * 100
    }

def main():
    parser = argparse.ArgumentParser(description="Risk/Reward Calculator")
    parser.add_argument("--entry", "-e", type=float, required=True, help="Entry price")
    parser.add_argument("--stop", "-s", type=float, required=True, help="Stop loss price")
    parser.add_argument("--target", "-t", type=float, required=True, help="Target price")
    
    args = parser.parse_args()
    
    # Detect direction
    if args.target > args.entry and args.stop < args.entry:
        direction = "long"
    elif args.target < args.entry and args.stop > args.entry:
        direction = "short"
    else:
        print("❌ Invalid setup: Target and stop must be on opposite sides of entry")
        sys.exit(1)
    
    result = calculate_risk_reward(args.entry, args.stop, args.target)
    
    if result is None:
        print("❌ Stop loss cannot be at same price as entry")
        sys.exit(1)
    
    direction_emoji = "🟢" if direction == "long" else "🔴"
    
    print("=" * 60)
    print(f"{direction_emoji} RISK/REWARD CALCULATOR")
    print("=" * 60)
    
    print(f"\n📊 Trade Setup:")
    print(f"   Entry: ${args.entry:,.2f}")
    print(f"   Stop: ${args.stop:,.2f}")
    print(f"   Target: ${args.target:,.2f}")
    
    print(f"\n💰 Risk/Reward Analysis:")
    print(f"   Risk: ${result['risk']:,.2f} ({result['risk_pct']:.2f}%)")
    print(f"   Reward: ${result['reward']:,.2f} ({result['reward_pct']:.2f}%)")
    print(f"   R:R Ratio: 1:{result['rr_ratio']:.2f}")
    
    print(f"\n🎯 Statistics:")
    print(f"   Break-even win rate: {result['break_even']:.1%}")
    print(f"   Required edge: {(result['break_even'] * 100):.1f}% win rate")
    
    print(f"\n📈 Expected Value at Different Win Rates:")
    for wr, ev in result['expectations']:
        status = "✅" if ev > 0 else "❌"
        print(f"   {status} {wr:.0%} win rate: ${ev:+,.2f} per trade")
    
    # Quality assessment
    print(f"\n🏆 Trade Quality:")
    if result['rr_ratio'] >= 3:
        print(f"   🌟 EXCELLENT: 1:{result['rr_ratio']:.1f} is outstanding")
    elif result['rr_ratio'] >= 2:
        print(f"   ✅ GOOD: 1:{result['rr_ratio']:.1f} meets minimum standard")
    elif result['rr_ratio'] >= 1.5:
        print(f"   ⚠️  ACCEPTABLE: 1:{result['rr_ratio']:.1f} is marginal")
    else:
        print(f"   ❌ POOR: 1:{result['rr_ratio']:.1f} is below recommended 1:2")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
