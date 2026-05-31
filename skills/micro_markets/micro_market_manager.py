#!/usr/bin/env python3
"""
Polymarket Micro-Expiry Market Manager
Handles rotating 5min and 15min markets for BTC, ETH, SOL, XRP
"""

import requests
import json
import re
import time
from datetime import datetime
from typing import Dict, Optional

class MicroMarketManager:
    """Manages rotating micro-expiry markets on Polymarket"""
    
    def __init__(self):
        self.base_url = "https://polymarket.com"
        self.api_url = "https://gamma-api.polymarket.com"
        self.current_markets = {
            "5min": {},
            "15min": {}
        }
        self.last_update = 0
        self.update_interval = 300  # 5 minutes
    
    def discover_markets(self, symbol: str, expiry: str = "5m") -> Optional[Dict]:
        """
        Discover current market for a symbol and expiry
        
        Args:
            symbol: BTC, ETH, SOL, XRP
            expiry: 5m or 15m
        
        Returns:
            Dict with url, slug, expiry_time or None
        """
        try:
            # Search Polymarket
            search_url = f"{self.base_url}/search?q={symbol.lower()}+updown+{expiry}"
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
            
            response = requests.get(search_url, headers=headers, timeout=10)
            
            # Pattern to match market URLs
            pattern = rf'href="(/event/{symbol.lower()}-updown-{expiry}-(\d+))"'
            matches = re.findall(pattern, response.text, re.IGNORECASE)
            
            if matches:
                path, timestamp = matches[0]
                expiry_time = datetime.fromtimestamp(int(timestamp))
                
                return {
                    "symbol": symbol.upper(),
                    "expiry": expiry,
                    "url": f"{self.base_url}{path}",
                    "slug": path.split('/')[-1],
                    "timestamp": int(timestamp),
                    "expiry_time": expiry_time.isoformat(),
                    "expires_in_minutes": (expiry_time - datetime.now()).total_seconds() / 60
                }
            
        except Exception as e:
            print(f"Error discovering {symbol} {expiry}: {e}")
        
        return None
    
    def update_all_markets(self) -> Dict:
        """Update all market listings"""
        symbols = ["BTC", "ETH", "SOL", "XRP"]
        expiries = ["5m", "15m"]
        
        for expiry in expiries:
            for symbol in symbols:
                market = self.discover_markets(symbol, expiry)
                if market:
                    self.current_markets[expiry][symbol] = market
        
        self.last_update = time.time()
        return self.current_markets
    
    def get_active_markets(self, expiry: str = "5m") -> Dict:
        """Get currently active markets for an expiry type"""
        # Update if stale
        if time.time() - self.last_update > self.update_interval:
            self.update_all_markets()
        
        return self.current_markets.get(expiry, {})
    
    def get_market_url(self, symbol: str, expiry: str = "5m") -> Optional[str]:
        """Get current market URL for a symbol/expiry"""
        markets = self.get_active_markets(expiry)
        market = markets.get(symbol.upper())
        return market["url"] if market else None
    
    def is_market_expired(self, symbol: str, expiry: str = "5m") -> bool:
        """Check if current market has expired"""
        markets = self.get_active_markets(expiry)
        market = markets.get(symbol.upper())
        
        if not market:
            return True
        
        expiry_time = datetime.fromisoformat(market["expiry_time"])
        return datetime.now() > expiry_time

# Global instance
market_manager = MicroMarketManager()

if __name__ == "__main__":
    # Test
    print("Discovering current micro-expiry markets...\n")
    
    markets = market_manager.update_all_markets()
    
    for expiry, symbols in markets.items():
        print(f"\n{expiry} Markets:")
        print("-" * 50)
        for symbol, market in symbols.items():
            print(f"{symbol}: {market['url']}")
            print(f"  Expires: {market['expiry_time']}")
            print(f"  In: {market['expires_in_minutes']:.1f} minutes\n")
