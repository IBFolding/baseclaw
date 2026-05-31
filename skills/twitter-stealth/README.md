# Twitter Stealth Bot

Advanced Twitter automation with multiple anti-detection layers.

## Why This Works When Others Fail

### Anti-Detection Techniques

1. **Browser Fingerprint Randomization**
   - Random user agents
   - Random viewport sizes
   - Random timezones/locales
   - Canvas fingerprint randomization
   - WebGL vendor spoofing

2. **Human Behavior Simulation**
   - Variable typing speeds (30-180ms per character)
   - Random pauses while "thinking"
   - Human-like mouse movements
   - Realistic click patterns

3. **Request Header Modification**
   - Realistic Accept-Language headers
   - Proper Sec-* headers
   - Randomized User-Agent strings

4. **JavaScript Injection**
   - Hides `navigator.webdriver`
   - Fakes plugins list
   - Spoofs device capabilities
   - Removes Playwright traces

5. **Smart Login Strategy**
   - Attempts automated login first
   - Detects CAPTCHA/verification
   - Falls back to manual login
   - Saves session cookies for reuse

## Installation

```bash
cd skills/twitter-stealth
npm install
```

## Configuration

Create `.env` file:
```
TWITTER_USERNAME=your_username
TWITTER_PASSWORD=your_password
TWITTER_EMAIL=your_email@example.com
```

## Usage

### Post a Tweet

```bash
node stealth-tweet.js "hello I am alive. 🤖"
```

The bot will:
1. Open a browser window
2. Try automated login with human-like behavior
3. If blocked, wait for you to manually complete login
4. Post the tweet with human-like delays
5. Save session for next time

### With Image

```bash
node stealth-tweet.js "Check this out" --image ./screenshot.png
```

## How It Works

1. **Fingerprint Generation**: Each run creates a unique browser fingerprint
2. **Stealth Scripts**: Injected into every page to hide automation
3. **Human Delays**: Random delays between actions
4. **Smart Fallback**: If automation fails, waits for manual login
5. **Cookie Persistence**: Saves sessions to avoid repeated logins

## Files

- `stealth-bot.js` - Core bot with anti-detection
- `stealth-tweet.js` - CLI for posting tweets
- `package.json` - Dependencies

## Important Notes

- **Always runs with visible browser** (headless: false) for better stealth
- **Saves cookies** after successful login for future use
- **Manual fallback** if Twitter blocks automated login
- **Random delays** make behavior indistinguishable from human

## When Detection Happens

If Twitter still detects automation, the bot will:
1. Show "MANUAL LOGIN REQUIRED" message
2. Wait for you to complete login manually
3. Detect successful login automatically
4. Save session for next time

This hybrid approach is the most reliable way to automate Twitter.