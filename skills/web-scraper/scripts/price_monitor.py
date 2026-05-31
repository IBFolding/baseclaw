#!/usr/bin/env python3
"""
Price Monitor - Track prices and get alerts on changes.
Usage: python price_monitor.py --url <url> --selector <css_selector> --threshold <price>
"""

import argparse
import json
import time
import re
from datetime import datetime
from pathlib import Path
import requests
from bs4 import BeautifulSoup

# Config
CACHE_DIR = Path.home() / ".price_monitor_cache"
CACHE_DIR.mkdir(exist_ok=True)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]


def fetch_price(url: str, selector: str, user_agent: str = None) -> dict:
    """Fetch current price from URL."""
    headers = {
        "User-Agent": user_agent or USER_AGENTS[0],
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, "html.parser")
        element = soup.select_one(selector)
        
        if not element:
            return {"error": f"Selector '{selector}' not found"}
        
        # Extract price text
        price_text = element.get_text(strip=True)
        
        # Parse price - handles $1,234.56, 1.234,56 €, etc.
        price_match = re.search(r'[\d,\.]+', price_text.replace(',', ''))
        if price_match:
            price = float(price_match.group())
        else:
            return {"error": f"Could not parse price from: {price_text}"}
        
        return {
            "price": price,
            "price_text": price_text,
            "url": url,
            "timestamp": datetime.now().isoformat(),
        }
    
    except requests.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}


def load_cache(name: str) -> dict:
    """Load cached price data."""
    cache_file = CACHE_DIR / f"{name}.json"
    if cache_file.exists():
        with open(cache_file) as f:
            return json.load(f)
    return {}


def save_cache(name: str, data: dict):
    """Save price data to cache."""
    cache_file = CACHE_DIR / f"{name}.json"
    with open(cache_file, "w") as f:
        json.dump(data, f, indent=2)


def check_price_drop(current: float, previous: float, threshold: float) -> bool:
    """Check if price dropped below threshold or by percentage."""
    if threshold < 1:  # Treat as percentage (0.1 = 10%)
        drop_pct = (previous - current) / previous
        return drop_pct >= threshold
    else:  # Treat as absolute amount
        return current <= threshold


def monitor(args):
    """Main monitoring loop."""
    print(f"🔍 Monitoring: {args.url}")
    print(f"📍 Selector: {args.selector}")
    print(f"🎯 Alert threshold: ${args.threshold}")
    print(f"⏱️  Check interval: {args.interval} seconds")
    print("-" * 50)
    
    cache_name = args.name or re.sub(r'[^\w]', '_', args.url)
    
    while True:
        result = fetch_price(args.url, args.selector)
        
        if "error" in result:
            print(f"❌ Error: {result['error']}")
        else:
            current_price = result["price"]
            print(f"💰 Current price: ${current_price:.2f} ({result['price_text']})")
            
            # Check against threshold
            if current_price <= args.threshold:
                print(f"🚨 ALERT: Price ${current_price:.2f} is below threshold ${args.threshold:.2f}!")
                if args.webhook:
                    send_webhook(args.webhook, result)
            
            # Check for price drop from previous
            cache = load_cache(cache_name)
            if cache.get("price"):
                prev_price = cache["price"]
                if current_price < prev_price:
                    drop = prev_price - current_price
                    drop_pct = (drop / prev_price) * 100
                    print(f"📉 Price dropped ${drop:.2f} ({drop_pct:.1f}%)")
            
            # Update cache
            save_cache(cache_name, result)
        
        if args.once:
            break
        
        print(f"😴 Sleeping {args.interval}s...")
        time.sleep(args.interval)


def send_webhook(webhook_url: str, data: dict):
    """Send alert to webhook (Discord, Slack, etc.)."""
    try:
        payload = {
            "content": f"🚨 Price Alert!\nPrice: ${data['price']:.2f}\nURL: {data['url']}",
        }
        requests.post(webhook_url, json=payload, timeout=5)
    except Exception as e:
        print(f"⚠️ Webhook failed: {e}")


def main():
    parser = argparse.ArgumentParser(description="Monitor prices and get alerts")
    parser.add_argument("--url", required=True, help="URL to monitor")
    parser.add_argument("--selector", required=True, help="CSS selector for price element")
    parser.add_argument("--threshold", type=float, required=True, help="Alert threshold price")
    parser.add_argument("--interval", type=int, default=300, help="Check interval in seconds (default: 300)")
    parser.add_argument("--name", help="Cache name (auto-generated from URL if not provided)")
    parser.add_argument("--webhook", help="Webhook URL for alerts (Discord/Slack)")
    parser.add_argument("--once", action="store_true", help="Check once and exit")
    
    args = parser.parse_args()
    monitor(args)


if __name__ == "__main__":
    main()
