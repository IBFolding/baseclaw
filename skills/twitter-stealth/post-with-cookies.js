#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const SESSION_FILE = path.join(__dirname, 'twitter-session.json');

async function main() {
  const tweetText = process.argv[2] || 'hello I am alive. 🤖';
  
  console.log('🐦 Twitter Cookie-Based Posting\n');
  console.log(`Tweet: "${tweetText}"\n`);
  
  // Check for session file
  let sessionData;
  try {
    sessionData = JSON.parse(await fs.readFile(SESSION_FILE, 'utf8'));
  } catch {
    console.log('❌ No session file found!');
    console.log('\nTo set up:');
    console.log('1. Log into Twitter in your main browser');
    console.log('2. Open browser console (F12 → Console)');
    console.log('3. Paste and run the code from get-cookies.js');
    console.log('4. Save the output to twitter-session.json in this folder');
    console.log('\nOr I can open the browser and you can do it there...\n');
    
    const answer = await askQuestion('Open browser for manual setup? (y/n): ');
    if (answer.toLowerCase() === 'y') {
      return await manualSetup();
    }
    process.exit(1);
  }
  
  console.log('✅ Session file found');
  console.log(`   From: ${sessionData.timestamp || 'unknown'}`);
  console.log(`   Cookies: ${sessionData.cookies?.length || 0}`);
  
  // Launch browser with same user agent
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200
  });
  
  const context = await browser.newContext({
    userAgent: sessionData.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  // Add cookies
  if (sessionData.cookies) {
    // Filter and fix cookies for Playwright
    const validCookies = sessionData.cookies
      .filter(c => c.name && c.value)
      .map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain || '.twitter.com',
        path: c.path || '/',
        expires: c.expires > 0 ? c.expires : undefined,
        httpOnly: c.httpOnly || false,
        secure: c.secure !== false,
        sameSite: c.sameSite || 'Lax'
      }));
    
    await context.addCookies(validCookies);
    console.log(`   Added ${validCookies.length} cookies`);
  }
  
  const page = await context.newPage();
  
  try {
    // Go to Twitter home (should be logged in)
    console.log('\n🚀 Going to Twitter...');
    await page.goto('https://twitter.com/home', { timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Check if logged in
    const url = await page.url();
    if (!url.includes('/home')) {
      console.log('❌ Session expired or invalid');
      console.log('Current URL:', url);
      console.log('\nPlease refresh the session:');
      console.log('1. Log into Twitter in your browser');
      console.log('2. Run the get-cookies.js code in console');
      console.log('3. Save to twitter-session.json');
      await browser.close();
      process.exit(1);
    }
    
    console.log('✅ Logged in!\n');
    
    // Post tweet
    console.log('📝 Composing tweet...');
    
    // Click compose
    await page.click('[data-testid="SideNav_NewTweet_Button"]');
    await page.waitForTimeout(2000);
    
    // Type
    await page.fill('[data-testid="tweetTextarea_0"]', tweetText);
    await page.waitForTimeout(1000);
    
    // Post
    console.log('🚀 Posting...');
    await page.click('[data-testid="tweetButton"]');
    await page.waitForTimeout(5000);
    
    // Verify
    const finalUrl = await page.url();
    if (finalUrl.includes('/status/')) {
      console.log('\n✅ TWEET POSTED SUCCESSFULLY!');
      console.log(`   URL: ${finalUrl}`);
      
      // Update session with fresh cookies
      const newCookies = await context.cookies();
      sessionData.cookies = newCookies;
      sessionData.timestamp = new Date().toISOString();
      await fs.writeFile(SESSION_FILE, JSON.stringify(sessionData, null, 2));
    } else {
      console.log('\n⚠️  Tweet may not have posted');
      console.log('   Final URL:', finalUrl);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n👋 Done');
  }
}

async function manualSetup() {
  console.log('\nOpening browser... Log into Twitter and I\'ll capture the session.\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://twitter.com/i/flow/login');
  
  console.log('⏳ Waiting for you to log in...');
  console.log('(Browser is open - complete login and press any key here when done)');
  
  // Wait for manual confirmation
  await askQuestion('\nPress ENTER when logged in: ');
  
  const url = await page.url();
  if (!url.includes('/home')) {
    console.log('❌ Not logged in yet. Please try again.');
    await browser.close();
    process.exit(1);
  }
  
  console.log('✅ Capturing session...');
  
  const context = page.context();
  const cookies = await context.cookies();
  const storage = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  });
  
  const sessionData = {
    cookies,
    localStorage: storage,
    userAgent: await page.evaluate(() => navigator.userAgent),
    timestamp: new Date().toISOString()
  };
  
  await fs.writeFile(SESSION_FILE, JSON.stringify(sessionData, null, 2));
  console.log('✅ Session saved to twitter-session.json');
  
  await browser.close();
  console.log('\nNow run: node post-with-cookies.js "your tweet"');
}

function askQuestion(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

main();