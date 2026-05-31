#!/usr/bin/env python3
"""
Application Tracker - Track your job applications
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Data directory
DATA_DIR = Path.home() / ".openclaw"
APP_DIR = DATA_DIR / "job-applications"


def ensure_dir():
    """Create application directory"""
    APP_DIR.mkdir(parents=True, exist_ok=True)


def generate_app_id() -> str:
    """Generate unique application ID"""
    timestamp = datetime.now().strftime("%Y%m")
    count = len(list(APP_DIR.glob(f"APP-{timestamp}*.json"))) + 1
    return f"APP-{timestamp}-{count:03d}"


def add_application(
    job_id: str,
    title: str,
    company: str,
    source: str,
    url: str,
    notes: str = ""
) -> Dict:
    """Add a new job application"""
    ensure_dir()
    
    app_id = generate_app_id()
    
    application = {
        "id": app_id,
        "job_id": job_id,
        "title": title,
        "company": company,
        "source": source,
        "url": url,
        "status": "saved",  # saved, applied, interview, offer, rejected, ghosted
        "notes": notes,
        "applied_date": None,
        "follow_up_date": None,
        "created_at": datetime.now().isoformat()
    }
    
    filepath = APP_DIR / f"{app_id}.json"
    with open(filepath, 'w') as f:
        json.dump(application, f, indent=2)
    
    return application


def load_application(app_id: str) -> Optional[Dict]:
    """Load application by ID"""
    filepath = APP_DIR / f"{app_id}.json"
    if filepath.exists():
        with open(filepath) as f:
            return json.load(f)
    return None


def load_all_applications() -> List[Dict]:
    """Load all applications"""
    apps = []
    if APP_DIR.exists():
        for file in APP_DIR.glob("*.json"):
            with open(file) as f:
                apps.append(json.load(f))
    return sorted(apps, key=lambda x: x.get("created_at", ""), reverse=True)


def update_application(app_id: str, updates: Dict) -> bool:
    """Update application"""
    app = load_application(app_id)
    if not app:
        return False
    
    app.update(updates)
    
    filepath = APP_DIR / f"{app_id}.json"
    with open(filepath, 'w') as f:
        json.dump(app, f, indent=2)
    
    return True


def mark_applied(app_id: str, date: Optional[str] = None):
    """Mark application as applied"""
    applied_date = date or datetime.now().strftime("%Y-%m-%d")
    follow_up = (datetime.now() + __import__('datetime').timedelta(days=7)).strftime("%Y-%m-%d")
    
    if update_application(app_id, {
        "status": "applied",
        "applied_date": applied_date,
        "follow_up_date": follow_up
    }):
        print(f"✅ Marked {app_id} as applied on {applied_date}")
    else:
        print(f"Application {app_id} not found")


def mark_status(app_id: str, status: str):
    """Update application status"""
    valid_statuses = ["saved", "applied", "phone_screen", "interview", "offer", "rejected", "ghosted", "withdrawn"]
    
    if status not in valid_statuses:
        print(f"Invalid status. Use: {', '.join(valid_statuses)}")
        return
    
    if update_application(app_id, {"status": status}):
        print(f"✅ Updated {app_id} status to {status}")
    else:
        print(f"Application {app_id} not found")


def display_application(app: Dict):
    """Display application details"""
    status_emojis = {
        "saved": "💾",
        "applied": "📤",
        "phone_screen": "📞",
        "interview": "🗣️",
        "offer": "🎉",
        "rejected": "❌",
        "ghosted": "👻",
        "withdrawn": "🚫"
    }
    
    emoji = status_emojis.get(app['status'], "⚪")
    
    print(f"\n{'='*70}")
    print(f"{emoji} APPLICATION: {app['id']}")
    print(f"{'='*70}")
    print(f"Job Title:    {app['title']}")
    print(f"Company:      {app['company']}")
    print(f"Source:       {app['source']}")
    print(f"Status:       {app['status'].upper()}")
    print(f"URL:          {app['url']}")
    
    if app.get('applied_date'):
        print(f"Applied:      {app['applied_date']}")
    
    if app.get('follow_up_date'):
        days_until = (__import__('datetime').datetime.strptime(app['follow_up_date'], "%Y-%m-%d") - __import__('datetime').datetime.now()).days
        if days_until <= 0:
            print(f"Follow-up:    {app['follow_up_date']} (OVERDUE!)")
        else:
            print(f"Follow-up:    {app['follow_up_date']} (in {days_until} days)")
    
    if app.get('notes'):
        print(f"Notes:        {app['notes']}")
    
    print(f"{'='*70}")


def list_applications(status: Optional[str] = None):
    """List all applications"""
    apps = load_all_applications()
    
    if status:
        apps = [a for a in apps if a["status"] == status]
    
    if not apps:
        print("No applications found.")
        return
    
    status_emojis = {
        "saved": "💾",
        "applied": "📤",
        "phone_screen": "📞",
        "interview": "🗣️",
        "offer": "🎉",
        "rejected": "❌",
        "ghosted": "👻"
    }
    
    print(f"\n{'='*90}")
    print(f"{'ID':<12} {'Company':<20} {'Title':<35} {'Status':<15}")
    print(f"{'='*90}")
    
    counts = {}
    
    for app in apps:
        app_id = app['id']
        company = app['company'][:18]
        title = app['title'][:33]
        stat = app['status']
        emoji = status_emojis.get(stat, "⚪")
        
        counts[stat] = counts.get(stat, 0) + 1
        
        print(f"{app_id:<12} {company:<20} {title:<35} {emoji} {stat:<12}")
    
    print(f"{'='*90}")
    print(f"Total: {len(apps)} applications")
    print(f"Status breakdown: {', '.join(f'{v} {k}' for k, v in counts.items())}")


def show_stats():
    """Show application statistics"""
    apps = load_all_applications()
    
    if not apps:
        print("No applications found.")
        return
    
    stats = {}
    for app in apps:
        status = app.get('status', 'unknown')
        stats[status] = stats.get(status, 0) + 1
    
    print(f"\n{'='*50}")
    print("📊 APPLICATION STATISTICS")
    print(f"{'='*50}")
    print(f"Total Applications: {len(apps)}")
    print()
    
    for status, count in sorted(stats.items()):
        pct = (count / len(apps)) * 100
        bar = "█" * int(pct / 5)
        print(f"{status:<15}: {count:>3} ({pct:>5.1f}%) {bar}")
    
    # Response rate
    responded = sum(stats.get(s, 0) for s in ['phone_screen', 'interview', 'offer', 'rejected'])
    if stats.get('applied', 0) > 0:
        response_rate = (responded / stats.get('applied', 1)) * 100
        print(f"\nResponse Rate: {response_rate:.1f}%")
    
    print(f"{'='*50}")


def check_follow_ups():
    """Check for applications needing follow-up"""
    apps = load_all_applications()
    today = datetime.now()
    
    need_follow_up = []
    
    for app in apps:
        if app.get('follow_up_date'):
            follow_up = datetime.strptime(app['follow_up_date'], "%Y-%m-%d")
            if follow_up <= today and app['status'] == 'applied':
                need_follow_up.append(app)
    
    if need_follow_up:
        print(f"\n🚨 FOLLOW-UP NEEDED ({len(need_follow_up)} applications)")
        print(f"{'='*70}")
        for app in need_follow_up:
            print(f"  • {app['company']} - {app['title']}")
            print(f"    Applied: {app['applied_date']} | Follow-up: {app['follow_up_date']}")
        print(f"{'='*70}")
    else:
        print("\n✅ No follow-ups needed")


def main():
    parser = argparse.ArgumentParser(description='Application Tracker')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Add application
    add_parser = subparsers.add_parser('add', help='Add new application')
    add_parser.add_argument('--job-id', required=True, help='Job ID from scraper')
    add_parser.add_argument('--title', required=True, help='Job title')
    add_parser.add_argument('--company', required=True, help='Company name')
    add_parser.add_argument('--source', required=True, help='Job source')
    add_parser.add_argument('--url', required=True, help='Job URL')
    add_parser.add_argument('--notes', default='', help='Additional notes')
    
    # List applications
    list_parser = subparsers.add_parser('list', help='List applications')
    list_parser.add_argument('--status', choices=['saved', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'ghosted'])
    
    # Show details
    show_parser = subparsers.add_parser('show', help='Show application details')
    show_parser.add_argument('app_id', help='Application ID')
    
    # Mark as applied
    applied_parser = subparsers.add_parser('applied', help='Mark as applied')
    applied_parser.add_argument('app_id', help='Application ID')
    applied_parser.add_argument('--date', help='Application date (YYYY-MM-DD)')
    
    # Update status
    status_parser = subparsers.add_parser('status', help='Update status')
    status_parser.add_argument('app_id', help='Application ID')
    status_parser.add_argument('status', help='New status')
    
    # Stats
    subparsers.add_parser('stats', help='Show statistics')
    
    # Follow-ups
    subparsers.add_parser('followups', help='Check follow-ups needed')
    
    args = parser.parse_args()
    
    if args.command == 'add':
        app = add_application(
            job_id=args.job_id,
            title=args.title,
            company=args.company,
            source=args.source,
            url=args.url,
            notes=args.notes
        )
        print(f"✅ Application added: {app['id']}")
        display_application(app)
    
    elif args.command == 'list':
        list_applications(args.status)
    
    elif args.command == 'show':
        app = load_application(args.app_id)
        if app:
            display_application(app)
        else:
            print(f"Application {args.app_id} not found")
    
    elif args.command == 'applied':
        mark_applied(args.app_id, args.date)
    
    elif args.command == 'status':
        mark_status(args.app_id, args.status)
    
    elif args.command == 'stats':
        show_stats()
    
    elif args.command == 'followups':
        check_follow_ups()
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
