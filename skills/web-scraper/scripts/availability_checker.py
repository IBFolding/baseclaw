#!/usr/bin/env python3
"""
Availability Checker - Monitor product availability and get restock alerts.
Usage: python availability_checker.py --url <url> --selector <check_selector>
"""

import argparse
import json
import time
from datetime import datetime
from pathlib import Path
import requests
from bs4 import BeautifulSoup

CACHE_DIR = Path.home() / ".availability_checker_cache"
CACHE_DIR.mkdir(exist_ok=True)


def check_availability(url: str, selector: str, out_of_stock_text: list = None) -> dict:
    """Check if product is available."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Check for out-of-stock indicators
        if out_of_stock_text:
            page_text = soup.get_text().lower()
            for text in out_of_stock_text:
                if text.lower() in page_text:
                    return {
                        "available": False,
                        "url": url,
                        "reason": f"Found: '{text}'",
                        "timestamp": datetime.now().isoformat(),
                    }
        
        # Check selector
        element = soup.select_one(selector)
        if element:
            text = element.get_text(strip=True).lower()
            available_keywords = ["add to cart", "buy now", "in stock", "available"]
            unavailable_keywords = ["out of stock", "sold out", "unavailable", "coming soon"]
            
            is_available = any(kw in text for kw in available_keywords)
            is_unavailable = any(kw in text for kw in unavailable_keywords)
            
            return {
                "available": is_available and not is_unavailable,
                "url": url,
                "button_text": element.get_text(strip=True),
                "timestamp": datetime.now().isoformat(),
            }
        
        return {
            "available": None,
            "url": url,
            "error": "Selector not found",
            "timestamp": datetime.now().isoformat(),
        }
    
    except requests.RequestException as e:
        return {
            "available": None,
            "url": url,
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }


def monitor(args):
    """Monitor availability in loop."""
    print(f"🔍 Monitoring: {args.url}")
    print(f"⏱️  Check interval: {args.interval} seconds")
    print("-" * 50)
    
    cache_name = args.name or "product"
    out_of_stock = args.out_of_stock.split(",") if args.out_of_stock else None
    
    while True:
        result = check_availability(args.url, args.selector, out_of_stock)
        
        if result.get("error"):
            print(f"❌ Error: {result['error']}")
        elif result["available"] is True:
            print(f"🎉 IN STOCK! {result.get('button_text', 'Available')}")
            # Check if was previously out of stock
            cache_file = CACHE_DIR / f"{cache_name}.json"
            if cache_file.exists():
                with open(cache_file) as f:
                    prev = json.load(f)
                if prev.get("available") is False:
                    print("🚨 RESTOCK ALERT! Was out of stock, now available!")
                    if args.webhook:
                        send_alert(args.webhook, result)
        elif result["available"] is False:
            print(f"😞 Out of stock: {result.get('reason') or result.get('button_text')}")
        else:
            print(f"⚠️ Unknown status")
        
        # Save cache
        cache_file = CACHE_DIR / f"{cache_name}.json"
        with open(cache_file, "w") as f:
            json.dump(result, f)
        
        if args.once:
            break
        
        time.sleep(args.interval)


def send_alert(webhook_url: str, data: dict):
    """Send restock alert."""
    try:
        payload = {
            "content": f"🎉 RESTOCK ALERT!\nProduct is now available!\nURL: {data['url']}",
        }
        requests.post(webhook_url, json=payload, timeout=5)
    except Exception as e:
        print(f"⚠️ Webhook failed: {e}")


def main():
    parser = argparse.ArgumentParser(description="Monitor product availability")
    parser.add_argument("--url", required=True, help="Product URL")
    parser.add_argument("--selector", default="button", help="CSS selector for buy button")
    parser.add_argument("--out-of-stock", help="Comma-separated out-of-stock indicators")
    parser.add_argument("--interval", type=int, default=60, help="Check interval in seconds")
    parser.add_argument("--name", help="Cache name")
    parser.add_argument("--webhook", help="Webhook URL for alerts")
    parser.add_argument("--once", action="store_true", help="Check once and exit")
    
    args = parser.parse_args()
    monitor(args)


if __name__ == "__main__":
    main()
