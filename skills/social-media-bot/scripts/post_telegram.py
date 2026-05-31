#!/usr/bin/env python3
"""
Social Media Bot - Telegram Channel Posting Script
Broadcast messages to Telegram channels
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


def post_to_telegram(channel: str, text: str, image_path: str = None) -> dict:
    """Post a message to a Telegram channel"""
    load_env()
    
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        return {
            "success": False,
            "message": "Telegram bot token not configured. Check .env file.",
            "data": None
        }
    
    base_url = f"https://api.telegram.org/bot{bot_token}"
    
    try:
        if image_path and Path(image_path).exists():
            # Send photo with caption
            url = f"{base_url}/sendPhoto"
            with open(image_path, "rb") as f:
                files = {"photo": f}
                data = {
                    "chat_id": channel,
                    "caption": text,
                    "parse_mode": "HTML"
                }
                response = requests.post(url, files=files, data=data)
        else:
            # Send text message
            url = f"{base_url}/sendMessage"
            data = {
                "chat_id": channel,
                "text": text,
                "parse_mode": "HTML"
            }
            response = requests.post(url, json=data)
        
        response.raise_for_status()
        result = response.json()
        
        if result.get("ok"):
            message_id = result["result"]["message_id"]
            chat_id = result["result"]["chat"]["id"]
            
            return {
                "success": True,
                "message": f"Message sent to {channel}",
                "data": {
                    "message_id": message_id,
                    "chat_id": chat_id,
                    "channel": channel,
                    "text": text[:100] + "..." if len(text) > 100 else text,
                    "posted_at": datetime.now().isoformat()
                }
            }
        else:
            return {
                "success": False,
                "message": f"Telegram API error: {result.get('description', 'Unknown error')}",
                "data": result
            }
    
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "message": f"Failed to send message: {str(e)}",
            "data": None
        }


def broadcast_to_channels(channels: list, text: str, image_path: str = None) -> dict:
    """Broadcast a message to multiple channels"""
    results = []
    successes = 0
    failures = 0
    
    for channel in channels:
        channel = channel.strip()
        if not channel:
            continue
        
        result = post_to_telegram(channel, text, image_path)
        results.append({"channel": channel, "result": result})
        
        if result["success"]:
            successes += 1
        else:
            failures += 1
    
    return {
        "success": failures == 0,
        "message": f"Broadcast complete: {successes} sent, {failures} failed",
        "data": {
            "total": len(channels),
            "successes": successes,
            "failures": failures,
            "results": results
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Post to Telegram channels")
    parser.add_argument("--channel", "-c", help="Single channel (e.g., @yourchannel)")
    parser.add_argument("--channels", help="Comma-separated list of channels")
    parser.add_argument("--text", "-t", required=True, help="Message text (HTML supported)")
    parser.add_argument("--image", "-i", help="Path to image to attach")
    parser.add_argument("--format-json", action="store_true", help="Output raw JSON")
    
    args = parser.parse_args()
    
    # Determine target channels
    target_channels = []
    if args.channel:
        target_channels.append(args.channel)
    elif args.channels:
        target_channels = args.channels.split(",")
    else:
        # Try default from env
        load_env()
        default_channels = os.getenv("DEFAULT_TELEGRAM_CHANNELS", "")
        if default_channels:
            target_channels = default_channels.split(",")
    
    if not target_channels:
        result = {
            "success": False,
            "message": "No target channels specified. Use --channel, --channels, or set DEFAULT_TELEGRAM_CHANNELS",
            "data": None
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)
    
    # Send message(s)
    if len(target_channels) == 1:
        result = post_to_telegram(target_channels[0], args.text, args.image)
    else:
        result = broadcast_to_channels(target_channels, args.text, args.image)
    
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
