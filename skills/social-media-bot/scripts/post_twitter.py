#!/usr/bin/env python3
"""
Social Media Bot - Twitter/X Posting Script
Post trades, analysis, and custom messages to Twitter/X
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Add skill root to path for imports
SKILL_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SKILL_DIR))

try:
    import requests
    from requests_oauthlib import OAuth1
except ImportError:
    print(json.dumps({
        "success": False,
        "message": "Missing dependencies. Install: pip install requests requests_oauthlib",
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


def get_twitter_auth():
    """Get Twitter OAuth1 authentication"""
    return OAuth1(
        os.getenv("TWITTER_API_KEY"),
        os.getenv("TWITTER_API_SECRET"),
        os.getenv("TWITTER_ACCESS_TOKEN"),
        os.getenv("TWITTER_ACCESS_SECRET")
    )


def post_tweet(text: str, image_path: str = None) -> dict:
    """Post a tweet with optional image"""
    load_env()
    
    if not all([
        os.getenv("TWITTER_API_KEY"),
        os.getenv("TWITTER_API_SECRET"),
        os.getenv("TWITTER_ACCESS_TOKEN"),
        os.getenv("TWITTER_ACCESS_SECRET")
    ]):
        return {
            "success": False,
            "message": "Twitter credentials not configured. Check .env file.",
            "data": None
        }
    
    auth = get_twitter_auth()
    
    try:
        if image_path and Path(image_path).exists():
            # Post with media
            media_url = "https://upload.twitter.com/1.1/media/upload.json"
            with open(image_path, "rb") as f:
                media_response = requests.post(
                    media_url,
                    auth=auth,
                    files={"media": f}
                )
                media_response.raise_for_status()
                media_id = media_response.json()["media_id"]
            
            # Post tweet with media
            url = "https://api.twitter.com/2/tweets"
            payload = {
                "text": text,
                "media": {"media_ids": [str(media_id)]}
            }
        else:
            # Post text-only tweet
            url = "https://api.twitter.com/2/tweets"
            payload = {"text": text}
        
        response = requests.post(url, auth=auth, json=payload)
        response.raise_for_status()
        
        data = response.json()
        tweet_id = data.get("data", {}).get("id")
        
        return {
            "success": True,
            "message": f"Tweet posted successfully!",
            "data": {
                "tweet_id": tweet_id,
                "url": f"https://twitter.com/i/web/status/{tweet_id}",
                "text": text,
                "posted_at": datetime.now().isoformat()
            }
        }
    
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "message": f"Failed to post tweet: {str(e)}",
            "data": None
        }


def format_trade_post(trade_info: str, pnl: str = None) -> str:
    """Format a trade update post"""
    emojis = {"profit": "🟢", "loss": "🔴", "neutral": "⚪"}
    
    if pnl:
        pnl_clean = pnl.replace("%", "").replace("+", "").replace("-", "")
        try:
            pnl_val = float(pnl_clean)
            if pnl_val > 0:
                emoji = emojis["profit"]
            elif pnl_val < 0:
                emoji = emojis["loss"]
            else:
                emoji = emojis["neutral"]
        except ValueError:
            emoji = emojis["neutral"]
        
        return f"{emoji} Trade Update\n\n{trade_info}\n\n📊 PnL: {pnl}"
    
    return f"⚡ Trade Update\n\n{trade_info}"


def main():
    parser = argparse.ArgumentParser(description="Post to Twitter/X")
    parser.add_argument("--text", "-t", help="Tweet text")
    parser.add_argument("--trade", help="Trade info to format as a post")
    parser.add_argument("--pnl", help="PnL percentage for trade posts")
    parser.add_argument("--image", "-i", help="Path to image to attach")
    parser.add_argument("--format-json", action="store_true", help="Output raw JSON")
    
    args = parser.parse_args()
    
    if args.trade:
        text = format_trade_post(args.trade, args.pnl)
    elif args.text:
        text = args.text
    else:
        result = {
            "success": False,
            "message": "No content provided. Use --text or --trade",
            "data": None
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)
    
    result = post_tweet(text, args.image)
    print(json.dumps(result, indent=2))
    
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
