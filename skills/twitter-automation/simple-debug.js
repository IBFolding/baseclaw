const { chromium } = require('playwright');

(async () => {
  console.log('Opening browser...');
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();
  
  console.log('Going to Twitter login...');
  await page.goto('https://twitter.com/i/flow/login', { timeout: 60000 });
  
  console.log('Waiting 10 seconds...');
  await new Promise(r => setTimeout(r, 10000));
  
  console.log('Current URL:', await page.url());
  console.log('Page title:', await page.title());
  
  // Try to find username field
  const fields = await page.$$('input');
  console.log('Found', fields.length, 'input fields');
  
  await page.screenshot({ path: 'debug-login.png', fullPage: true });
  console.log('Screenshot saved: debug-login.png');
  
  await browser.close();
  console.log('Done');
})();