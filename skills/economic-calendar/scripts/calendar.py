#!/usr/bin/env python3
"""
Economic Calendar - Track market-moving events
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path

try:
    import requests
except ImportError:
    print("Error: requests not installed. Run: pip install requests")
    sys.exit(1)

# Sample economic events (in production, would fetch from APIs)
FED_MEETINGS_2024 = [
    {"date": "2024-01-30", "event": "FOMC Meeting", "type": "fed", "impact": "high"},
    {"date": "2024-01-31", "event": "FOMC Rate Decision", "type": "fed", "impact": "high"},
    {"date": "2024-03-19", "event": "FOMC Meeting", "type": "fed", "impact": "high"},
    {"date": "2024-03-20", "event": "FOMC Rate Decision", "type": "fed", "impact": "high"},
    {"date": "2024-04-30", "event": "FOMC Meeting", "type": "fed", "impact": "high"},
    {"date": "2024-05-01", "event": "FOMC Rate Decision", "type": "fed", "impact": "high"},
    {"date": "2024-06-11", "event": "FOMC Meeting", "type": "fed", "impact": "high"},
    {"date": "2024-06-12", "event": "FOMC Rate Decision", "type": "fed", "impact": "high"},
    {"date": "2024-07-30", "event": "FOMC Meeting", "type": "fed", "impact": "high"},
    {"date": "2024-07-31", "event": "FOMC Rate Decision", "type": "fed", "impact": "high"},
    {"date": "2024-09-17", "event": "FOMC Meeting", "type": "fed", "impact": "high"},
    {"date": "2024-09-18", "event": "FOMC Rate Decision", "type": "fed", "impact": "high"},
    {"date": "2024-11-06", "event": "FOMC Meeting", "type": "fed", "impact": "high"},
    {"date": "2024-11-07", "event": "FOMC Rate Decision", "type": "fed", "impact": "high"},
    {"date": "2024-12-17", "event": "FOMC Meeting", "type": "fed", "impact": "high"},
    {"date": "2024-12-18", "event": "FOMC Rate Decision", "type": "fed", "impact": "high"},
]

# Monthly economic indicators
ECONOMIC_INDICATORS = [
    {"day": "1st Friday", "event": "Non-Farm Payrolls (NFP)", "type": "economic", "impact": "high"},
    {"day": "1st Friday", "event": "Unemployment Rate", "type": "economic", "impact": "high"},
    {"day": "10-15", "event": "CPI (Consumer Price Index)", "type": "economic", "impact": "high"},
    {"day": "10-15", "event": "Core CPI", "type": "economic", "impact": "high"},
    {"day": "10-15", "event": "PPI (Producer Price Index)", "type": "economic", "impact": "medium"},
    {"day": "15-20", "event": "Retail Sales", "type": "economic", "impact": "medium"},
    {"day": "20-25", "event": "Durable Goods Orders", "type": "economic", "impact": "medium"},
    {"day": "25-30", "event": "GDP (Quarterly)", "type": "economic", "impact": "high"},
    {"day": "Any", "event": "PMI Manufacturing", "type": "economic", "impact": "medium"},
    {"day": "Any", "event": "PMI Services", "type": "economic", "impact": "medium"},
    {"day": "Any", "event": "Consumer Confidence", "type": "economic", "impact": "medium"},
]

MAJOR_EARNINGS = [
    # Q1 2024
    {"date": "2024-02-01", "ticker": "AAPL", "company": "Apple Inc.", "type": "earnings"},
    {"date": "2024-01-30", "ticker": "MSFT", "company": "Microsoft", "type": "earnings"},
    {"date": "2024-02-21", "ticker": "NVDA", "company": "NVIDIA", "type": "earnings"},
    {"date": "2024-01-30", "ticker": "AMZN", "company": "Amazon", "type": "earnings"},
    {"date": "2024-01-30", "ticker": "GOOGL", "company": "Alphabet", "type": "earnings"},
    {"date": "2024-01-25", "ticker": "TSLA", "company": "Tesla", "type": "earnings"},
    {"date": "2024-02-20", "ticker": "WMT", "company": "Walmart", "type": "earnings"},
    {"date": "2024-02-13", "ticker": "UBER", "company": "Uber", "type": "earnings"},
    {"date": "2024-02-06", "ticker": "DIS", "company": "Disney", "type": "earnings"},
    {"date": "2024-02-02", "ticker": "META", "company": "Meta", "type": "earnings"},
]


def load_config() -> Dict:
    """Load user configuration"""
    config_path = Path.home() / ".openclaw" / "econ-config.json"
    if config_path.exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


def get_events(start_date: datetime, end_date: datetime, event_type: str = "all") -> List[Dict]:
    """Get events for date range"""
    events = []
    
    # Add Fed meetings
    if event_type in ["all", "fed"]:
        for meeting in FED_MEETINGS_2024:
            meeting_date = datetime.strptime(meeting["date"], "%Y-%m-%d")
            if start_date <= meeting_date <= end_date:
                events.append({
                    "date": meeting_date,
                    **meeting
                })
    
    # Add earnings
    if event_type in ["all", "earnings"]:
        for earnings in MAJOR_EARNINGS:
            earnings_date = datetime.strptime(earnings["date"], "%Y-%m-%d")
            if start_date <= earnings_date <= end_date:
                events.append({
                    "date": earnings_date,
                    **earnings
                })
    
    # Add economic indicators (approximate)
    if event_type in ["all", "economic"]:
        current = start_date.replace(day=1)
        while current <= end_date:
            # Add monthly indicators
            for indicator in ECONOMIC_INDICATORS:
                events.append({
                    "date": current.replace(day=15),
                    **indicator
                })
            current += timedelta(days=32)
            current = current.replace(day=1)
    
    # Sort by date
    return sorted(events, key=lambda x: x["date"])


def display_events(events: List[Dict], title: str = "Economic Calendar"):
    """Display events in formatted table"""
    if not events:
        print("No events found for the specified period.")
        return
    
    print(f"\n{'='*80}")
    print(f"📅 {title}")
    print(f"{'='*80}")
    print(f"{'Date':<12} {'Type':<12} {'Impact':<8} {'Event':<45}")
    print("-"*80)
    
    for event in events:
        date_str = event["date"].strftime("%Y-%m-%d")
        event_type = event.get("type", "unknown").upper()
        impact = event.get("impact", "-").upper()
        
        if event_type == "EARNINGS":
            name = f"{event.get('ticker', 'N/A')} - {event.get('company', '')}"
        else:
            name = event.get("event", "Unknown")
        
        emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(impact.lower(), "⚪")
        
        print(f"{date_str:<12} {event_type:<12} {emoji} {impact:<6} {name:<45}")
    
    print(f"{'='*80}")
    print(f"Total events: {len(events)}")


def check_alerts(events: List[Dict], hours_before: int = 24):
    """Check for upcoming events that need alerts"""
    now = datetime.now()
    alert_time = now + timedelta(hours=hours_before)
    
    alerts = []
    for event in events:
        if now <= event["date"] <= alert_time:
            alerts.append(event)
    
    if alerts:
        print(f"\n🚨 ALERTS: {len(alerts)} event(s) in the next {hours_before} hours!")
        for event in alerts:
            time_until = event["date"] - now
            hours = int(time_until.total_seconds() / 3600)
            print(f"  • {event.get('event', 'Unknown')} in {hours}h")


def export_to_ics(events: List[Dict], output_path: str):
    """Export events to iCalendar format"""
    try:
        from icalendar import Calendar, Event
    except ImportError:
        print("Error: icalendar not installed. Run: pip install icalendar")
        return
    
    cal = Calendar()
    cal.add('prodid', '-//Economic Calendar//EN')
    cal.add('version', '2.0')
    
    for event_data in events:
        event = Event()
        
        if event_data.get("type") == "earnings":
            summary = f"📊 {event_data.get('ticker', '')} Earnings"
        elif event_data.get("type") == "fed":
            summary = f"🏦 {event_data.get('event', 'Fed Event')}"
        else:
            summary = f"📈 {event_data.get('event', 'Economic Event')}"
        
        event.add('summary', summary)
        event.add('dtstart', event_data["date"].date())
        event.add('dtend', (event_data["date"] + timedelta(days=1)).date())
        
        if event_data.get("type") == "earnings":
            event.add('description', f"Company: {event_data.get('company', '')}\nTicker: {event_data.get('ticker', '')}")
        
        cal.add_component(event)
    
    with open(output_path, 'wb') as f:
        f.write(cal.to_ical())
    
    print(f"Exported {len(events)} events to {output_path}")


def main():
    parser = argparse.ArgumentParser(description='Economic Calendar')
    parser.add_argument('--date', type=str, help='Specific date (YYYY-MM-DD)')
    parser.add_argument('--week', action='store_true', help='Show this week')
    parser.add_argument('--month', action='store_true', help='Show this month')
    parser.add_argument('--days', type=int, default=7, help='Number of days ahead')
    parser.add_argument('--type', choices=['all', 'fed', 'earnings', 'economic'],
                       default='all', help='Event type filter')
    parser.add_argument('--alert', action='store_true', help='Check for alerts')
    parser.add_argument('--export', type=str, help='Export to iCal file')
    
    args = parser.parse_args()
    
    # Determine date range
    if args.date:
        start_date = datetime.strptime(args.date, "%Y-%m-%d")
        end_date = start_date + timedelta(days=1)
        title = f"Events for {args.date}"
    elif args.week:
        start_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=7)
        title = "Events This Week"
    elif args.month:
        start_date = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_month = start_date + timedelta(days=32)
        end_date = next_month.replace(day=1)
        title = "Events This Month"
    else:
        start_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=args.days)
        title = f"Next {args.days} Days"
    
    # Get events
    events = get_events(start_date, end_date, args.type)
    
    # Display
    display_events(events, title)
    
    # Check alerts
    if args.alert:
        config = load_config()
        hours_before = config.get("alert_hours_before", 24)
        check_alerts(events, hours_before)
    
    # Export
    if args.export:
        export_to_ics(events, args.export)


if __name__ == '__main__':
    main()
