#!/usr/bin/env python3
"""
Gas Price Tracker - Monitor Ethereum gas prices with alerts
"""

import argparse
import sys
import time
import os
from datetime import datetime
from typing import Dict, Optional

try:
    import requests
except ImportError:
    print("Error: requests not installed. Run: pip install requests")
    sys.exit(1)


def get_gas_prices() -> Optional[Dict]:
    """Get current Ethereum gas prices"""
    try:
        # Try Etherscan first
        api_key = os.getenv("ETHERSCAN_API_KEY")
        
        if api_key:
            resp = requests.get(
                f"https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey={api_key}",
                timeout=30
            )
            data = resp.json()
            if data.get('result'):
                r = data['result']
                return {
                    'safe': int(r.get('SafeGasPrice', 0)),
                    'standard': int(r.get('ProposeGasPrice', 0)),
                    'fast': int(r.get('FastGasPrice', 0)),
                    'rapid': int(r.get('FastGasPrice', 0)) + 10,
                    'timestamp': datetime.now().isoformat()
                }
        
        # Fallback to ethgasstation
        resp = requests.get("https://ethgasstation.info/json/ethgasAPI.json", timeout=30)
        data = resp.json()
        return {
            'safe': int(data.get('safeLow', 0)) / 10,
            'standard': int(data.get('average', 0)) / 10,
            'fast': int(data.get('fast', 0)) / 10,
            'rapid': int(data.get('fastest', 0)) / 10,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error fetching gas prices: {e}")
        return None


def display_gas_prices(prices: Dict):
    """Display gas prices in a formatted way"""
    if not prices:
        print("Unable to fetch gas prices.")
        return
    
    print(f"\n{'='*50}")
    print("⛽ ETHEREUM GAS PRICES")
    print(f"{'='*50}")
    print(f"Updated: {prices['timestamp'][:19]}")
    print(f"{'='*50}")
    print(f"🐌 Safe:      {prices['safe']:>6.1f} gwei")
    print(f"⚡ Standard:  {prices['standard']:>6.1f} gwei")
    print(f"🔥 Fast:      {prices['fast']:>6.1f} gwei")
    print(f"🚀 Rapid:     {prices['rapid']:>6.1f} gwei")
    print(f"{'='*50}")
    
    # Cost estimates
    eth_price = 3000  # Approximate
    
    print(f"\n--- Estimated Costs (@ ${eth_price}/ETH) ---")
    for label, gas in [("Safe", prices['safe']), ("Fast", prices['fast'])]:
        eth_cost = gas * 21000 / 1e9
        usd_cost = eth_cost * eth_price
        print(f"{label} ETH Transfer: ${usd_cost:.2f}")


def watch_mode(alert_threshold: Optional[float] = None, interval: int = 30):
    """Continuous monitoring mode"""
    print(f"\n🔍 Starting gas price watch mode...")
    if alert_threshold:
        print(f"Alert when gas > {alert_threshold} gwei")
    print(f"Checking every {interval} seconds (Ctrl+C to stop)\n")
    
    alerted = False
    
    try:
        while True:
            prices = get_gas_prices()
            
            if prices:
                now = datetime.now().strftime("%H:%M:%S")
                safe = prices['safe']
                fast = prices['fast']
                
                print(f"[{now}] Safe: {safe:.1f} | Fast: {fast:.1f} gwei", end="")
                
                if alert_threshold and fast > alert_threshold:
                    if not alerted:
                        print(f" ⚠️  ALERT: Gas > {alert_threshold} gwei!")
                        alerted = True
                    else:
                        print(" ⚠️ ")
                else:
                    if alerted and fast <= alert_threshold:
                        print(f" ✅ Gas back below {alert_threshold}")
                        alerted = False
                    else:
                        print()
            
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print("\n\nStopping gas watch...")


def main():
    parser = argparse.ArgumentParser(description='Gas Price Tracker')
    parser.add_argument('--alert', type=float, help='Alert threshold in gwei')
    parser.add_argument('--watch', action='store_true', help='Continuous monitoring')
    parser.add_argument('--interval', type=int, default=30, help='Check interval (seconds)')
    
    args = parser.parse_args()
    
    if args.watch:
        watch_mode(args.alert, args.interval)
    else:
        prices = get_gas_prices()
        display_gas_prices(prices)


if __name__ == '__main__':
    main()
