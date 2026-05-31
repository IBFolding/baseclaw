const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration - update these paths for your system
const RABBY_EXTENSION_PATH = process.env.RABBY_EXTENSION || '';
const DAPP_URL = process.env.DAPP_URL || 'https://app.molt-mail.xyz';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './screenshots';

async function captureDapp() {
  console.log('Launching browser...');
  
  const launchOptions = {
    headless: false, // Need visible browser for wallet interaction
    slowMo: 50,
  };

  // Add Rabby extension if path provided
  if (RABBY_EXTENSION_PATH && fs.existsSync(RABBY_EXTENSION_PATH)) {
    launchOptions.args = [
      `--disable-extensions-except=${RABBY_EXTENSION_PATH}`,
      `--load-extension=${RABBY_EXTENSION_PATH}`
    ];
    console.log('Loading Rabby extension from:', RABBY_EXTENSION_PATH);
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  console.log('Navigating to:', DAPP_URL);
  await page.goto(DAPP_URL, { waitUntil: 'networkidle' });
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Capture screenshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(OUTPUT_DIR, `moltmail-${timestamp}.png`);
  
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  });
  
  console.log('Screenshot saved to:', screenshotPath);
  
  // Keep browser open for manual wallet connection
  console.log('Browser is open. Please connect your wallet manually.');
  console.log('Press Ctrl+C to close when done.');
  
  // Wait indefinitely
  await new Promise(() => {});
}

captureDapp().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
