#!/usr/bin/env python3
"""
Add Position - Quick position entry
Usage: ./add_position.py --symbol BTC --entry 45000 --size 0.5 --exchange binance
"""

import json
import argparse
from datetime import datetime
from pathlib import Path

PORTFOLIO_DIR = Path.home() / ".openclaw" / "portfolio"
PORTFOLIO_FILE = PORTFOLIO_DIR / "positions.json"

def init_storage():
    PORTFOLIO_DIR.mkdir(parents=True, exist_ok=True)
    if not PORTFOLIO_FILE.exists():
        PORTFOLIO_FILE.write_text(json.dumps({"positions": []}))

def load_portfolio():
    init_storage()
    return json.loads(PORTFOLIO_FILE.read_text())

def save_portfolio(data):
    PORTFOLIO_FILE.write_text(json.dumps(data, indent=2))

def add_position(symbol, entry_price, size, side="long", exchange="manual", notes=""):
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

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add a trading position")
    parser.add_argument("--symbol", "-s", required=True, help="Asset symbol")
    parser.add_argument("--entry", "-e", required=True, type=float, help="Entry price")
    parser.add_argument("--size", "-n", required=True, type=float, help="Position size")
    parser.add_argument("--side", choices=["long", "short"], default="long")
    parser.add_argument("--exchange", "-x", default="manual")
    parser.add_argument("--notes", default="")
    
    args = parser.parse_args()
    add_position(args.symbol, args.entry, args.size, args.side, args.exchange, args.notes)
