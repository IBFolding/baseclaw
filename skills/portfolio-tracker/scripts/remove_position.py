#!/usr/bin/env python3
"""
Remove Position - Remove a position from portfolio
Usage: ./remove_position.py --id 20240219_120000
         ./remove_position.py --symbol BTC
"""

import json
import argparse
from pathlib import Path

PORTFOLIO_FILE = Path.home() / ".openclaw" / "portfolio" / "positions.json"

def load_portfolio():
    if not PORTFOLIO_FILE.exists():
        return {"positions": []}
    return json.loads(PORTFOLIO_FILE.read_text())

def save_portfolio(data):
    PORTFOLIO_FILE.write_text(json.dumps(data, indent=2))

def remove_by_id(position_id):
    portfolio = load_portfolio()
    original_count = len(portfolio["positions"])
    
    portfolio["positions"] = [p for p in portfolio["positions"] if p.get("id") != position_id]
    
    if len(portfolio["positions"]) < original_count:
        save_portfolio(portfolio)
        print(f"✅ Removed position with ID: {position_id}")
    else:
        print(f"⚠️ No position found with ID: {position_id}")

def remove_by_symbol(symbol):
    portfolio = load_portfolio()
    original_count = len(portfolio["positions"])
    symbol_upper = symbol.upper()
    
    portfolio["positions"] = [p for p in portfolio["positions"] if p["symbol"] != symbol_upper]
    
    removed = original_count - len(portfolio["positions"])
    if removed > 0:
        save_portfolio(portfolio)
        print(f"✅ Removed {removed} position(s) for {symbol_upper}")
    else:
        print(f"⚠️ No positions found for {symbol_upper}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Remove a position")
    parser.add_argument("--id", help="Position ID to remove")
    parser.add_argument("--symbol", "-s", help="Remove all positions for symbol")
    
    args = parser.parse_args()
    
    if args.id:
        remove_by_id(args.id)
    elif args.symbol:
        remove_by_symbol(args.symbol)
    else:
        print("⚠️ Please specify --id or --symbol")
