---
name: social-media-bot
description: Post trades and build social following across Twitter/X and Telegram. Schedule posts, track performance metrics, and automate trading-related social media updates.
metadata: {"clawdbot":{"emoji":"📱","requires":{"bins":["python3"]}}}
---

# Social Media Bot

Post trades and build your social following across Twitter/X and Telegram channels.

## Features

- **Twitter/X Posting** - Post trade updates, market analysis, and custom messages
- **Telegram Channel Updates** - Broadcast to Telegram channels
- **Scheduled Posts** - Queue posts for optimal timing
- **Performance Tracking** - Track engagement metrics and follower growth

## Usage

### Post to Twitter/X

```bash
python3 {baseDir}/scripts/post_twitter.py --text "Your message here"
```

**Post a trade:**
```bash
python3 {baseDir}/scripts/post_twitter.py --trade "Bought 1000 HYPE @ $15.20" --pnl "+5.2%"
```

**Post with image:**
```bash
python3 {baseDir}/scripts/post_twitter.py --text "Check this chart!" --image /path/to/chart.png
```

### Post to Telegram

```bash
python3 {baseDir}/scripts/post_telegram.py --channel "@yourchannel" --text "Your message"
```

**Post to multiple channels:**
```bash
python3 {baseDir}/scripts/post_telegram.py --channels "@channel1,@channel2" --text "Broadcast message"
```

### Schedule Posts

```bash
python3 {baseDir}/scripts/schedule_post.py --platform twitter --text "Scheduled message" --time "2025-02-20 09:00"
```

**List scheduled posts:**
```bash
python3 {baseDir}/scripts/schedule_post.py --list
```

**Cancel scheduled post:**
```bash
python3 {baseDir}/scripts/schedule_post.py --cancel <post_id>
```

### Track Performance

```bash
python3 {baseDir}/scripts/track_performance.py --platform twitter --days 7
```

**Full analytics report:**
```bash
python3 {baseDir}/scripts/track_performance.py --report
```

## Configuration

Create `{baseDir}/.env` with your API credentials:

```bash
# Twitter/X API (from developer.twitter.com)
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token

# Telegram (from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token

# Default channels
DEFAULT_TELEGRAM_CHANNELS=@channel1,@channel2
```

## Output Format

All scripts return JSON with:
- `success` - Boolean status
- `message` - Human-readable result
- `data` - Platform-specific data (post ID, URL, metrics)

## Scheduled Posts Storage

Scheduled posts are stored in `{baseDir}/data/scheduled_posts.jsonl`

## Performance Data

Engagement metrics are logged to `{baseDir}/data/performance_logs.jsonl`
