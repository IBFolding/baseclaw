#!/usr/bin/env python3
"""
Test Alerts - Test notification channels
Usage: ./test_alerts.py --channels discord,slack,telegram
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import argparse
from notifier import send_discord, send_slack, send_telegram, send_email, send_sms, load_env

def main():
    parser = argparse.ArgumentParser(description="Test alert channels")
    parser.add_argument("--channels", "-c", default="discord",
                        help="Comma-separated channels to test")
    
    args = parser.parse_args()
    
    load_env()
    
    channels = [c.strip().lower() for c in args.channels.split(",")]
    test_message = "🧪 This is a test alert from your trading alert system!"
    
    print("=" * 60)
    print("🧪 TESTING NOTIFICATION CHANNELS")
    print("=" * 60)
    
    results = {}
    
    for channel in channels:
        print(f"\n📡 Testing {channel}...")
        
        if channel == "discord":
            results[channel] = send_discord(test_message)
        elif channel == "slack":
            results[channel] = send_slack(test_message)
        elif channel == "telegram":
            results[channel] = send_telegram(test_message)
        elif channel == "email":
            results[channel] = send_email("Test Alert", test_message)
        elif channel == "sms":
            results[channel] = send_sms("Test alert from trading system!")
        else:
            print(f"   ⚠️  Unknown channel: {channel}")
            continue
        
        status = "✅ OK" if results[channel] else "❌ FAILED"
        print(f"   {status}")
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for channel, success in results.items():
        status = "✅" if success else "❌"
        print(f"{status} {channel}")
    
    print(f"\nPassed: {passed}/{total}")

if __name__ == "__main__":
    main()
