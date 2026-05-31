#!/usr/bin/env python3
"""
Set Alert - Create price alerts with notifications
Usage: ./set_alert.py --symbol BTC --above 50000 --channels discord,telegram
"""

import os
import json
import argparse
import uuid
from datetime import datetime
from pathlib import Path

ALERTS_DIR = Path.home() / ".openclaw" / "alerts"
ALERTS_FILE = ALERTS_DIR / "active_alerts.json"

def init_storage():
    ALERTS_DIR.mkdir(parents=True, exist_ok=True)
    if not ALERTS_FILE.exists():
        ALERTS_FILE.write_text(json.dumps({"alerts": []}))

def load_alerts():
    init_storage()
    return json.loads(ALERTS_FILE.read_text())

def save_alerts(data):
    ALERTS_FILE.write_text(json.dumps(data, indent=2))

def set_alert(symbol, condition_type, price, channels, message=None):
    """Create a new price alert"""
    alerts = load_alerts()
    
    alert_id = f"alert_{uuid.uuid4().hex[:8]}"
    
    alert = {
        "id": alert_id,
        "symbol": symbol.upper(),
        "condition": condition_type,  # "above" or "below"
        "target_price": float(price),
        "channels": channels,
        "message": message or f"{symbol.upper()} price alert triggered!",
        "created_at": datetime.now().isoformat(),
        "triggered": False,
        "trigger_count": 0
    }
    
    alerts["alerts"].append(alert)
    save_alerts(alerts)
    
    print(f"✅ Alert created: {alert_id}")
    print(f"   Symbol: {symbol.upper()}")
    print(f"   Condition: Price goes {condition_type} ${price:,.2f}")
    print(f"   Channels: {', '.join(channels)}")
    return alert

def main():
    parser = argparse.ArgumentParser(description="Set price alert")
    parser.add_argument("--symbol", "-s", required=True, help="Asset symbol (e.g., BTC)")
    parser.add_argument("--above", type=float, help="Alert when price goes ABOVE this value")
    parser.add_argument("--below", type=float, help="Alert when price goes BELOW this value")
    parser.add_argument("--channels", "-c", default="discord",
                        help="Comma-separated channels: discord,slack,telegram,email,sms")
    parser.add_argument("--message", "-m", help="Custom alert message")
    
    args = parser.parse_args()
    
    if not args.above and not args.below:
        print("❌ Please specify --above or --below")
        return
    
    if args.above and args.below:
        print("❌ Please specify only one of --above or --below")
        return
    
    condition = "above" if args.above else "below"
    price = args.above if args.above else args.below
    
    # Parse channels
    valid_channels = ["discord", "slack", "telegram", "email", "sms", "webhook"]
    channels = [c.strip().lower() for c in args.channels.split(",")]
    invalid = [c for c in channels if c not in valid_channels]
    if invalid:
        print(f"❌ Invalid channels: {invalid}")
        print(f"   Valid: {', '.join(valid_channels)}")
        return
    
    set_alert(args.symbol, condition, price, channels, args.message)

if __name__ == "__main__":
    main()
