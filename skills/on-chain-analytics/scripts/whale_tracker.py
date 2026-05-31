#!/usr/bin/env python3
"""
Whale Wallet Tracker - Monitor large crypto transactions
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from typing import Dict, List, Optional

try:
    import requests
except ImportError:
    print("Error: requests not installed. Run: pip install requests")
    sys.exit(1)

# API endpoints
ETHERSCAN_API = "https://api.etherscan.io/api"
BLOCKCHAIR_API = "https://api.blockchair.com"


def get_etherscan_key() -> Optional[str]:
    return os.getenv("ETHERSCAN_API_KEY") or os.getenv("ALCHEMY_API_KEY")


def get_eth_whale_transactions(min_value_eth: float = 100) -> List[Dict]:
    """Get large Ethereum transactions"""
    api_key = get_etherscan_key()
    if not api_key:
        print("Warning: No Etherscan API key found. Set ETHERSCAN_API_KEY env var.")
        return []
    
    # Get latest block
    params = {
        "module": "proxy",
        "action": "eth_blockNumber",
        "apikey": api_key
    }
    
    try:
        resp = requests.get(ETHERSCAN_API, params=params, timeout=30)
        latest_block = int(resp.json()["result"], 16)
        
        whale_txs = []
        
        # Check last 10 blocks for large transactions
        for block_num in range(latest_block - 10, latest_block + 1):
            params = {
                "module": "proxy",
                "action": "eth_getBlockByNumber",
                "tag": hex(block_num),
                "boolean": "true",
                "apikey": api_key
            }
            
            resp = requests.get(ETHERSCAN_API, params=params, timeout=30)
            block = resp.json().get("result", {})
            
            if block and "transactions" in block:
                for tx in block["transactions"]:
                    value_eth = int(tx.get("value", "0x0"), 16) / 1e18
                    if value_eth >= min_value_eth:
                        whale_txs.append({
                            "hash": tx["hash"],
                            "from": tx["from"],
                            "to": tx["to"],
                            "value_eth": value_eth,
                            "value_usd": value_eth * 3000,  # Approximate
                            "block": block_num,
                            "timestamp": datetime.now().isoformat()
                        })
        
        return sorted(whale_txs, key=lambda x: x["value_eth"], reverse=True)
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []


def get_btc_whale_transactions(min_value_btc: float = 100) -> List[Dict]:
    """Get large Bitcoin transactions using mempool.space API (free)"""
    try:
        # Get recent blocks
        resp = requests.get("https://mempool.space/api/blocks", timeout=30)
        blocks = resp.json()[:5]  # Last 5 blocks
        
        whale_txs = []
        
        for block in blocks:
            block_hash = block["id"]
            resp = requests.get(f"https://mempool.space/api/block/{block_hash}/txs", timeout=30)
            txs = resp.json()
            
            for tx in txs:
                total_output = sum(output.get("value", 0) for output in tx.get("vout", []))
                btc_value = total_output / 1e8
                
                if btc_value >= min_value_btc:
                    whale_txs.append({
                        "txid": tx["txid"],
                        "value_btc": btc_value,
                        "value_usd": btc_value * 60000,  # Approximate
                        "block_height": block["height"],
                        "fee": tx.get("fee", 0) / 1e8,
                        "timestamp": datetime.now().isoformat()
                    })
        
        return sorted(whale_txs, key=lambda x: x["value_btc"], reverse=True)[:20]
        
    except Exception as e:
        print(f"Error fetching BTC data: {e}")
        return []


def format_address(addr: str) -> str:
    """Format address for display"""
    if not addr:
        return "Unknown"
    return f"{addr[:8]}...{addr[-6:]}"


def display_transactions(txs: List[Dict], chain: str):
    """Display transactions in a formatted table"""
    if not txs:
        print(f"\nNo whale transactions found on {chain}.")
        return
    
    print(f"\n{'='*80}")
    print(f"🐋 WHALE TRANSACTIONS - {chain.upper()}")
    print(f"{'='*80}")
    print(f"{'Time':<20} {'Value':>15} {'USD':>15} {'TX Hash':>25}")
    print("-"*80)
    
    for tx in txs[:10]:  # Show top 10
        if chain == "ethereum":
            time_str = tx["timestamp"][:16]
            value_str = f"{tx['value_eth']:.2f} ETH"
            usd_str = f"${tx['value_usd']:,.0f}"
            hash_str = format_address(tx["hash"])
            print(f"{time_str:<20} {value_str:>15} {usd_str:>15} {hash_str:>25}")
        else:
            time_str = tx["timestamp"][:16]
            value_str = f"{tx['value_btc']:.2f} BTC"
            usd_str = f"${tx['value_usd']:,.0f}"
            hash_str = format_address(tx["txid"])
            print(f"{time_str:<20} {value_str:>15} {usd_str:>15} {hash_str:>25}")
    
    print(f"{'='*80}")
    print(f"Total whale transactions found: {len(txs)}")


def watch_mode(chain: str, min_value: float, interval: int = 60):
    """Continuous monitoring mode"""
    print(f"\n🔍 Starting whale watch mode on {chain}...")
    print(f"Monitoring transactions > ${min_value:,.0f}")
    print(f"Checking every {interval} seconds (Ctrl+C to stop)\n")
    
    seen_txs = set()
    
    try:
        while True:
            if chain == "ethereum":
                min_eth = min_value / 3000  # Approximate ETH price
                txs = get_eth_whale_transactions(min_eth)
            else:
                min_btc = min_value / 60000  # Approximate BTC price
                txs = get_btc_whale_transactions(min_btc)
            
            new_txs = [tx for tx in txs if tx.get("hash") or tx.get("txid") not in seen_txs]
            
            for tx in new_txs:
                tx_id = tx.get("hash") or tx.get("txid")
                seen_txs.add(tx_id)
                
                # Alert for new large transaction
                if len(seen_txs) > 0 and tx_id not in list(seen_txs)[:-10]:
                    print("\n🚨 NEW WHALE ALERT!")
                    display_transactions([tx], chain)
            
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print("\n\nStopping whale watch...")


def main():
    parser = argparse.ArgumentParser(description='Whale Transaction Tracker')
    parser.add_argument('--chain', choices=['bitcoin', 'ethereum'], default='bitcoin',
                       help='Blockchain to monitor')
    parser.add_argument('--min-value', type=float, default=1000000,
                       help='Minimum USD value to track')
    parser.add_argument('--watch', action='store_true',
                       help='Continuous monitoring mode')
    parser.add_argument('--interval', type=int, default=60,
                       help='Check interval in seconds (watch mode)')
    
    args = parser.parse_args()
    
    if args.watch:
        watch_mode(args.chain, args.min_value, args.interval)
    else:
        print(f"Fetching whale transactions on {args.chain}...")
        
        if args.chain == "ethereum":
            min_eth = args.min_value / 3000
            txs = get_eth_whale_transactions(min_eth)
        else:
            min_btc = args.min_value / 60000
            txs = get_btc_whale_transactions(min_btc)
        
        display_transactions(txs, args.chain)


if __name__ == '__main__':
    main()
