#!/usr/bin/env python3
"""
Calendar Manager - Find optimal meeting times and schedule events.
Usage: python calendar_manager.py --find-slots --duration 60
"""

import argparse
import os
from datetime import datetime, timedelta
from typing import List, Dict
import json


class CalendarManager:
    """Simple calendar management (works with Google Calendar API or local storage)."""
    
    def __init__(self, calendar_file: str = "~/.calendar.json"):
        self.calendar_file = os.path.expanduser(calendar_file)
        self.events = self._load_events()
    
    def _load_events(self) -> List[Dict]:
        """Load events from storage."""
        if os.path.exists(self.calendar_file):
            with open(self.calendar_file) as f:
                return json.load(f)
        return []
    
    def _save_events(self):
        """Save events to storage."""
        with open(self.calendar_file, "w") as f:
            json.dump(self.events, f, indent=2)
    
    def add_event(self, title: str, start: datetime, end: datetime, attendees: List[str] = None):
        """Add a new event."""
        event = {
            "id": len(self.events) + 1,
            "title": title,
            "start": start.isoformat(),
            "end": end.isoformat(),
            "attendees": attendees or []
        }
        self.events.append(event)
        self._save_events()
        print(f"✅ Added: {title} at {start}")
        return event
    
    def find_free_slots(self, duration_minutes: int = 60, days_ahead: int = 7) -> List[datetime]:
        """Find available time slots."""
        # Business hours: 9 AM - 6 PM
        start_hour = 9
        end_hour = 18
        
        slots = []
        now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        for day_offset in range(days_ahead):
            day = now + timedelta(days=day_offset)
            
            # Skip weekends
            if day.weekday() >= 5:  # Saturday = 5, Sunday = 6
                continue
            
            # Generate slots for this day
            current = day.replace(hour=start_hour)
            day_end = day.replace(hour=end_hour)
            
            while current + timedelta(minutes=duration_minutes) <= day_end:
                slot_end = current + timedelta(minutes=duration_minutes)
                
                # Check if slot conflicts with existing events
                if not self._has_conflict(current, slot_end):
                    slots.append(current)
                
                current += timedelta(minutes=30)  # 30-min increments
        
        return slots[:10]  # Return top 10 slots
    
    def _has_conflict(self, start: datetime, end: datetime) -> bool:
        """Check if time range conflicts with existing events."""
        for event in self.events:
            event_start = datetime.fromisoformat(event["start"])
            event_end = datetime.fromisoformat(event["end"])
            
            # Check overlap
            if start < event_end and end > event_start:
                return True
        return False
    
    def suggest_meeting_time(self, attendees: List[str], duration: int = 60) -> List[datetime]:
        """Suggest optimal meeting times for attendees."""
        # In real implementation, would check all attendees' calendars
        # For now, just find free slots
        return self.find_free_slots(duration)
    
    def list_events(self, days: int = 7):
        """List upcoming events."""
        now = datetime.now()
        cutoff = now + timedelta(days=days)
        
        upcoming = []
        for event in self.events:
            event_start = datetime.fromisoformat(event["start"])
            if now <= event_start <= cutoff:
                upcoming.append(event)
        
        upcoming.sort(key=lambda x: x["start"])
        return upcoming
    
    def send_invite(self, event_id: int, attendee_email: str):
        """Send calendar invite to attendee."""
        # In real implementation, would send .ics file via email
        event = next((e for e in self.events if e["id"] == event_id), None)
        if not event:
            print(f"❌ Event {event_id} not found")
            return
        
        if attendee_email not in event["attendees"]:
            event["attendees"].append(attendee_email)
            self._save_events()
        
        print(f"✅ Invited {attendee_email} to {event['title']}")


def main():
    parser = argparse.ArgumentParser(description="Calendar management tool")
    parser.add_argument("--add", help="Add event: 'Title|YYYY-MM-DD HH:MM|duration_minutes'")
    parser.add_argument("--find-slots", action="store_true", help="Find free time slots")
    parser.add_argument("--duration", type=int, default=60, help="Meeting duration in minutes")
    parser.add_argument("--list", action="store_true", help="List upcoming events")
    parser.add_argument("--invite", type=int, help="Event ID to send invite for")
    parser.add_argument("--attendee", help="Attendee email for invite")
    
    args = parser.parse_args()
    
    cal = CalendarManager()
    
    if args.add:
        parts = args.add.split("|")
        if len(parts) != 3:
            print("Format: Title|YYYY-MM-DD HH:MM|duration_minutes")
            return
        
        title, start_str, duration = parts
        start = datetime.strptime(start_str, "%Y-%m-%d %H:%M")
        end = start + timedelta(minutes=int(duration))
        
        cal.add_event(title, start, end)
    
    elif args.find_slots:
        slots = cal.find_free_slots(args.duration)
        print(f"\n📅 Available slots ({args.duration} min):")
        for i, slot in enumerate(slots, 1):
            print(f"  {i}. {slot.strftime('%A, %B %d at %I:%M %p')}")
    
    elif args.list:
        events = cal.list_events()
        print(f"\n📋 Upcoming events:")
        for event in events:
            start = datetime.fromisoformat(event["start"])
            print(f"  {event['title']} - {start.strftime('%Y-%m-%d %H:%M')}")
            if event["attendees"]:
                print(f"    Attendees: {', '.join(event['attendees'])}")
    
    elif args.invite and args.attendee:
        cal.send_invite(args.invite, args.attendee)
    
    else:
        print("Calendar Manager")
        print("\nExamples:")
        print("  Find slots: python calendar_manager.py --find-slots --duration 60")
        print("  Add event: python calendar_manager.py --add 'Meeting|2024-02-20 14:00|60'")
        print("  List events: python calendar_manager.py --list")


if __name__ == "__main__":
    main()
