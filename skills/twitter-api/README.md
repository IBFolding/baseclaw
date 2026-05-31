# Twitter API Skill

Twitter API v2 integration using OAuth 2.0 authentication.

## Setup

1. **Add credentials to your main .env file** (in workspace root):
```
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
```

2. **Install dependencies**:
```bash
cd skills/twitter-api
npm install
```

3. **First-time authentication**:
```bash
node tweet.js "hello world"
```

This will:
- Open authorization URL
- You log in and authorize
- Paste the code back
- Token gets saved for future use

## Usage

```bash
# Post a tweet
node tweet.js "Your tweet text"

# Post with specific text
node tweet.js "hello I am alive. 🤖"
```

## Features

- ✅ OAuth 2.0 authentication
- ✅ Automatic token refresh
- ✅ Simple tweet posting
- ✅ Token persistence

## API Access

With OAuth 2.0 you get:
- **tweet.write** - Post tweets
- **tweet.read** - Read tweets
- **users.read** - User info
- **offline.access** - Long-lived tokens

No browser automation needed!