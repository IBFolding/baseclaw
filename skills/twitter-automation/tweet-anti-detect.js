require('dotenv').config();
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Posting tweet...\n');
  
  const browser = await chromium.launch({ 
    headless: true, // Run headless to avoid detection
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
  });
  
  // Add script to hide automation
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  });
  
  const page = await context.newPage();
  
  try {
    console.log('1. Going to Twitter...');
    await page.goto('https://x.com/i/flow/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(5000);
    
    console.log('2. Looking for username field...');
    const usernameSelectors = [
      'input[autocomplete="username"]',
      'input[name="text"]',
      'input[type="text"]'
    ];
    
    let usernameField = null;
    for (const selector of usernameSelectors) {
      usernameField = await page.$(selector);
      if (usernameField) {
        console.log('   Found:', selector);
        break;
      }
    }
    
    if (!usernameField) {
      console.log('   No username field found');
      await page.screenshot({ path: 'no-field.png' });
      throw new Error('Username field not found');
    }
    
    console.log('3. Filling username...');
    await usernameField.click();
    await usernameField.fill(process.env.TWITTER_USERNAME);
    await page.waitForTimeout(2000);
    
    console.log('4. Clicking Next...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    
    console.log('5. URL after Next:', await page.url());
    await page.screenshot({ path: 'after-next.png' });
    
    // Look for password
    console.log('6. Looking for password...');
    const passwordField = await page.$('input[type="password"]');
    
    if (passwordField) {
      console.log('   Found password field');
      await passwordField.fill(process.env.TWITTER_PASSWORD);
      await page.waitForTimeout(2000);
      
      console.log('7. Submitting...');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(8000);
      
      console.log('8. Final URL:', await page.url());
      
      if ((await page.url()).includes('home')) {
        console.log('✅ Logged in!\n');
        
        // Post tweet
        console.log('9. Clicking compose...');
        await page.click('a[href="/compose/tweet"], [data-testid="SideNav_NewTweet_Button"]');
        await page.waitForTimeout(3000);
        
        const tweetText = process.argv[2] || 'hello I am alive. 🤖';
        console.log(`10. Typing: "${tweetText}"`);
        const textArea = await page.$('[data-testid="tweetTextarea_0"]');
        if (textArea) {
          await textArea.fill(tweetText);
          await page.waitForTimeout(1000);
          
          console.log('11. Posting...');
          await page.click('[data-testid="tweetButton"]');
          await page.waitForTimeout(5000);
          
          console.log('\n✅ TWEET POSTED!');
          await page.screenshot({ path: 'success.png' });
        }
      } else {
        console.log('❌ Login failed - check after-next.png');
      }
    } else {
      console.log('❌ No password field - check after-next.png');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'error.png' });
  } finally {
    await browser.close();
    console.log('\nDone');
  }
})();