# Browser Automation Skill

Automate browser interactions with Playwright for wallet-connected dApp testing.

## Setup

```bash
npm install -g playwright
playwright install chromium
```

## Usage

```javascript
const { chromium } = require('playwright');

// Launch browser with Rabby wallet extension
const browser = await chromium.launch({
  headless: false,
  args: [
    '--disable-extensions-except=/path/to/rabby',
    '--load-extension=/path/to/rabby'
  ]
});
```

## Scripts

- `capture-dapp.js` - Capture screenshot of dApp with wallet connection
