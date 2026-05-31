#!/usr/bin/env python3
"""
Position Size Calculator - Calculate position size based on risk %
Usage: ./position_size.py --account 10000 --risk 2 --entry 50000 --stop 48000
"""

import argparse
import sys

def calculate_position_size(account_size, risk_percent, entry_price, stop_loss, leverage=1):
    """
    Calculate position size based on risk percentage.
    
    Formula: Position Size = (Account × Risk%) / (|Entry - Stop| / Entry)
    """
    risk_amount = account_size * (risk_percent / 100)
    stop_distance = abs(entry_price - stop_loss)
    
    if stop_distance == 0:
        return None
    
    # Risk-based position size
    position_size_units = risk_amount / stop_distance
    position_value = position_size_units * entry_price
    
    # Margin required (with leverage)
    margin_required = position_value / leverage
    
    # Risk/Reward if we assume 2:1 reward or 3:1
    rr_2x = stop_distance * 2
    rr_3x = stop_distance * 3
    
    return {
        "risk_amount": risk_amount,
        "position_size": position_size_units,
        "position_value": position_value,
        "margin_required": margin_required,
        "stop_distance_pct": (stop_distance / entry_price) * 100,
        "target_2r": entry_price + (stop_distance * 2) if entry_price > stop_loss else entry_price - (stop_distance * 2),
        "target_3r": entry_price + (stop_distance * 3) if entry_price > stop_loss else entry_price - (stop_distance * 3)
    }

def main():
    parser = argparse.ArgumentParser(description="Position Size Calculator")
    parser.add_argument("--account", "-a", type=float, required=True,
                        help="Account size in USD")
    parser.add_argument("--risk", "-r", type=float, required=True,
                        help="Risk percentage (e.g., 2 for 2%)")
    parser.add_argument("--entry", "-e", type=float, required=True,
                        help="Entry price")
    parser.add_argument("--stop", "-s", type=float, required=True,
                        help="Stop loss price")
    parser.add_argument("--leverage", "-l", type=float, default=1,
                        help="Leverage (default: 1 = no leverage)")
    parser.add_argument("--direction", choices=["long", "short"], default="long",
                        help="Trade direction")
    
    args = parser.parse_args()
    
    # Validate inputs
    if args.risk <= 0 or args.risk > 100:
        print("❌ Risk percentage must be between 0 and 100")
        sys.exit(1)
    
    if args.direction == "long" and args.stop >= args.entry:
        print("❌ For longs, stop loss must be BELOW entry price")
        sys.exit(1)
    elif args.direction == "short" and args.stop <= args.entry:
        print("❌ For shorts, stop loss must be ABOVE entry price")
        sys.exit(1)
    
    result = calculate_position_size(
        args.account, args.risk, args.entry, args.stop, args.leverage
    )
    
    if result is None:
        print("❌ Stop loss cannot be at same price as entry")
        sys.exit(1)
    
    direction_emoji = "🟢" if args.direction == "long" else "🔴"
    
    print("=" * 60)
    print(f"{direction_emoji} POSITION SIZE CALCULATOR")
    print("=" * 60)
    print(f"\n📊 Inputs:")
    print(f"   Account Size: ${args.account:,.2f}")
    print(f"   Risk: {args.risk}% = ${result['risk_amount']:,.2f}")
    print(f"   Entry: ${args.entry:,.2f}")
    print(f"   Stop Loss: ${args.stop:,.2f}")
    print(f"   Stop Distance: {result['stop_distance_pct']:.2f}%")
    print(f"   Leverage: {args.leverage}x")
    
    print(f"\n💰 Position Details:")
    print(f"   Position Size: {result['position_size']:.6f} units")
    print(f"   Position Value: ${result['position_value']:,.2f}")
    print(f"   Margin Required: ${result['margin_required']:,.2f}")
    
    print(f"\n🎯 Profit Targets:")
    print(f"   1R (breakeven): ${args.entry:,.2f}")
    print(f"   2R target: ${result['target_2r']:,.2f}")
    print(f"   3R target: ${result['target_3r']:,.2f}")
    
    print(f"\n📈 Potential Outcomes:")
    print(f"   At 2R: +${result['risk_amount'] * 2:,.2f} (+{args.risk * 2}% of account)")
    print(f"   At 3R: +${result['risk_amount'] * 3:,.2f} (+{args.risk * 3}% of account)")
    print(f"   At Stop: -${result['risk_amount']:,.2f} (-{args.risk}% of account)")
    
    # Risk warnings
    print(f"\n⚠️  Risk Check:")
    if args.risk > 5:
        print(f"   🔴 HIGH RISK: {args.risk}% per trade is aggressive")
    elif args.risk > 2:
        print(f"   🟡 MODERATE RISK: {args.risk}% per trade")
    else:
        print(f"   🟢 CONSERVATIVE: {args.risk}% per trade")
    
    if result['position_value'] > args.account:
        print(f"   ⚠️  Position value exceeds account (using leverage)")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
