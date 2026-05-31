#!/usr/bin/env python3
"""
Remove Alert - Remove an alert by ID
Usage: ./remove_alert.py --id alert_123
"""

import json
import argparse
from pathlib import Path

ALERTS_FILE = Path.home() / ".openclaw" / "alerts" / "active_alerts.json"

def load_alerts():
    if not ALERTS_FILE.exists():
        return {"alerts": []}
    return json.loads(ALERTS_FILE.read_text())

def save_alerts(data):
    ALERTS_FILE.write_text(json.dumps(data, indent=2))

def remove_alert(alert_id):
    alerts_data = load_alerts()
    original_count = len(alerts_data["alerts"])
    
    alerts_data["alerts"] = [a for a in alerts_data["alerts"] if a["id"] != alert_id]
    
    if len(alerts_data["alerts"]) < original_count:
        save_alerts(alerts_data)
        print(f"✅ Removed alert: {alert_id}")
    else:
        print(f"⚠️  Alert not found: {alert_id}")

def main():
    parser = argparse.ArgumentParser(description="Remove an alert")
    parser.add_argument("--id", required=True, help="Alert ID to remove")
    
    args = parser.parse_args()
    remove_alert(args.id)

if __name__ == "__main__":
    main()
