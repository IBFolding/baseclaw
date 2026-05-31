#!/usr/bin/env python3
"""
Portfolio Summary - Show complete portfolio overview with P&L metrics
Usage: ./portfolio_summary.py
"""

import json
from pathlib import Path
from datetime import datetime
import requests

PORTFOLIO_FILE = Path.home() / ".openclaw" / "portfolio" / "positions.json"

def load_portfolio():
    """Load portfolio from disk"""
    if not PORTFOLIO_FILE.exists():
        return {"positions": []}
    return json.loads(PORTFOLIO_FILE.read_text())

def get_price(symbol):
    """Fetch current price from CoinGecko"""
    try:
        symbol_lower = symbol.lower()
        mappings = {
            "btc": "bitcoin", "eth": "ethereum", "sol": "solana",
            "ada": "cardano", "dot": "polkadot", "link": "chainlink",
            "matic": "polygon", "avax": "avalanche-2", "uni": "uniswap",
            "doge": "dogecoin", "xrp": "ripple", "ltc": "litecoin"
        }
        
        coin_id = mappings.get(symbol_lower, symbol_lower)
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd"
        response = requests.get(url, timeout=10)
        data = response.json()
        return data.get(coin_id, {}).get("usd", 0)
    except:
        return 0

def calculate_pnl(position, current_price):
    """Calculate P&L for a position"""
    entry = float(position["entry_price"])
    size = float(position["size"])
    side = position["side"]
    
    if side == "long":
        pnl = (current_price - entry) * size
        pnl_pct = ((current_price - entry) / entry) * 100 if entry > 0 else 0
    else:
        pnl = (entry - current_price) * size
        pnl_pct = ((entry - current_price) / entry) * 100 if entry > 0 else 0
    
    return {"pnl": pnl, "pnl_pct": pnl_pct, "value": current_price * size}

def main():
    portfolio = load_portfolio()
    positions = portfolio.get("positions", [])
    
    if not positions:
        print("📭 No positions tracked. Add one with track_position.py")
        return
    
    print("=" * 70)
    print(f"📊 PORTFOLIO SUMMARY - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 70)
    
    total_pnl = 0
    total_value = 0
    total_cost = 0
    winners = 0
    losers = 0
    
    for pos in positions:
        current_price = get_price(pos["symbol"])
        if not current_price:
            print(f"⚠️ {pos['symbol']}: Could not fetch price")
            continue
        
        stats = calculate_pnl(pos, current_price)
        pnl = stats["pnl"]
        pnl_pct = stats["pnl_pct"]
        value = stats["value"]
        cost = float(pos["entry_price"]) * float(pos["size"])
        
        total_pnl += pnl
        total_value += value
        total_cost += cost
        
        if pnl >= 0:
            winners += 1
        else:
            losers += 1
        
        emoji = "🟢" if pnl >= 0 else "🔴"
        print(f"\n{emoji} {pos['symbol']} ({pos['side'].upper()})")
        print(f"   Entry: ${float(pos['entry_price']):,.2f} → Current: ${current_price:,.2f}")
        print(f"   Size: {pos['size']} | Exchange: {pos['exchange']}")
        print(f"   P&L: ${pnl:+,.2f} ({pnl_pct:+.2f}%)")
    
    print("\n" + "=" * 70)
    print("📈 OVERALL STATISTICS")
    print("=" * 70)
    
    total_trades = winners + losers
    win_rate = (winners / total_trades * 100) if total_trades > 0 else 0
    
    # Calculate max drawdown (simplified - based on current unrealized P&L)
    unrealized_returns = []
    for pos in positions:
        current_price = get_price(pos["symbol"])
        if current_price:
            stats = calculate_pnl(pos, current_price)
            unrealized_returns.append(stats["pnl_pct"])
    
    max_drawdown = min(unrealized_returns) if unrealized_returns else 0
    
    pnl_emoji = "🟢" if total_pnl >= 0 else "🔴"
    print(f"{pnl_emoji} Total Unrealized P&L: ${total_pnl:+,.2f}")
    print(f"💰 Total Portfolio Value: ${total_value:,.2f}")
    print(f"💵 Total Cost Basis: ${total_cost:,.2f}")
    print(f"📊 Win Rate: {winners}/{total_trades} ({win_rate:.1f}%)")
    print(f"📉 Worst Position: {max_drawdown:.2f}%")
    print(f"🏆 Winners: {winners} | 🔻 Losers: {losers}")
    print("=" * 70)

if __name__ == "__main__":
    main()
