# Twitter Automation Skill

## Overview

This skill enables **autonomous Twitter posting** for MoltMail without requiring the Twitter API. It uses browser automation (Playwright) to post tweets, reply to mentions, and engage with the community.

## Why Browser Automation?

- ✅ **100% Free** - No API fees or tier limitations
- ✅ **Full Access** - Can do everything a human user can
- ✅ **No Approval** - Works immediately without Twitter's API approval process
- ✅ **Natural Behavior** - Looks like normal user activity

## Installation

```bash
cd /Users/brain/.openclaw/workspace/skills/twitter-automation
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your Twitter credentials to `.env`:
```
TWITTER_USERNAME=your_username
TWITTER_PASSWORD=your_password
TWITTER_EMAIL=your_email@example.com
```

## Usage

### Command Line

```bash
# Post a tweet
node tweet.js "Hello from MoltMail! 🚀"

# Post with image
node tweet.js "Check out our new feature" --image ./screenshot.png

# Check mentions
node twitter-bot.js mentions

# Start the automation daemon
node daemon.js
```

### Programmatic API

```javascript
const { getTwitterIntegration } = require('./moltmail-integration');

const twitter = getTwitterIntegration();
await twitter.init();

// Auto-tweet when events happen
await twitter.onFeatureApproved({
  title: 'Dark Mode',
  builder_rewards_pool: 1000
});

await twitter.onMilestone({
  type: 'users',
  count: 1000
});

// Manual tweet
await twitter.tweet('Hello world!', {
  scheduledFor: '2026-02-10T09:00:00Z'
});
```

## Integration with MoltMail

Add to your backend routes:

```javascript
const { getTwitterIntegration } = require('../skills/twitter-automation/moltmail-integration');

// When a feature is approved
router.post('/features/:id/review', async (req, res) => {
  // ... your review logic ...
  
  const twitter = getTwitterIntegration();
  await twitter.onFeatureApproved(feature);
  
  res.json({ success: true });
});
```

## Files

- `twitter-bot.js` - Core automation class
- `daemon.js` - Background service for continuous operation
- `tweet.js` - CLI tool for manual tweeting
- `moltmail-integration.js` - Event handlers for MoltMail events

## Security Notes

- Credentials are stored in `.env` (not committed to git)
- Session cookies are saved locally for faster re-login
- 2FA is supported if enabled on your account
- Rate limiting is built-in to avoid Twitter restrictions

## Troubleshooting

If login fails:
1. Check credentials in `.env`
2. Delete `twitter-cookies.json` to force fresh login
3. Ensure 2FA code is current if enabled

If tweets fail:
1. Check Twitter isn't requiring verification
2. Verify you haven't hit daily tweet limits
3. Check network connectivity