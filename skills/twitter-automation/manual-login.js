const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const COOKIES_PATH = path.join(__dirname, 'twitter-cookies.json');

(async () => {
  console.log('🐦 Twitter Manual Login Helper\n');
  console.log('This will open a browser window. Please:');
  console.log('1. Log into Twitter manually');
  console.log('2. Wait for the home page to load');
  console.log('3. Press ENTER in this terminal to save the session\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser so you can log in
    slowMo: 100
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Opening Twitter login page...');
  await page.goto('https://twitter.com/i/flow/login');
  
  console.log('\n⏳ Waiting for you to log in...');
  console.log('(Browser window should be open)');
  
  // Wait for login to complete (URL changes to home)
  let loggedIn = false;
  while (!loggedIn) {
    await new Promise(r => setTimeout(r, 2000));
    const url = await page.url();
    if (url.includes('/home') || url.includes('twitter.com/home')) {
      loggedIn = true;
    }
  }
  
  console.log('\n✅ Detected successful login!');
  console.log('Saving session cookies...');
  
  // Save cookies
  const cookies = await context.cookies();
  await fs.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  
  console.log('✅ Session saved to twitter-cookies.json');
  console.log('You can now close the browser window.');
  
  await browser.close();
  console.log('\n👋 Done! Run tweet-with-session.js to post tweets.');
})();