#!/usr/bin/env node

require('dotenv').config();
const { StealthTwitterBot } = require('./stealth-bot');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
🕵️  Twitter Stealth Bot

Usage:
  node stealth-tweet.js "Your tweet text"
  node stealth-tweet.js --file tweet.txt
  node stealth-tweet.js "Tweet text" --image ./image.png

Environment Variables:
  TWITTER_USERNAME
  TWITTER_PASSWORD  
  TWITTER_EMAIL

This uses advanced anti-detection:
  • Random browser fingerprints
  • Human-like typing delays
  • Realistic mouse movements
  • Canvas fingerprint randomization
  • WebGL vendor spoofing
  • Smart proxy rotation (optional)
    `);
    process.exit(0);
  }
  
  // Parse arguments
  let text = '';
  let image = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--image') {
      image = args[i + 1];
      i++;
    } else if (args[i] === '--file') {
      const fs = require('fs');
      text = fs.readFileSync(args[i + 1], 'utf8');
      i++;
    } else if (!text) {
      text = args[i];
    }
  }
  
  if (!text) {
    console.error('❌ No tweet text provided');
    process.exit(1);
  }
  
  console.log('🚀 Starting Stealth Twitter Bot\n');
  
  const bot = new StealthTwitterBot({
    headless: false, // Show browser so you can see/assist
    slowMo: 100
  });
  
  try {
    await bot.init();
    
    // Login (with manual fallback if needed)
    const loggedIn = await bot.smartLogin(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD,
      process.env.TWITTER_EMAIL
    );
    
    if (!loggedIn) {
      console.error('❌ Failed to login');
      process.exit(1);
    }
    
    // Post tweet
    await bot.tweet(text, image);
    
    console.log('\n✅ Success!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await bot.close();
  }
}

main();