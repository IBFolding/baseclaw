#!/usr/bin/env python3
"""
Social Media Bot - Performance Tracking Script
Track engagement metrics and follower growth
"""

import argparse
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

# Add skill root to path for imports
SKILL_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SKILL_DIR))

try:
    import requests
except ImportError:
    print(json.dumps({
        "success": False,
        "message": "Missing dependencies. Install: pip install requests",
        "data": None
    }))
    sys.exit(1)


def load_env():
    """Load environment variables from .env file"""
    env_file = SKILL_DIR / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    os.environ.setdefault(key, value)


def get_twitter_metrics(days: int = 7) -> dict:
    """Get Twitter/X performance metrics"""
    load_env()
    
    # This is a placeholder implementation
    # In production, you'd use Twitter API v2 to get actual metrics
    
    bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
    if not bearer_token:
        return {
            "success": False,
            "message": "Twitter bearer token not configured",
            "data": None
        }
    
    # Mock metrics for demonstration
    # In real implementation, fetch from Twitter Analytics API
    return {
        "success": True,
        "message": f"Twitter metrics for last {days} days",
        "data": {
            "platform": "twitter",
            "period_days": days,
            "metrics": {
                "posts": 12,
                "impressions": 15420,
                "engagements": 892,
                "engagement_rate": 5.78,
                "followers_gained": 45,
                "followers_lost": 3,
                "net_follower_change": 42
            },
            "top_post": {
                "text": "Trade update sample...",
                "impressions": 3400,
                "engagements": 245
            },
            "note": "Connect Twitter Analytics API for real metrics"
        }
    }


def get_telegram_metrics(channel: str, days: int = 7) -> dict:
    """Get Telegram channel metrics"""
    load_env()
    
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        return {
            "success": False,
            "message": "Telegram bot token not configured",
            "data": None
        }
    
    try:
        # Get channel info
        url = f"https://api.telegram.org/bot{bot_token}/getChat"
        response = requests.post(url, json={"chat_id": channel})
        response.raise_for_status()
        
        chat_info = response.json()
        
        if not chat_info.get("ok"):
            return {
                "success": False,
                "message": f"Failed to get channel info: {chat_info.get('description')}",
                "data": None
            }
        
        chat = chat_info["result"]
        
        # Get chat member count
        url = f"https://api.telegram.org/bot{bot_token}/getChatMemberCount"
        response = requests.post(url, json={"chat_id": channel})
        member_count = response.json().get("result", 0) if response.json().get("ok") else 0
        
        return {
            "success": True,
            "message": f"Telegram metrics for {channel}",
            "data": {
                "platform": "telegram",
                "channel": channel,
                "channel_title": chat.get("title", "Unknown"),
                "member_count": member_count,
                "period_days": days,
                "metrics": {
                    "member_count": member_count,
                    "note": "Detailed metrics require Telegram Bot API with admin access"
                }
            }
        }
    
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "message": f"Failed to get Telegram metrics: {str(e)}",
            "data": None
        }


def generate_report(days: int = 7) -> dict:
    """Generate comprehensive performance report"""
    load_env()
    
    report = {
        "generated_at": datetime.now().isoformat(),
        "period_days": days,
        "platforms": {}
    }
    
    # Twitter metrics
    twitter = get_twitter_metrics(days)
    if twitter["success"]:
        report["platforms"]["twitter"] = twitter["data"]
    
    # Telegram metrics for default channels
    default_channels = os.getenv("DEFAULT_TELEGRAM_CHANNELS", "").split(",")
    telegram_data = {}
    for channel in default_channels:
        channel = channel.strip()
        if channel:
            tg = get_telegram_metrics(channel, days)
            if tg["success"]:
                telegram_data[channel] = tg["data"]
    
    if telegram_data:
        report["platforms"]["telegram"] = telegram_data
    
    # Calculate totals
    total_posts = 0
    total_impressions = 0
    total_engagements = 0
    
    if "twitter" in report["platforms"]:
        tw = report["platforms"]["twitter"]
        total_posts += tw.get("metrics", {}).get("posts", 0)
        total_impressions += tw.get("metrics", {}).get("impressions", 0)
        total_engagements += tw.get("metrics", {}).get("engagements", 0)
    
    report["summary"] = {
        "total_posts": total_posts,
        "total_impressions": total_impressions,
        "total_engagements": total_engagements,
        "avg_engagement_rate": round(total_engagements / total_impressions * 100, 2) if total_impressions > 0 else 0
    }
    
    return {
        "success": True,
        "message": f"Performance report for last {days} days",
        "data": report
    }


def log_post_performance(platform: str, post_id: str, metrics: dict) -> dict:
    """Log post performance data"""
    DATA_DIR = SKILL_DIR / "data"
    DATA_DIR.mkdir(exist_ok=True)
    LOG_FILE = DATA_DIR / "performance_logs.jsonl"
    
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "platform": platform,
        "post_id": post_id,
        "metrics": metrics
    }
    
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(log_entry) + "\n")
    
    return {
        "success": True,
        "message": "Performance logged",
        "data": log_entry
    }


def main():
    parser = argparse.ArgumentParser(description="Track social media performance")
    parser.add_argument("--platform", "-p", choices=["twitter", "telegram"],
                       help="Platform to get metrics for")
    parser.add_argument("--days", "-d", type=int, default=7,
                       help="Number of days to analyze (default: 7)")
    parser.add_argument("--report", "-r", action="store_true",
                       help="Generate comprehensive report")
    parser.add_argument("--channel", "-c", help="Telegram channel to analyze")
    parser.add_argument("--log", action="store_true", help="Log post metrics (use with --post-id)")
    parser.add_argument("--post-id", help="Post ID to log metrics for")
    parser.add_argument("--impressions", type=int, help="Impression count to log")
    parser.add_argument("--engagements", type=int, help="Engagement count to log")
    
    args = parser.parse_args()
    
    if args.report:
        result = generate_report(args.days)
    elif args.log and args.post_id:
        metrics = {}
        if args.impressions:
            metrics["impressions"] = args.impressions
        if args.engagements:
            metrics["engagements"] = args.engagements
        result = log_post_performance(args.platform or "unknown", args.post_id, metrics)
    elif args.platform == "twitter":
        result = get_twitter_metrics(args.days)
    elif args.platform == "telegram":
        if args.channel:
            result = get_telegram_metrics(args.channel, args.days)
        else:
            # Use default channels
            load_env()
            channels = os.getenv("DEFAULT_TELEGRAM_CHANNELS", "").split(",")
            if channels and channels[0]:
                result = get_telegram_metrics(channels[0].strip(), args.days)
            else:
                result = {
                    "success": False,
                    "message": "No channel specified and no default channels configured",
                    "data": None
                }
    else:
        parser.print_help()
        sys.exit(1)
    
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
