#!/usr/bin/env python3
"""
Export Portfolio - Export positions to CSV or JSON
Usage: ./export_portfolio.py --format csv --output portfolio.csv
"""

import json
import csv
import argparse
from pathlib import Path
from datetime import datetime
import requests

PORTFOLIO_FILE = Path.home() / ".openclaw" / "portfolio" / "positions.json"

def load_portfolio():
    if not PORTFOLIO_FILE.exists():
        return {"positions": []}
    return json.loads(PORTFOLIO_FILE.read_text())

def get_price(symbol):
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
    entry = float(position["entry_price"])
    size = float(position["size"])
    side = position["side"]
    
    if side == "long":
        pnl = (current_price - entry) * size
        pnl_pct = ((current_price - entry) / entry) * 100 if entry > 0 else 0
    else:
        pnl = (entry - current_price) * size
        pnl_pct = ((entry - current_price) / entry) * 100 if entry > 0 else 0
    
    return {"pnl": pnl, "pnl_pct": pnl_pct, "current_price": current_price}

def export_csv(positions, output_path):
    """Export to CSV format"""
    fieldnames = [
        "symbol", "side", "entry_price", "current_price", "size",
        "position_value", "unrealized_pnl", "pnl_percent", 
        "exchange", "opened_at", "notes"
    ]
    
    with open(output_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for pos in positions:
            current_price = get_price(pos["symbol"])
            stats = calculate_pnl(pos, current_price)
            
            writer.writerow({
                "symbol": pos["symbol"],
                "side": pos["side"],
                "entry_price": pos["entry_price"],
                "current_price": current_price,
                "size": pos["size"],
                "position_value": current_price * float(pos["size"]),
                "unrealized_pnl": stats["pnl"],
                "pnl_percent": stats["pnl_pct"],
                "exchange": pos["exchange"],
                "opened_at": pos["opened_at"],
                "notes": pos.get("notes", "")
            })
    
    print(f"✅ Exported {len(positions)} positions to {output_path}")

def export_json(positions, output_path):
    """Export to JSON format"""
    enriched_positions = []
    
    for pos in positions:
        current_price = get_price(pos["symbol"])
        stats = calculate_pnl(pos, current_price)
        
        enriched = {
            **pos,
            "current_price": current_price,
            "position_value": current_price * float(pos["size"]),
            "unrealized_pnl": stats["pnl"],
            "pnl_percent": stats["pnl_pct"],
            "exported_at": datetime.now().isoformat()
        }
        enriched_positions.append(enriched)
    
    export_data = {
        "export_date": datetime.now().isoformat(),
        "total_positions": len(positions),
        "positions": enriched_positions
    }
    
    with open(output_path, 'w') as f:
        json.dump(export_data, f, indent=2)
    
    print(f"✅ Exported {len(positions)} positions to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Export portfolio data")
    parser.add_argument("--format", "-f", choices=["csv", "json"], required=True, help="Export format")
    parser.add_argument("--output", "-o", required=True, help="Output file path")
    
    args = parser.parse_args()
    
    portfolio = load_portfolio()
    positions = portfolio.get("positions", [])
    
    if not positions:
        print("⚠️ No positions to export")
        return
    
    if args.format == "csv":
        export_csv(positions, args.output)
    else:
        export_json(positions, args.output)

if __name__ == "__main__":
    main()
