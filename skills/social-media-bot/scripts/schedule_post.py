#!/usr/bin/env python3
"""
Social Media Bot - Post Scheduling Script
Schedule posts for optimal timing
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4

# Add skill root to path for imports
SKILL_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SKILL_DIR))

DATA_DIR = SKILL_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
SCHEDULE_FILE = DATA_DIR / "scheduled_posts.jsonl"


def load_scheduled_posts() -> list:
    """Load all scheduled posts"""
    if not SCHEDULE_FILE.exists():
        return []
    
    posts = []
    with open(SCHEDULE_FILE) as f:
        for line in f:
            if line.strip():
                posts.append(json.loads(line))
    return posts


def save_scheduled_post(post: dict):
    """Save a scheduled post to the file"""
    with open(SCHEDULE_FILE, "a") as f:
        f.write(json.dumps(post) + "\n")


def schedule_post(platform: str, text: str, scheduled_time: str, image_path: str = None) -> dict:
    """Schedule a post for later"""
    try:
        # Parse scheduled time
        scheduled_dt = datetime.fromisoformat(scheduled_time.replace("Z", "+00:00"))
    except ValueError:
        try:
            # Try common formats
            scheduled_dt = datetime.strptime(scheduled_time, "%Y-%m-%d %H:%M")
        except ValueError:
            return {
                "success": False,
                "message": f"Invalid time format. Use ISO format or 'YYYY-MM-DD HH:MM'",
                "data": None
            }
    
    # Check if time is in the future
    if scheduled_dt < datetime.now():
        return {
            "success": False,
            "message": "Scheduled time must be in the future",
            "data": None
        }
    
    post = {
        "id": str(uuid4())[:8],
        "platform": platform,
        "text": text,
        "image_path": image_path,
        "scheduled_time": scheduled_dt.isoformat(),
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    
    save_scheduled_post(post)
    
    return {
        "success": True,
        "message": f"Post scheduled for {scheduled_dt.strftime('%Y-%m-%d %H:%M')}",
        "data": post
    }


def list_scheduled_posts(status: str = None) -> dict:
    """List all scheduled posts"""
    posts = load_scheduled_posts()
    
    if status:
        posts = [p for p in posts if p.get("status") == status]
    
    # Sort by scheduled time
    posts.sort(key=lambda x: x.get("scheduled_time", ""))
    
    pending = len([p for p in posts if p.get("status") == "pending"])
    sent = len([p for p in posts if p.get("status") == "sent"])
    failed = len([p for p in posts if p.get("status") == "failed"])
    
    return {
        "success": True,
        "message": f"Found {len(posts)} scheduled posts ({pending} pending, {sent} sent, {failed} failed)",
        "data": {
            "total": len(posts),
            "pending": pending,
            "sent": sent,
            "failed": failed,
            "posts": posts
        }
    }


def cancel_scheduled_post(post_id: str) -> dict:
    """Cancel a scheduled post"""
    posts = load_scheduled_posts()
    
    updated = False
    for post in posts:
        if post.get("id") == post_id:
            post["status"] = "cancelled"
            updated = True
            break
    
    if not updated:
        return {
            "success": False,
            "message": f"Post with ID {post_id} not found",
            "data": None
        }
    
    # Rewrite file
    with open(SCHEDULE_FILE, "w") as f:
        for post in posts:
            f.write(json.dumps(post) + "\n")
    
    return {
        "success": True,
        "message": f"Post {post_id} cancelled",
        "data": {"post_id": post_id}
    }


def process_due_posts() -> dict:
    """Check and process any due scheduled posts"""
    posts = load_scheduled_posts()
    now = datetime.now()
    
    processed = []
    for post in posts:
        if post.get("status") != "pending":
            continue
        
        scheduled_time = datetime.fromisoformat(post["scheduled_time"].replace("Z", "+00:00"))
        
        if scheduled_time <= now:
            # Time to post
            platform = post["platform"]
            text = post["text"]
            image = post.get("image_path")
            
            if platform == "twitter":
                script = SKILL_DIR / "scripts" / "post_twitter.py"
                cmd = ["python3", str(script), "--text", text]
                if image:
                    cmd.extend(["--image", image])
            elif platform == "telegram":
                script = SKILL_DIR / "scripts" / "post_telegram.py"
                cmd = ["python3", str(script), "--text", text]
                if image:
                    cmd.extend(["--image", image])
            else:
                post["status"] = "failed"
                post["error"] = f"Unknown platform: {platform}"
                continue
            
            try:
                result = subprocess.run(cmd, capture_output=True, text=True)
                output = json.loads(result.stdout)
                
                if output.get("success"):
                    post["status"] = "sent"
                    post["sent_at"] = datetime.now().isoformat()
                else:
                    post["status"] = "failed"
                    post["error"] = output.get("message", "Unknown error")
                
                processed.append(post)
            except Exception as e:
                post["status"] = "failed"
                post["error"] = str(e)
                processed.append(post)
    
    # Rewrite file with updated statuses
    with open(SCHEDULE_FILE, "w") as f:
        for post in posts:
            f.write(json.dumps(post) + "\n")
    
    return {
        "success": True,
        "message": f"Processed {len(processed)} due posts",
        "data": {"processed": processed}
    }


def main():
    parser = argparse.ArgumentParser(description="Schedule social media posts")
    parser.add_argument("--platform", "-p", choices=["twitter", "telegram"],
                       help="Platform to post to")
    parser.add_argument("--text", "-t", help="Post content")
    parser.add_argument("--time", help="Scheduled time (ISO or 'YYYY-MM-DD HH:MM')")
    parser.add_argument("--image", "-i", help="Path to image")
    parser.add_argument("--list", action="store_true", help="List scheduled posts")
    parser.add_argument("--cancel", metavar="POST_ID", help="Cancel a scheduled post")
    parser.add_argument("--process", action="store_true", help="Process due posts (run from cron)")
    parser.add_argument("--status", choices=["pending", "sent", "failed", "cancelled"],
                       help="Filter by status")
    
    args = parser.parse_args()
    
    if args.list:
        result = list_scheduled_posts(args.status)
    elif args.cancel:
        result = cancel_scheduled_post(args.cancel)
    elif args.process:
        result = process_due_posts()
    elif args.platform and args.text and args.time:
        result = schedule_post(args.platform, args.text, args.time, args.image)
    else:
        parser.print_help()
        sys.exit(1)
    
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
