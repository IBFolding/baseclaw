#!/usr/bin/env node

/**
 * CLI tool for posting tweets to MoltMail Twitter account
 * Usage: node tweet.js "Your tweet text" [--image path/to/image.png]
 */

require('dotenv').config();
const { TwitterBot } = require('./twitter-bot');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
🐦 MoltMail Twitter CLI

Usage:
  node tweet.js "Your tweet text"
  node tweet.js "Your tweet text" --image ./screenshot.png
  node tweet.js --file ./tweet.txt

Environment Variables:
  TWITTER_USERNAME  - Twitter username
  TWITTER_PASSWORD  - Twitter password
  TWITTER_EMAIL     - Twitter email (for verification)

Examples:
  node tweet.js "Hello from MoltMail! 🚀"
  node tweet.js "Check out our new feature" --image ./feature.png
    `);
    process.exit(0);
  }
  
  // Parse arguments
  let text = '';
  let image = null;
  let file = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--image') {
      image = args[i + 1];
      i++;
    } else if (args[i] === '--file') {
      file = args[i + 1];
      i++;
    } else if (!text) {
      text = args[i];
    }
  }
  
  // Read from file if specified
  if (file) {
    const fs = require('fs');
    text = fs.readFileSync(file, 'utf8');
  }
  
  if (!text) {
    console.error('❌ Error: No tweet text provided');
    process.exit(1);
  }
  
  // Validate credentials
  if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_PASSWORD) {
    console.error('❌ Error: TWITTER_USERNAME and TWITTER_PASSWORD must be set in .env');
    process.exit(1);
  }
  
  console.log('🚀 Initializing Twitter bot...');
  
  const bot = new TwitterBot();
  
  try {
    await bot.init();
    await bot.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD,
      process.env.TWITTER_EMAIL
    );
    
    console.log(`📝 Posting: ${text.slice(0, 50)}${text.length > 50 ? '...' : ''}`);
    if (image) console.log(`🖼️  With image: ${image}`);
    
    await bot.tweet(text, image);
    
    console.log('✅ Tweet posted successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await bot.close();
  }
}

main();