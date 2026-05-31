require('dotenv').config();
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Posting tweet to Twitter...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Go to login
    console.log('1. Opening Twitter...');
    await page.goto('https://x.com/i/flow/login', { timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Find and fill username
    console.log('2. Entering username...');
    const usernameInput = await page.$('input[autocomplete="username"], input[name="text"]');
    if (usernameInput) {
      await usernameInput.fill(process.env.TWITTER_USERNAME);
    }
    await page.waitForTimeout(1000);
    
    // Click Next using text selector
    console.log('3. Clicking Next...');
    const nextButton = await page.$('text=Next');
    if (nextButton) {
      await nextButton.click();
    }
    await page.waitForTimeout(3000);
    
    // Check what page we're on
    console.log('4. Current URL:', await page.url());
    await page.screenshot({ path: 'step4.png' });
    
    // Try to find password input with multiple selectors
    console.log('5. Looking for password field...');
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[data-testid="ocfEnterTextTextInput"]'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      passwordInput = await page.$(selector);
      if (passwordInput) {
        console.log('   Found password field with:', selector);
        break;
      }
    }
    
    if (passwordInput) {
      await passwordInput.fill(process.env.TWITTER_PASSWORD);
      await page.waitForTimeout(1000);
      
      // Click Log in
      console.log('6. Clicking Log in...');
      const loginButton = await page.$('text=Log in');
      if (loginButton) await loginButton.click();
      
      await page.waitForTimeout(5000);
    } else {
      console.log('   No password field found - might need verification');
      await page.screenshot({ path: 'needs-verification.png' });
      console.log('   Screenshot saved - check what Twitter is asking for');
    }
    
    // Check if we're logged in
    const url = await page.url();
    console.log('7. Current URL:', url);
    
    if (url.includes('home')) {
      console.log('✅ Logged in!\n');
      
      // Click compose
      console.log('8. Opening compose...');
      const composeBtn = await page.$('[data-testid="SideNav_NewTweet_Button"]');
      if (composeBtn) await composeBtn.click();
      await page.waitForTimeout(2000);
      
      // Type tweet
      const tweetText = process.argv[2] || 'hello I am alive. 🤖';
      console.log(`9. Typing: "${tweetText}"...`);
      const textArea = await page.$('[data-testid="tweetTextarea_0"]');
      if (textArea) await textArea.fill(tweetText);
      await page.waitForTimeout(1000);
      
      // Click Tweet
      console.log('10. Posting...');
      const tweetBtn = await page.$('[data-testid="tweetButton"]');
      if (tweetBtn) await tweetBtn.click();
      await page.waitForTimeout(5000);
      
      console.log('\n✅ TWEET POSTED!');
      await page.screenshot({ path: 'tweet-success.png' });
    } else {
      console.log('\n❌ Not logged in - check screenshot');
      await page.screenshot({ path: 'login-failed.png' });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'error.png' });
  } finally {
    await browser.close();
    console.log('\n👋 Done');
  }
})();