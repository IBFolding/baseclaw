#!/usr/bin/env python3
"""
Alert Notifier - Send notifications to various channels
"""

import os
import json
import requests
from pathlib import Path

def load_env():
    """Load environment variables from .env file"""
    env_file = Path.home() / ".openclaw" / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    os.environ.setdefault(key, value)

def send_discord(message, webhook_url=None):
    """Send notification to Discord webhook"""
    url = webhook_url or os.getenv("DISCORD_WEBHOOK_URL")
    if not url:
        print("⚠️  Discord webhook URL not configured")
        return False
    
    payload = {
        "content": message,
        "username": "Trading Alerts"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.status_code == 204
    except Exception as e:
        print(f"❌ Discord error: {e}")
        return False

def send_slack(message, webhook_url=None):
    """Send notification to Slack webhook"""
    url = webhook_url or os.getenv("SLACK_WEBHOOK_URL")
    if not url:
        print("⚠️  Slack webhook URL not configured")
        return False
    
    payload = {"text": message}
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Slack error: {e}")
        return False

def send_telegram(message, bot_token=None, chat_id=None):
    """Send notification to Telegram"""
    token = bot_token or os.getenv("TELEGRAM_BOT_TOKEN")
    chat = chat_id or os.getenv("TELEGRAM_CHAT_ID")
    
    if not token or not chat:
        print("⚠️  Telegram credentials not configured")
        return False
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Telegram error: {e}")
        return False

def send_email(subject, body, to_email=None):
    """Send email via SMTP"""
    import smtplib
    from email.mime.text import MIMEText
    
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    to_addr = to_email or os.getenv("ALERT_EMAIL")
    
    if not all([smtp_host, smtp_user, smtp_pass]):
        print("⚠️  Email SMTP not configured")
        return False
    
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = smtp_user
        msg["To"] = to_addr
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"❌ Email error: {e}")
        return False

def send_sms(message):
    """Send SMS via Twilio"""
    try:
        from twilio.rest import Client
    except ImportError:
        print("⚠️  Twilio not installed. Run: pip install twilio")
        return False
    
    sid = os.getenv("TWILIO_SID")
    token = os.getenv("TWILIO_TOKEN")
    from_num = os.getenv("TWILIO_FROM")
    to_num = os.getenv("TWILIO_TO")
    
    if not all([sid, token, from_num, to_num]):
        print("⚠️  Twilio credentials not configured")
        return False
    
    try:
        client = Client(sid, token)
        client.messages.create(body=message, from_=from_num, to=to_num)
        return True
    except Exception as e:
        print(f"❌ SMS error: {e}")
        return False

def notify(alert, current_price):
    """Send notification through configured channels"""
    load_env()
    
    symbol = alert["symbol"]
    condition = alert["condition"]
    target = alert["target_price"]
    channels = alert["channels"]
    message = alert.get("message", f"{symbol} alert triggered!")
    
    emoji = "🚀" if condition == "above" else "📉"
    full_message = f"{emoji} **{symbol} ALERT** {emoji}\n\n{message}\n\nCurrent Price: ${current_price:,.2f}\nTarget: ${target:,.2f}\nCondition: Price went {condition} target"
    
    results = {}
    
    for channel in channels:
        if channel == "discord":
            results["discord"] = send_discord(full_message)
        elif channel == "slack":
            results["slack"] = send_slack(full_message)
        elif channel == "telegram":
            results["telegram"] = send_telegram(full_message)
        elif channel == "email":
            subject = f"Trading Alert: {symbol}"
            results["email"] = send_email(subject, full_message)
        elif channel == "sms":
            sms_msg = f"{symbol} Alert: ${current_price:,.2f} went {condition} ${target:,.2f}"
            results["sms"] = send_sms(sms_msg)
    
    return results

if __name__ == "__main__":
    # Test notifications
    load_env()
    print("Testing notification channels...")
    
    test_alert = {
        "symbol": "BTC",
        "condition": "above",
        "target_price": 50000,
        "channels": ["discord"],
        "message": "Test alert"
    }
    
    results = notify(test_alert, 51000)
    print(f"Results: {results}")
