require('dotenv').config();
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Posting tweet to Twitter...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Go to login
    console.log('1. Opening Twitter login...');
    await page.goto('https://x.com/i/flow/login', { timeout: 60000 });
    
    // Wait for login form
    console.log('2. Waiting for login form...');
    await page.waitForSelector('input[autocomplete="username"]', { timeout: 30000 });
    
    // Enter username
    console.log('3. Entering username...');
    await page.fill('input[autocomplete="username"]', process.env.TWITTER_USERNAME);
    
    // Click Next
    console.log('4. Clicking Next...');
    await page.click('button:has-text("Next")');
    
    // Wait for password field
    console.log('5. Waiting for password field...');
    await page.waitForSelector('input[name="password"]', { timeout: 30000 });
    
    // Enter password
    console.log('6. Entering password...');
    await page.fill('input[name="password"]', process.env.TWITTER_PASSWORD);
    
    // Click Log in
    console.log('7. Clicking Log in...');
    await page.click('button:has-text("Log in")');
    
    // Wait for home page
    console.log('8. Waiting for home page...');
    await page.waitForURL('**/home', { timeout: 60000 });
    console.log('✅ Logged in successfully!\n');
    
    // Click compose button
    console.log('9. Opening compose box...');
    await page.click('[data-testid="SideNav_NewTweet_Button"]');
    
    // Wait for compose modal
    console.log('10. Waiting for compose modal...');
    await page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 30000 });
    
    // Type tweet
    const tweetText = process.argv[2] || 'hello I am alive. 🤖';
    console.log(`11. Typing tweet: "${tweetText}"...`);
    await page.fill('[data-testid="tweetTextarea_0"]', tweetText);
    
    // Click Tweet button
    console.log('12. Clicking Tweet button...');
    await page.click('[data-testid="tweetButton"]');
    
    // Wait for confirmation
    console.log('13. Waiting for tweet to post...');
    await page.waitForTimeout(5000);
    
    console.log('\n✅ TWEET POSTED SUCCESSFULLY!');
    console.log(`📝 Content: "${tweetText}"`);
    
    // Take screenshot
    await page.screenshot({ path: 'tweet-success.png' });
    console.log('📸 Screenshot saved: tweet-success.png');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'tweet-error.png' });
    console.log('📸 Error screenshot saved: tweet-error.png');
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed');
  }
})();