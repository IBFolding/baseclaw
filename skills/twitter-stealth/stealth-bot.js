const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class StealthTwitterBot {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.options = {
      headless: false,
      slowMo: options.slowMo || 100,
      proxy: options.proxy || null,
      userDataDir: options.userDataDir || './user-data',
      ...options
    };
    this.cookiesPath = path.join(__dirname, 'session-cookies.json');
    this.fingerprint = this.generateFingerprint();
  }

  // Generate unique browser fingerprint
  generateFingerprint() {
    return {
      userAgent: this.getRandomUserAgent(),
      viewport: this.getRandomViewport(),
      timezone: this.getRandomTimezone(),
      locale: this.getRandomLocale(),
      colorDepth: 24,
      deviceMemory: [4, 8, 16][Math.floor(Math.random() * 3)],
      hardwareConcurrency: [4, 8, 12][Math.floor(Math.random() * 3)]
    };
  }

  getRandomUserAgent() {
    const agents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  getRandomViewport() {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1680, height: 1050 },
      { width: 1440, height: 900 },
      { width: 1366, height: 768 }
    ];
    return viewports[Math.floor(Math.random() * viewports.length)];
  }

  getRandomTimezone() {
    const timezones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'];
    return timezones[Math.floor(Math.random() * timezones.length)];
  }

  getRandomLocale() {
    const locales = ['en-US', 'en-GB', 'en-CA', 'en-AU'];
    return locales[Math.floor(Math.random() * locales.length)];
  }

  async init() {
    console.log('🕵️  Initializing Stealth Mode...');
    
    const launchOptions = {
      headless: this.options.headless,
      slowMo: this.options.slowMo,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process,AutomationControlled',
        '--disable-site-isolation-trials',
        '--disable-features=InterestFeedContentSuggestions',
        '--disable-features=WebRtcHideLocalIpsWithMdns',
        '--disable-features=UserAgentClientHint',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    };

    if (this.options.proxy) {
      launchOptions.proxy = { server: this.options.proxy };
    }

    this.browser = await chromium.launch(launchOptions);

    // Create context with fingerprint
    this.context = await this.browser.newContext({
      userAgent: this.fingerprint.userAgent,
      viewport: this.fingerprint.viewport,
      timezoneId: this.fingerprint.timezone,
      locale: this.fingerprint.locale,
      colorScheme: 'dark',
      reducedMotion: 'no-preference',
      acceptDownloads: true,
      javaScriptEnabled: true,
      bypassCSP: true,
      ignoreHTTPSErrors: true
    });

    // Apply stealth scripts
    await this.applyStealthScripts();

    // Load cookies if exist
    await this.loadCookies();

    this.page = await this.context.newPage();
    
    // Additional page-level stealth
    await this.setupPageStealth();

    console.log('✅ Stealth mode activated');
    console.log(`   User-Agent: ${this.fingerprint.userAgent.slice(0, 50)}...`);
    console.log(`   Viewport: ${this.fingerprint.viewport.width}x${this.fingerprint.viewport.height}`);
  }

  async applyStealthScripts() {
    await this.context.addInitScript(() => {
      // Override navigator properties
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      
      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' 
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters)
      );
      
      // Hide Playwright
      delete window.__playwright;
      delete window.__pw_manual;
      delete window.__pw_resume;
      
      // Override Chrome runtime
      window.chrome = {
        runtime: {},
        loadTimes: () => ({}),
        csi: () => ({}),
        app: {}
      };
      
      // Canvas fingerprint randomization
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type) {
        const context = originalGetContext.call(this, type);
        if (context && type === '2d') {
          const originalFillText = context.fillText;
          context.fillText = function(...args) {
            context.save();
            context.setTransform(1.001, 0, 0, 1.001, 0.001, 0.001);
            originalFillText.apply(this, args);
            context.restore();
          };
        }
        return context;
      };
      
      // WebGL vendor spoofing
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel Iris Xe Graphics';
        return getParameter.call(this, parameter);
      };
    });
  }

  async setupPageStealth() {
    // Intercept and modify requests to appear more human
    await this.page.route('**/*', async (route) => {
      const headers = await route.request().allHeaders();
      
      // Add realistic headers
      headers['Accept-Language'] = 'en-US,en;q=0.9';
      headers['Accept-Encoding'] = 'gzip, deflate, br';
      headers['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      headers['Sec-Ch-Ua-Mobile'] = '?0';
      headers['Sec-Ch-Ua-Platform'] = '"macOS"';
      headers['Sec-Fetch-Dest'] = 'document';
      headers['Sec-Fetch-Mode'] = 'navigate';
      headers['Sec-Fetch-Site'] = 'none';
      headers['Sec-Fetch-User'] = '?1';
      headers['Upgrade-Insecure-Requests'] = '1';
      
      await route.continue({ headers });
    });
  }

  // Human-like typing with random delays
  async humanType(selector, text) {
    const element = await this.page.$(selector);
    if (!element) return;
    
    await element.click();
    await this.page.waitForTimeout(Math.random() * 300 + 100);
    
    for (const char of text) {
      await element.type(char, { delay: Math.random() * 150 + 30 });
      
      // Occasional pause like human thinking
      if (Math.random() < 0.1) {
        await this.page.waitForTimeout(Math.random() * 500 + 200);
      }
    }
    
    await this.page.waitForTimeout(Math.random() * 300 + 100);
  }

  // Human-like mouse movement
  async humanClick(selector) {
    try {
      const element = await this.page.$(selector);
      if (!element) return;
      
      const box = await element.boundingBox();
      if (box) {
        // Move to element with slight randomness
        const x = box.x + box.width / 2 + (Math.random() * 10 - 5);
        const y = box.y + box.height / 2 + (Math.random() * 10 - 5);
        
        await this.page.mouse.move(x, y, { steps: 10 });
        await this.page.waitForTimeout(Math.random() * 200 + 50);
        await this.page.mouse.click(x, y);
        await this.page.waitForTimeout(Math.random() * 300 + 100);
      }
    } catch (error) {
      // Fallback to simple click
      await this.page.click(selector);
    }
  }

  async loadCookies() {
    try {
      const cookies = JSON.parse(await fs.readFile(this.cookiesPath, 'utf8'));
      await this.context.addCookies(cookies);
      console.log('✅ Loaded saved session');
    } catch {
      console.log('📝 No saved session');
    }
  }

  async saveCookies() {
    const cookies = await this.context.cookies();
    await fs.writeFile(this.cookiesPath, JSON.stringify(cookies, null, 2));
  }

  // Smart login that waits for user if needed
  async smartLogin(username, password, email) {
    console.log('🔐 Starting smart login...');
    
    await this.page.goto('https://x.com/i/flow/login');
    await this.page.waitForTimeout(3000);
    
    // Check if already logged in
    if (await this.page.url().includes('/home')) {
      console.log('✅ Already logged in');
      return true;
    }
    
    // Try automated login with human-like behavior
    try {
      // Find and fill username with human typing
      const usernameField = await this.page.$('input[autocomplete="username"], input[name="text"]');
      if (usernameField) {
        await this.humanType('input[autocomplete="username"], input[name="text"]', username);
        await this.page.waitForTimeout(1000);
        
        // Click Next button
        const nextButton = await this.page.$('button:has-text("Next"), [role="button"]:has-text("Next")');
        if (nextButton) await nextButton.click();
        await this.page.waitForTimeout(3000);
        
        // Check for various scenarios
        const url = await this.page.url();
        const content = await this.page.content();
        
        // Password field appeared
        if (await this.page.$('input[type="password"]')) {
          console.log('   Entering password...');
          await this.humanType('input[type="password"]', password);
          await this.page.waitForTimeout(1000);
          
          // Click Log in
          const loginButton = await this.page.$('button:has-text("Log in"), [data-testid="LoginForm_Login_Button"]');
          if (loginButton) await loginButton.click();
          await this.page.waitForTimeout(5000);
          
          if (await this.page.url().includes('/home')) {
            console.log('✅ Login successful');
            await this.saveCookies();
            return true;
          }
        }
        
        // Verification needed
        if (content.includes('verification') || content.includes('confirm')) {
          console.log('⚠️  Verification required - waiting for manual input...');
          return await this.waitForManualLogin();
        }
        
        // Unusual activity detected
        if (content.includes('unusual') || content.includes('suspicious')) {
          console.log('⚠️  Twitter detected automation - switching to manual mode');
          return await this.waitForManualLogin();
        }
      }
      
      // If automated login failed, switch to manual
      console.log('⚠️  Automated login failed - switching to manual mode');
      return await this.waitForManualLogin();
      
    } catch (error) {
      console.log('⚠️  Error during login:', error.message);
      return await this.waitForManualLogin();
    }
  }

  // Wait for user to complete login manually
  async waitForManualLogin() {
    console.log('\n👤 MANUAL LOGIN REQUIRED');
    console.log('A browser window is open. Please:');
    console.log('1. Complete the login process');
    console.log('2. Solve any CAPTCHA if presented');
    console.log('3. Wait for the home page to load');
    console.log('4. The bot will detect successful login automatically\n');
    
    // Wait up to 5 minutes for login
    const maxWait = 5 * 60 * 1000;
    const checkInterval = 2000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      await this.page.waitForTimeout(checkInterval);
      
      const url = await this.page.url();
      if (url.includes('/home') || url.includes('twitter.com/home')) {
        console.log('✅ Manual login detected!');
        await this.saveCookies();
        return true;
      }
      
      // Show current status
      const title = await this.page.title();
      process.stdout.write(`\r⏳ Waiting... Current: ${title.slice(0, 40)}`);
    }
    
    console.log('\n❌ Timeout waiting for manual login');
    return false;
  }

  async tweet(text, imagePath = null) {
    console.log(`🐦 Tweeting: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`);
    
    // Random delay before action
    await this.page.waitForTimeout(Math.random() * 2000 + 1000);
    
    // Click compose
    console.log('Opening compose...');
    const composeBtn = await this.page.$('[data-testid="SideNav_NewTweet_Button"], a[href="/compose/tweet"]');
    if (composeBtn) {
      await composeBtn.click();
      await this.page.waitForTimeout(2000);
    }
    
    // Type tweet
    console.log('Typing tweet...');
    const textArea = await this.page.$('[data-testid="tweetTextarea_0"]');
    if (textArea) {
      await this.humanType('[data-testid="tweetTextarea_0"]', text);
      await this.page.waitForTimeout(1000);
    }
    
    // Upload image if provided
    if (imagePath) {
      const fileInput = await this.page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(imagePath);
        await this.page.waitForTimeout(3000);
      }
    }
    
    // Random delay before posting
    await this.page.waitForTimeout(Math.random() * 2000 + 1000);
    
    // Click tweet button
    console.log('Posting...');
    const tweetButton = await this.page.$('[data-testid="tweetButton"]');
    if (tweetButton) {
      await tweetButton.click();
      await this.page.waitForTimeout(5000);
    }
    
    // Verify posted
    const url = await this.page.url();
    if (url.includes('/status/')) {
      console.log('✅ Tweet posted successfully');
      await this.saveCookies(); // Refresh cookies
      return true;
    }
    
    throw new Error('Tweet may not have posted');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('👋 Browser closed');
    }
  }
}

module.exports = { StealthTwitterBot };