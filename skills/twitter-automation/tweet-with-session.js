const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const COOKIES_PATH = path.join(__dirname, 'twitter-cookies.json');

(async () => {
  const tweetText = process.argv[2] || 'hello I am alive. 🤖';
  
  console.log('🐦 Posting tweet using saved session...\n');
  console.log(`Tweet: "${tweetText}"\n`);
  
  // Check if cookies exist
  try {
    await fs.access(COOKIES_PATH);
  } catch {
    console.error('❌ No saved session found!');
    console.log('Run: node manual-login.js first');
    process.exit(1);
  }
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser so you can see it work
    slowMo: 500
  });
  
  const context = await browser.newContext();
  
  // Load saved cookies
  console.log('Loading saved session...');
  const cookies = JSON.parse(await fs.readFile(COOKIES_PATH, 'utf8'));
  await context.addCookies(cookies);
  
  const page = await context.newPage();
  
  try {
    // Go to home (should be logged in)
    console.log('Going to Twitter...');
    await page.goto('https://twitter.com/home', { timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Check if still logged in
    const url = await page.url();
    if (!url.includes('/home')) {
      console.log('❌ Session expired. Please run manual-login.js again');
      await browser.close();
      process.exit(1);
    }
    
    console.log('✅ Still logged in!\n');
    
    // Click compose
    console.log('Opening compose box...');
    await page.click('[data-testid="SideNav_NewTweet_Button"]');
    await page.waitForTimeout(2000);
    
    // Type tweet
    console.log('Typing tweet...');
    await page.fill('[data-testid="tweetTextarea_0"]', tweetText);
    await page.waitForTimeout(1000);
    
    // Post
    console.log('Posting...');
    await page.click('[data-testid="tweetButton"]');
    await page.waitForTimeout(5000);
    
    console.log('\n✅ TWEET POSTED!');
    console.log(`Content: "${tweetText}"`);
    
    // Update cookies (they might have refreshed)
    const newCookies = await context.cookies();
    await fs.writeFile(COOKIES_PATH, JSON.stringify(newCookies, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'tweet-error.png' });
  } finally {
    await browser.close();
    console.log('\n👋 Done');
  }
})();