# Alert System Skill

Price alerts and notification system for trading.

## Features

- Price threshold alerts (above/below target)
- Webhook support (Discord, Slack, Telegram)
- Email alerts via SMTP
- SMS via Twilio
- Alert management (list, remove, test)

## Installation

```bash
pip install requests python-dotenv
```

## Environment Variables

Create `.env` file:

```bash
# Discord Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Slack Webhook  
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ALERT_EMAIL=recipient@example.com

# Twilio SMS
TWILIO_SID=your_account_sid
TWILIO_TOKEN=your_auth_token
TWILIO_FROM=+1234567890
TWILIO_TO=+0987654321
```

## Usage

### Set Price Alert

```bash
# Alert when BTC goes above $50,000
./set_alert.py --symbol BTC --above 50000 --channels discord,telegram

# Alert when ETH drops below $2,000
./set_alert.py --symbol ETH --below 2000 --channels email,sms

# Alert with custom message
./set_alert.py --symbol SOL --above 150 --message "Target reached! 🚀"
```

### List Active Alerts

```bash
./list_alerts.py
```

### Remove Alert

```bash
./remove_alert.py --id alert_123
```

### Test Channels

```bash
./test_alerts.py --channels discord,slack,telegram,email
```

### Monitor Alerts (run periodically)

```bash
./monitor_alerts.py  # Checks all alerts and sends notifications
```

## Commands

| Command | Description |
|---------|-------------|
| `set_alert.py` | Create a new price alert |
| `list_alerts.py` | Show all active alerts |
| `remove_alert.py` | Remove an alert by ID |
| `test_alerts.py` | Test notification channels |
| `monitor_alerts.py` | Check prices and trigger alerts |
