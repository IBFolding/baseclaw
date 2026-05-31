#!/usr/bin/env python3
"""
List Alerts - Show all active and historical alerts
Usage: ./list_alerts.py [--history]
"""

import json
import argparse
from pathlib import Path
from datetime import datetime

ALERTS_FILE = Path.home() / ".openclaw" / "alerts" / "active_alerts.json"
ALERTS_HISTORY = Path.home() / ".openclaw" / "alerts" / "alert_history.json"

def load_alerts():
    if not ALERTS_FILE.exists():
        return {"alerts": []}
    return json.loads(ALERTS_FILE.read_text())

def load_history():
    if not ALERTS_HISTORY.exists():
        return {"history": []}
    return json.loads(ALERTS_HISTORY.read_text())

def format_time(iso_string):
    """Format ISO timestamp"""
    try:
        dt = datetime.fromisoformat(iso_string)
        return dt.strftime("%Y-%m-%d %H:%M")
    except:
        return iso_string

def main():
    parser = argparse.ArgumentParser(description="List alerts")
    parser.add_argument("--history", "-H", action="store_true", help="Show alert history")
    
    args = parser.parse_args()
    
    if args.history:
        history = load_history()
        alerts = history.get("history", [])
        print("=" * 70)
        print(f"📜 ALERT HISTORY ({len(alerts)} triggered)")
        print("=" * 70)
    else:
        alerts_data = load_alerts()
        alerts = [a for a in alerts_data.get("alerts", []) if not a.get("triggered")]
        print("=" * 70)
        print(f"🔔 ACTIVE ALERTS ({len(alerts)})")
        print("=" * 70)
    
    if not alerts:
        print("\nNo alerts found.")
        return
    
    for alert in alerts:
        print(f"\n🆔 {alert['id']}")
        print(f"   Symbol: {alert['symbol']}")
        print(f"   Condition: Price goes {alert['condition']} ${alert['target_price']:,.2f}")
        print(f"   Channels: {', '.join(alert['channels'])}")
        print(f"   Created: {format_time(alert['created_at'])}")
        
        if alert.get("triggered"):
            print(f"   🚨 Triggered: {format_time(alert['triggered_at'])}")
            print(f"   Price at trigger: ${alert.get('triggered_price', 0):,.2f}")
        
        if alert.get("message"):
            print(f"   Message: {alert['message'][:50]}...")

if __name__ == "__main__":
    main()
