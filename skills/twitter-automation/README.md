# Twitter Automation Skill

Autonomous Twitter posting for MoltMail using browser automation.

## Setup

1. Install dependencies:
```bash
cd skills/twitter-automation
npm install
```

2. Configure credentials in `.env`:
```
TWITTER_USERNAME=your_username
TWITTER_PASSWORD=your_password
TWITTER_EMAIL=your_email@example.com
```

## Usage

```bash
# Post a simple tweet
node tweet.js "Hello from MoltMail! 🚀"

# Post with image
node tweet.js "Check out our new feature" --image ./screenshot.png

# Reply to a tweet
node reply.js TWEET_ID "Thanks for the feedback!"

# Run automation daemon (checks for mentions, posts scheduled)
node daemon.js
```

## API Integration

```javascript
const { TwitterBot } = require('./twitter-bot');

const bot = new TwitterBot();
await bot.login();
await bot.tweet('MoltMail update: New feature deployed!');
```