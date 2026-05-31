require('dotenv').config();
const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Twitter login...');
  
  const browser = await chromium.launch({ headless: false }); // Show browser
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1. Going to Twitter login...');
  await page.goto('https://twitter.com/i/flow/login');
  
  console.log('2. Waiting 5 seconds for page to load...');
  await page.waitForTimeout(5000);
  
  console.log('3. Taking screenshot...');
  await page.screenshot({ path: 'twitter-login-debug.png' });
  console.log('✅ Screenshot saved to twitter-login-debug.png');
  
  console.log('4. Getting page title...');
  const title = await page.title();
  console.log('Page title:', title);
  
  console.log('5. Checking for username field...');
  const usernameField = await page.$('input[autocomplete="username"]');
  console.log('Username field found:', !!usernameField);
  
  console.log('\nCheck the screenshot to see what Twitter is showing.');
  console.log('Close the browser window when done.');
  
  // Keep browser open for manual inspection
  await new Promise(() => {}); // Never resolve
})();