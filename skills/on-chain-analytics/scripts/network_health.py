#!/usr/bin/env python3
"""
Network Health Monitor - Track blockchain network metrics
"""

import argparse
import sys
from typing import Dict

try:
    import requests
except ImportError:
    print("Error: requests not installed. Run: pip install requests")
    sys.exit(1)


def get_bitcoin_network_stats() -> Dict:
    """Get Bitcoin network statistics"""
    try:
        # Use mempool.space API (free, no key needed)
        stats = {}
        
        # Difficulty and hashrate
        resp = requests.get("https://mempool.space/api/v1/difficulty", timeout=30)
        difficulty_data = resp.json()
        stats['difficulty'] = difficulty_data.get('difficulty', 0)
        stats['difficulty_change'] = difficulty_data.get('difficultyChange', 0)
        
        # Hash rate
        resp = requests.get("https://mempool.space/api/v1/mining/hashrate/3d", timeout=30)
        hashrate_data = resp.json()
        if hashrate_data.get('hashrates'):
            latest = hashrate_data['hashrates'][-1]
            stats['hashrate_ehs'] = latest.get('avgHashrate', 0) / 1e18
        
        # Mempool stats
        resp = requests.get("https://mempool.space/api/mempool", timeout=30)
        mempool = resp.json()
        stats['mempool_size'] = mempool.get('vsize', 0)
        stats['mempool_txs'] = mempool.get('count', 0)
        
        # Fees
        resp = requests.get("https://mempool.space/api/v1/fees/recommended", timeout=30)
        fees = resp.json()
        stats['fee_fast'] = fees.get('fastestFee', 0)
        stats['fee_hour'] = fees.get('hourFee', 0)
        stats['fee_economy'] = fees.get('economyFee', 0)
        
        return stats
        
    except Exception as e:
        print(f"Error fetching BTC network stats: {e}")
        return {}


def get_ethereum_network_stats() -> Dict:
    """Get Ethereum network statistics"""
    try:
        stats = {}
        
        # Gas oracle from Etherscan (requires API key)
        import os
        api_key = os.getenv("ETHERSCAN_API_KEY")
        
        if api_key:
            resp = requests.get(
                f"https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey={api_key}",
                timeout=30
            )
            data = resp.json()
            if data.get('result'):
                result = data['result']
                stats['gas_safe'] = result.get('SafeGasPrice', 0)
                stats['gas_proposed'] = result.get('ProposeGasPrice', 0)
                stats['gas_fast'] = result.get('FastGasPrice', 0)
        else:
            # Use ethgasstation as fallback
            resp = requests.get("https://ethgasstation.info/json/ethgasAPI.json", timeout=30)
            data = resp.json()
            stats['gas_safe'] = data.get('safeLow', 0) / 10
            stats['gas_proposed'] = data.get('average', 0) / 10
            stats['gas_fast'] = data.get('fast', 0) / 10
        
        # Network stats from Etherscan
        if api_key:
            resp = requests.get(
                f"https://api.etherscan.io/api?module=stats&action=ethsupply&apikey={api_key}",
                timeout=30
            )
            data = resp.json()
            if data.get('result'):
                stats['eth_supply'] = int(data['result']) / 1e18
        
        return stats
        
    except Exception as e:
        print(f"Error fetching ETH network stats: {e}")
        return {}


def display_bitcoin_stats(stats: Dict):
    """Display Bitcoin network statistics"""
    if not stats:
        print("No Bitcoin network data available.")
        return
    
    print(f"\n{'='*60}")
    print("₿ BITCOIN NETWORK HEALTH")
    print(f"{'='*60}")
    
    if 'hashrate_ehs' in stats:
        print(f"Hash Rate:        {stats['hashrate_ehs']:.2f} EH/s")
    
    if 'difficulty' in stats:
        difficulty_th = stats['difficulty'] / 1e12
        print(f"Difficulty:       {difficulty_th:.2f} T")
    
    if 'difficulty_change' in stats:
        change = stats['difficulty_change']
        emoji = "📈" if change > 0 else "📉"
        print(f"Next Diff Change: {emoji} {change:+.2f}%")
    
    print(f"\n--- Mempool ---")
    print(f"Size:             {stats.get('mempool_size', 0) / 1e6:.2f} MB")
    print(f"Pending TXs:      {stats.get('mempool_txs', 0):,}")
    
    print(f"\n--- Fees (sat/vB) ---")
    print(f"⚡ Fast:          {stats.get('fee_fast', 0)} sat/vB")
    print(f"🐢 1 Hour:        {stats.get('fee_hour', 0)} sat/vB")
    print(f"🐌 Economy:       {stats.get('fee_economy', 0)} sat/vB")
    
    # Health assessment
    mempool_size = stats.get('mempool_size', 0) / 1e6
    if mempool_size < 10 and stats.get('fee_fast', 0) < 20:
        health = "✅ HEALTHY - Low congestion, low fees"
    elif mempool_size < 50:
        health = "⚠️  MODERATE - Some congestion"
    else:
        health = "🔴 CONGESTED - High fees, consider waiting"
    
    print(f"\n{health}")
    print(f"{'='*60}")


def display_ethereum_stats(stats: Dict):
    """Display Ethereum network statistics"""
    if not stats:
        print("No Ethereum network data available.")
        return
    
    print(f"\n{'='*60}")
    print("⟠ ETHEREUM NETWORK HEALTH")
    print(f"{'='*60}")
    
    if 'eth_supply' in stats:
        supply_m = stats['eth_supply'] / 1e6
        print(f"ETH Supply:       {supply_m:.2f}M ETH")
    
    print(f"\n--- Gas Prices (gwei) ---")
    print(f"🐌 Safe:          {stats.get('gas_safe', 0)} gwei")
    print(f"⚡ Standard:      {stats.get('gas_proposed', 0)} gwei")
    print(f"🔥 Fast:          {stats.get('gas_fast', 0)} gwei")
    
    # Estimate transaction costs
    gas_fast = stats.get('gas_fast', 0)
    eth_transfer_cost = gas_fast * 21000 / 1e9
    erc20_transfer_cost = gas_fast * 65000 / 1e9
    swap_cost = gas_fast * 150000 / 1e9
    
    print(f"\n--- Estimated TX Costs (@ ${3000}/ETH) ---")
    print(f"ETH Transfer:     ${eth_transfer_cost * 3000:.2f}")
    print(f"ERC20 Transfer:   ${erc20_transfer_cost * 3000:.2f}")
    print(f"Token Swap:       ${swap_cost * 3000:.2f}")
    
    # Health assessment
    if gas_fast < 20:
        health = "✅ HEALTHY - Low gas prices, good time to transact"
    elif gas_fast < 50:
        health = "⚠️  MODERATE - Normal gas prices"
    else:
        health = "🔴 EXPENSIVE - Consider L2 or waiting"
    
    print(f"\n{health}")
    print(f"{'='*60}")


def main():
    parser = argparse.ArgumentParser(description='Network Health Monitor')
    parser.add_argument('--chain', choices=['bitcoin', 'ethereum', 'both'],
                       default='both', help='Blockchain to check')
    
    args = parser.parse_args()
    
    chains = ['bitcoin', 'ethereum'] if args.chain == 'both' else [args.chain]
    
    for chain in chains:
        print(f"\nFetching {chain} network stats...")
        
        if chain == 'bitcoin':
            stats = get_bitcoin_network_stats()
            display_bitcoin_stats(stats)
        else:
            stats = get_ethereum_network_stats()
            display_ethereum_stats(stats)


if __name__ == '__main__':
    main()
