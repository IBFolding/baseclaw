const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class TwitterBot {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.isLoggedIn = false;
    this.cookiesPath = path.join(__dirname, 'twitter-cookies.json');
  }

  async init() {
    console.log('🚀 Initializing Twitter Bot...');
    
    this.browser = await chromium.launch({
      headless: process.env.NODE_ENV === 'production',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    // Try to load saved cookies
    try {
      const cookies = await fs.readFile(this.cookiesPath, 'utf8');
      await this.context.addCookies(JSON.parse(cookies));
      console.log('✅ Loaded saved session');
    } catch {
      console.log('📝 No saved session, will need to login');
    }

    this.page = await this.context.newPage();
  }

  async login(username, password, email) {
    if (this.isLoggedIn) return true;
    
    console.log('🔐 Logging into Twitter...');
    
    // Go to Twitter
    await this.page.goto('https://twitter.com/i/flow/login');
    await this.page.waitForLoadState('networkidle');
    
    // Check if already logged in
    if (await this.page.url().includes('home')) {
      console.log('✅ Already logged in');
      this.isLoggedIn = true;
      return true;
    }
    
    // Enter username
    await this.page.fill('input[autocomplete="username"]', username);
    await this.page.click('text=Next');
    
    // Wait for password field
    await this.page.waitForSelector('input[name="password"]', { timeout: 10000 });
    await this.page.fill('input[name="password"]', password);
    await this.page.click('text=Log in');
    
    // Handle verification if needed
    try {
      await this.page.waitForSelector('text=Enter your phone number or username', { timeout: 5000 });
      await this.page.fill('input[data-testid="ocfEnterTextTextInput"]', username);
      await this.page.click('text=Next');
    } catch {
      // No verification needed
    }
    
    // Wait for login to complete
    await this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
    
    if (await this.page.url().includes('home')) {
      console.log('✅ Login successful');
      this.isLoggedIn = true;
      
      // Save cookies for next time
      const cookies = await this.context.cookies();
      await fs.writeFile(this.cookiesPath, JSON.stringify(cookies));
      
      return true;
    }
    
    throw new Error('Login failed');
  }

  async tweet(text, imagePath = null) {
    if (!this.isLoggedIn) throw new Error('Not logged in');
    
    console.log(`🐦 Posting tweet: ${text.slice(0, 50)}...`);
    
    // Click compose button
    await this.page.click('[data-testid="SideNav_NewTweet_Button"]');
    
    // Wait for compose modal
    await this.page.waitForSelector('[data-testid="tweetTextarea_0"]');
    
    // Type tweet
    await this.page.fill('[data-testid="tweetTextarea_0"]', text);
    
    // Upload image if provided
    if (imagePath) {
      const fileInput = await this.page.$('input[type="file"]');
      await fileInput.setInputFiles(imagePath);
      await this.page.waitForTimeout(2000); // Wait for upload
    }
    
    // Click tweet button
    await this.page.click('[data-testid="tweetButton"]');
    
    // Wait for tweet to post
    await this.page.waitForTimeout(3000);
    
    console.log('✅ Tweet posted successfully');
    return true;
  }

  async reply(tweetId, text, imagePath = null) {
    if (!this.isLoggedIn) throw new Error('Not logged in');
    
    console.log(`💬 Replying to tweet ${tweetId}...`);
    
    // Navigate to tweet
    await this.page.goto(`https://twitter.com/i/web/status/${tweetId}`);
    await this.page.waitForLoadState('networkidle');
    
    // Click reply button
    await this.page.click('[data-testid="reply"]');
    await this.page.waitForSelector('[data-testid="tweetTextarea_0"]');
    
    // Type reply
    await this.page.fill('[data-testid="tweetTextarea_0"]', text);
    
    // Upload image if provided
    if (imagePath) {
      const fileInput = await this.page.$('input[type="file"]');
      await fileInput.setInputFiles(imagePath);
      await this.page.waitForTimeout(2000);
    }
    
    // Post reply
    await this.page.click('[data-testid="tweetButton"]');
    await this.page.waitForTimeout(3000);
    
    console.log('✅ Reply posted');
    return true;
  }

  async getMentions() {
    if (!this.isLoggedIn) throw new Error('Not logged in');
    
    console.log('🔍 Checking mentions...');
    
    await this.page.goto('https://twitter.com/notifications/mentions');
    await this.page.waitForLoadState('networkidle');
    
    // Extract mentions
    const mentions = await this.page.$$eval('[data-testid="tweet"]', tweets => {
      return tweets.map(tweet => ({
        id: tweet.getAttribute('data-tweet-id'),
        text: tweet.querySelector('[data-testid="tweetText"]')?.textContent,
        author: tweet.querySelector('[data-testid="User-Name"]')?.textContent,
        handle: tweet.querySelector('a[role="link"]')?.getAttribute('href')?.split('/')[1]
      }));
    });
    
    return mentions;
  }

  async retweet(tweetId) {
    if (!this.isLoggedIn) throw new Error('Not logged in');
    
    console.log(`🔄 Retweeting ${tweetId}...`);
    
    await this.page.goto(`https://twitter.com/i/web/status/${tweetId}`);
    await this.page.waitForLoadState('networkidle');
    
    await this.page.click('[data-testid="retweet"]');
    await this.page.click('[data-testid="retweetConfirm"]');
    await this.page.waitForTimeout(2000);
    
    console.log('✅ Retweeted');
    return true;
  }

  async like(tweetId) {
    if (!this.isLoggedIn) throw new Error('Not logged in');
    
    console.log(`❤️ Liking tweet ${tweetId}...`);
    
    await this.page.goto(`https://twitter.com/i/web/status/${tweetId}`);
    await this.page.waitForLoadState('networkidle');
    
    await this.page.click('[data-testid="like"]');
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Liked');
    return true;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('👋 Browser closed');
    }
  }
}

module.exports = { TwitterBot };

// CLI usage
if (require.main === module) {
  const bot = new TwitterBot();
  
  (async () => {
    try {
      await bot.init();
      
      const command = process.argv[2];
      
      if (command === 'login') {
        await bot.login(
          process.env.TWITTER_USERNAME,
          process.env.TWITTER_PASSWORD,
          process.env.TWITTER_EMAIL
        );
      } else if (command === 'tweet') {
        const text = process.argv[3];
        const image = process.argv.includes('--image') ? process.argv[process.argv.indexOf('--image') + 1] : null;
        
        await bot.login(
          process.env.TWITTER_USERNAME,
          process.env.TWITTER_PASSWORD,
          process.env.TWITTER_EMAIL
        );
        await bot.tweet(text, image);
      } else if (command === 'mentions') {
        await bot.login(
          process.env.TWITTER_USERNAME,
          process.env.TWITTER_PASSWORD,
          process.env.TWITTER_EMAIL
        );
        const mentions = await bot.getMentions();
        console.log(JSON.stringify(mentions, null, 2));
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      await bot.close();
    }
  })();
}