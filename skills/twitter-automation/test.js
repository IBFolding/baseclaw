#!/usr/bin/env node

/**
 * Test script for Twitter automation
 * Run this to verify your setup works
 */

require('dotenv').config();
const { TwitterBot } = require('./twitter-bot');

async function runTests() {
  console.log('🧪 Running Twitter Automation Tests\n');
  
  // Check environment
  console.log('1. Checking environment variables...');
  if (!process.env.TWITTER_USERNAME) {
    console.error('❌ TWITTER_USERNAME not set');
    process.exit(1);
  }
  if (!process.env.TWITTER_PASSWORD) {
    console.error('❌ TWITTER_PASSWORD not set');
    process.exit(1);
  }
  console.log('✅ Environment variables set\n');
  
  // Initialize bot
  console.log('2. Initializing browser...');
  const bot = new TwitterBot();
  
  try {
    await bot.init();
    console.log('✅ Browser initialized\n');
    
    // Test login
    console.log('3. Testing login...');
    await bot.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD,
      process.env.TWITTER_EMAIL
    );
    console.log('✅ Login successful\n');
    
    // Test getting mentions (read-only)
    console.log('4. Testing mention fetch...');
    const mentions = await bot.getMentions();
    console.log(`✅ Found ${mentions.length} recent mentions\n`);
    
    // Ask before posting test tweet
    console.log('5. Tweet test');
    console.log('⚠️  This will post a real tweet to your account!');
    console.log('Tweet: "Testing MoltMail automation 🤖"');
    console.log('\nTo test tweeting, run: node tweet.js "Your test message"');
    
    console.log('\n✅ All tests passed! Twitter automation is ready.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await bot.close();
  }
}

runTests();