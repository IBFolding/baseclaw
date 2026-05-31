const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DAPP_URL = process.env.DAPP_URL || 'https://app.molt-mail.xyz';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './screenshots';

async function captureWithWallet() {
  console.log('Launching browser...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  
  const page = await context.newPage();
  
  console.log('Navigating to:', DAPP_URL);
  await page.goto(DAPP_URL, { waitUntil: 'networkidle' });
  
  // Wait for wallet connection
  console.log('Please connect your wallet now...');
  console.log('Waiting 30 seconds for you to connect...');
  
  await page.waitForTimeout(30000);
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Capture screenshot after wallet connection
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(OUTPUT_DIR, `moltmail-connected-${timestamp}.png`);
  
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  });
  
  console.log('Screenshot saved to:', screenshotPath);
  
  // Keep browser open
  console.log('Browser will stay open. Press Ctrl+C to close.');
  await new Promise(() => {});
}

captureWithWallet().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
