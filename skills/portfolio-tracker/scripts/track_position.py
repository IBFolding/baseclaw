#!/usr/bin/env python3
"""
Portfolio Tracker - Track positions and calculate P&L
Usage: ./track_position.py --symbol BTC --entry 45000 --size 0.5 --exchange binance
"""

import os
import json
import argparse
import requests
from datetime import datetime
from pathlib import Path

PORTFOLIO_DIR = Path.home() / ".openclaw" / "portfolio"
PORTFOLIO_FILE = PORTFOLIO_DIR / "positions.json"

def init_storage():
    """Initialize portfolio storage"""
    PORTFOLIO_DIR.mkdir(parents=True, exist_ok=True)
    if not PORTFOLIO_FILE.exists():
        PORTFOLIO_FILE.write_text(json.dumps({"positions": []}))

def load_portfolio():
    """Load portfolio from disk"""
    init_storage()
    return json.loads(PORTFOLIO_FILE.read_text())

def save_portfolio(data):
    """Save portfolio to disk"""
    PORTFOLIO_FILE.write_text(json.dumps(data, indent=2))

def get_price(symbol):
    """Fetch current price from CoinGecko (free, no API key required)"""
    try:
        symbol_lower = symbol.lower()
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={symbol_lower}&vs_currencies=usd"
        response = requests.get(url, timeout=10)
        data = response.json()
        if symbol_lower in data:
            return data[symbol_lower]["usd"]
        
        # Try with common mappings
        mappings = {
            "btc": "bitcoin", "eth": "ethereum", "sol": "solana",
            "ada": "cardano", "dot": "polkadot", "link": "chainlink",
            "matic": "polygon", "avax": "avalanche-2", "uni": "uniswap"
        }
        if symbol_lower in mappings:
            url = f"https://api.coingecko.com/api/v3/simple/price?ids={mappings[symbol_lower]}&vs_currencies=usd"
            response = requests.get(url, timeout=10)
            data = response.json()
            return data.get(mappings[symbol_lower], {}).get("usd", 0)
        return 0
    except Exception as e:
        print(f"Error fetching price: {e}")
        return 0

def track_position(symbol, entry_price, size, side="long", exchange="manual", notes=""):
    """Add a new position to track"""
    portfolio = load_portfolio()
    
    position = {
        "id": datetime.now().strftime("%Y%m%d_%H%M%S"),
        "symbol": symbol.upper(),
        "entry_price": float(entry_price),
        "size": float(size),
        "side": side.lower(),
        "exchange": exchange,
        "opened_at": datetime.now().isoformat(),
        "notes": notes
    }
    
    portfolio["positions"].append(position)
    save_portfolio(portfolio)
    
    print(f"✅ Position added: {symbol.upper()} {side}")
    print(f"   Entry: ${entry_price} | Size: {size} | Exchange: {exchange}")
    return position

def calculate_pnl(position, current_price):
    """Calculate P&L for a position"""
    entry = float(position["entry_price"])
    size = float(position["size"])
    side = position["side"]
    
    if side == "long":
        pnl = (current_price - entry) * size
        pnl_pct = ((current_price - entry) / entry) * 100
    else:  # short
        pnl = (entry - current_price) * size
        pnl_pct = ((entry - current_price) / entry) * 100
    
    return {
        "pnl": pnl,
        "pnl_pct": pnl_pct,
        "position_value": current_price * size,
        "current_price": current_price
    }

def show_position_status(position):
    """Display current status of a position"""
    current_price = get_price(position["symbol"])
    if not current_price:
        print(f"⚠️ Could not fetch price for {position['symbol']}")
        return
    
    stats = calculate_pnl(position, current_price)
    
    symbol = position["symbol"]
    side = position["side"].upper()
    pnl = stats["pnl"]
    pnl_pct = stats["pnl_pct"]
    pnl_emoji = "🟢" if pnl >= 0 else "🔴"
    
    print(f"\n{pnl_emoji} {symbol} ({side})")
    print(f"   Entry: ${position['entry_price']:,.2f} → Current: ${current_price:,.2f}")
    print(f"   Size: {position['size']}")
    print(f"   P&L: ${pnl:+,.2f} ({pnl_pct:+.2f}%)")
    print(f"   Position Value: ${stats['position_value']:,.2f}")
    print(f"   Exchange: {position['exchange']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Track a trading position")
    parser.add_argument("--symbol", "-s", required=True, help="Asset symbol (e.g., BTC, ETH)")
    parser.add_argument("--entry", "-e", required=True, type=float, help="Entry price")
    parser.add_argument("--size", "-n", required=True, type=float, help="Position size")
    parser.add_argument("--side", choices=["long", "short"], default="long", help="Position side")
    parser.add_argument("--exchange", "-x", default="manual", help="Exchange name")
    parser.add_argument("--notes", default="", help="Optional notes")
    
    args = parser.parse_args()
    
    position = track_position(
        args.symbol, args.entry, args.size, 
        args.side, args.exchange, args.notes
    )
    
    # Show live status
    print("\n📊 Current Status:")
    show_position_status(position)
