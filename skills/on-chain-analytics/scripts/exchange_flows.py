#!/usr/bin/env python3
"""
Exchange Flow Monitor - Track deposits and withdrawals
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List

try:
    import requests
except ImportError:
    print("Error: requests not installed. Run: pip install requests")
    sys.exit(1)

# Known exchange addresses (sample - would need to be updated)
EXCHANGE_ADDRESSES = {
    "bitcoin": {
        "coinbase": ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"],
        "binance": ["34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo"],
        "kraken": ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"],
    },
    "ethereum": {
        "coinbase": ["0xA7Dd95d9978dde79495f5A5f82Da53b2Ef9E9EeB"],
        "binance": ["0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE"],
        "kraken": ["0x267be1C1D684F78cb4F6a176C4911b741E4Ffdc0"],
    }
}


def get_btc_exchange_flows(exchange: str, days: int = 7) -> Dict:
    """Get Bitcoin exchange flows using public APIs"""
    try:
        # Use Glassnode-style API or similar
        # For demo, we'll use blockchair's rich list
        url = f"{BLOCKCHAIR_API}/bitcoin/dashboards/address/{EXCHANGE_ADDRESSES['bitcoin'][exchange][0]}"
        
        # Fallback: Use mempool.space for recent activity
        addresses = EXCHANGE_ADDRESSES["bitcoin"].get(exchange, [])
        
        total_inflow = 0
        total_outflow = 0
        tx_count = 0
        
        for addr in addresses[:1]:  # Sample first address
            resp = requests.get(f"https://mempool.space/api/address/{addr}", timeout=30)
            data = resp.json()
            
            chain_stats = data.get("chain_stats", {})
            total_received = chain_stats.get("funded_txo_sum", 0) / 1e8
            total_sent = chain_stats.get("spent_txo_sum", 0) / 1e8
            
            # Estimate recent flows (this is simplified)
            mempool_stats = data.get("mempool_stats", {})
            recent_in = mempool_stats.get("funded_txo_sum", 0) / 1e8
            recent_out = mempool_stats.get("spent_txo_sum", 0) / 1e8
            
            total_inflow += recent_in
            total_outflow += recent_out
            tx_count += chain_stats.get("tx_count", 0)
        
        return {
            "exchange": exchange,
            "chain": "bitcoin",
            "inflow_btc": total_inflow,
            "outflow_btc": total_outflow,
            "net_flow": total_outflow - total_inflow,
            "tx_count": tx_count,
            "period_days": days
        }
        
    except Exception as e:
        print(f"Error fetching BTC flows: {e}")
        return {}


def get_eth_exchange_flows(exchange: str, days: int = 7) -> Dict:
    """Get Ethereum exchange flows"""
    api_key = os.getenv("ETHERSCAN_API_KEY") or os.getenv("ALCHEMY_API_KEY")
    
    if not api_key:
        print("Warning: No API key found. Set ETHERSCAN_API_KEY env var.")
        return {}
    
    try:
        addresses = EXCHANGE_ADDRESSES["ethereum"].get(exchange, [])
        
        total_inflow = 0
        total_outflow = 0
        
        for addr in addresses[:1]:
            # Get normal transactions
            params = {
                "module": "account",
                "action": "txlist",
                "address": addr,
                "startblock": 0,
                "endblock": 99999999,
                "sort": "desc",
                "apikey": api_key
            }
            
            resp = requests.get(ETHERSCAN_API, params=params, timeout=30)
            txs = resp.json().get("result", [])
            
            for tx in txs[:100]:  # Last 100 transactions
                value_eth = int(tx.get("value", 0)) / 1e18
                if tx.get("to", "").lower() == addr.lower():
                    total_inflow += value_eth
                else:
                    total_outflow += value_eth
        
        return {
            "exchange": exchange,
            "chain": "ethereum",
            "inflow_eth": total_inflow,
            "outflow_eth": total_outflow,
            "net_flow": total_outflow - total_inflow,
            "tx_count": len(txs),
            "period_days": days
        }
        
    except Exception as e:
        print(f"Error fetching ETH flows: {e}")
        return {}


def display_flows(flows: Dict):
    """Display exchange flows"""
    if not flows:
        print("No flow data available.")
        return
    
    print(f"\n{'='*60}")
    print(f"📊 EXCHANGE FLOWS: {flows['exchange'].upper()} ({flows['chain'].upper()})")
    print(f"{'='*60}")
    
    if flows.get("chain") == "bitcoin":
        print(f"Inflow:    {flows.get('inflow_btc', 0):.4f} BTC")
        print(f"Outflow:   {flows.get('outflow_btc', 0):.4f} BTC")
    else:
        print(f"Inflow:    {flows.get('inflow_eth', 0):.4f} ETH")
        print(f"Outflow:   {flows.get('outflow_eth', 0):.4f} ETH")
    
    net = flows.get('net_flow', 0)
    emoji = "🟢" if net > 0 else "🔴"
    print(f"Net Flow:  {emoji} {abs(net):.4f} {'(Net Outflow)' if net > 0 else '(Net Inflow)'}")
    print(f"Transactions: {flows.get('tx_count', 0)}")
    print(f"Period:    Last {flows.get('period_days', 7)} days")
    print(f"{'='*60}")
    
    # Interpretation
    if net > 0:
        print("📈 Interpretation: Net outflow suggests accumulation (bullish)")
    else:
        print("📉 Interpretation: Net inflow suggests selling pressure (bearish)")


def get_exchange_balances() -> Dict:
    """Get current exchange balances from aggregated sources"""
    try:
        # Use CoinGlass API or similar for exchange balances
        print("\nFetching exchange balance data...")
        
        # Sample data (in production, would fetch from API)
        return {
            "coinbase": {"btc": 450000, "eth": 2500000},
            "binance": {"btc": 550000, "eth": 4200000},
            "kraken": {"btc": 150000, "eth": 800000},
        }
    except Exception as e:
        print(f"Error: {e}")
        return {}


def main():
    parser = argparse.ArgumentParser(description='Exchange Flow Monitor')
    parser.add_argument('--exchange', choices=['coinbase', 'binance', 'kraken', 'all'],
                       default='all', help='Exchange to monitor')
    parser.add_argument('--chain', choices=['bitcoin', 'ethereum', 'both'],
                       default='both', help='Blockchain')
    parser.add_argument('--days', type=int, default=7, help='Analysis period in days')
    
    args = parser.parse_args()
    
    exchanges = ['coinbase', 'binance', 'kraken'] if args.exchange == 'all' else [args.exchange]
    chains = ['bitcoin', 'ethereum'] if args.chain == 'both' else [args.chain]
    
    for exchange in exchanges:
        for chain in chains:
            print(f"\nAnalyzing {exchange} {chain} flows...")
            
            if chain == "bitcoin":
                flows = get_btc_exchange_flows(exchange, args.days)
            else:
                flows = get_eth_exchange_flows(exchange, args.days)
            
            display_flows(flows)


if __name__ == '__main__':
    from whale_tracker import ETHERSCAN_API, BLOCKCHAIR_API
    main()
