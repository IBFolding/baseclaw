const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './screenshots';

async function captureLoggedIn() {
  // Connect to existing browser
  const browser = await chromium.connectOverCDP('http://localhost:9222').catch(() => {
    console.log('No existing browser found. Please run capture-dapp.js first.');
    process.exit(1);
  });
  
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  
  // Wait a bit for any state changes
  await page.waitForTimeout(2000);
  
  // Capture screenshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(OUTPUT_DIR, `moltmail-logged-in-${timestamp}.png`);
  
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  });
  
  console.log('Screenshot saved to:', screenshotPath);
  await browser.close();
}

captureLoggedIn().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
