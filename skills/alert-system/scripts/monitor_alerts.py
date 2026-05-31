#!/usr/bin/env python3
"""
Monitor Alerts - Check prices and trigger alerts
Usage: ./monitor_alerts.py
"""

import json
import requests
from pathlib import Path
from datetime import datetime

ALERTS_FILE = Path.home() / ".openclaw" / "alerts" / "active_alerts.json"
ALERTS_HISTORY = Path.home() / ".openclaw" / "alerts" / "alert_history.json"

def load_alerts():
    if not ALERTS_FILE.exists():
        return {"alerts": []}
    return json.loads(ALERTS_FILE.read_text())

def save_alerts(data):
    ALERTS_FILE.write_text(json.dumps(data, indent=2))

def load_history():
    if not ALERTS_HISTORY.exists():
        return {"history": []}
    return json.loads(ALERTS_HISTORY.read_text())

def save_history(data):
    ALERTS_HISTORY.parent.mkdir(parents=True, exist_ok=True)
    ALERTS_HISTORY.write_text(json.dumps(data, indent=2))

def get_price(symbol):
    """Fetch current price from CoinGecko"""
    try:
        mappings = {
            "btc": "bitcoin", "eth": "ethereum", "sol": "solana",
            "ada": "cardano", "dot": "polkadot", "link": "chainlink",
            "matic": "polygon", "avax": "avalanche-2", "uni": "uniswap",
            "doge": "dogecoin", "xrp": "ripple", "ltc": "litecoin",
            "bnb": "binancecoin", "dot": "polkadot"
        }
        coin_id = mappings.get(symbol.lower(), symbol.lower())
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd"
        response = requests.get(url, timeout=10)
        data = response.json()
        return data.get(coin_id, {}).get("usd", 0)
    except Exception as e:
        print(f"⚠️  Error fetching {symbol}: {e}")
        return 0

def check_alert(alert, current_price):
    """Check if alert condition is met"""
    condition = alert["condition"]
    target = alert["target_price"]
    
    if condition == "above":
        return current_price >= target
    else:  # below
        return current_price <= target

def main():
    # Import notifier
    import sys
    sys.path.insert(0, str(Path(__file__).parent))
    from notifier import notify
    
    alerts_data = load_alerts()
    alerts = alerts_data.get("alerts", [])
    
    if not alerts:
        print("📭 No active alerts to monitor")
        return
    
    print(f"🔍 Monitoring {len(alerts)} alert(s)...\n")
    
    triggered = []
    history = load_history()
    
    for alert in alerts:
        if alert.get("triggered"):
            continue  # Skip already triggered
        
        symbol = alert["symbol"]
        current_price = get_price(symbol)
        
        if not current_price:
            print(f"⚠️  Could not fetch price for {symbol}")
            continue
        
        print(f"📊 {symbol}: ${current_price:,.2f} (target: {alert['condition']} ${alert['target_price']:,.2f})")
        
        if check_alert(alert, current_price):
            print(f"   🚨 ALERT TRIGGERED!")
            
            # Send notifications
            results = notify(alert, current_price)
            
            # Mark as triggered
            alert["triggered"] = True
            alert["triggered_at"] = datetime.now().isoformat()
            alert["triggered_price"] = current_price
            alert["notification_results"] = results
            
            triggered.append(alert)
            history["history"].append(alert)
    
    # Save updated alerts
    save_alerts(alerts_data)
    save_history(history)
    
    # Clean up triggered alerts
    alerts_data["alerts"] = [a for a in alerts if not a.get("triggered")]
    save_alerts(alerts_data)
    
    if triggered:
        print(f"\n✅ Triggered {len(triggered)} alert(s)")
    else:
        print(f"\n✓ No alerts triggered")

if __name__ == "__main__":
    main()
