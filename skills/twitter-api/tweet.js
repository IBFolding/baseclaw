#!/usr/bin/env node

require('dotenv').config();
const { TwitterAPI } = require('./twitter-api');
const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');

const TOKEN_FILE = path.join(__dirname, '.twitter-token.json');

async function main() {
  const args = process.argv.slice(2);
  
  // Load credentials from env
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.log('❌ Missing Twitter OAuth credentials!');
    console.log('\nAdd to your .env file:');
    console.log('TWITTER_CLIENT_ID=your_client_id');
    console.log('TWITTER_CLIENT_SECRET=your_client_secret');
    process.exit(1);
  }
  
  const twitter = new TwitterAPI(clientId, clientSecret);
  
  // Check if we have saved token
  try {
    const saved = JSON.parse(await fs.readFile(TOKEN_FILE, 'utf8'));
    twitter.setAccessToken(saved.access_token);
    console.log('✅ Using saved token\n');
  } catch {
    console.log('📝 No saved token - need to authenticate\n');
    
    // Start auth flow
    const authUrl = twitter.getAuthUrl();
    console.log('1. Open this URL in your browser:\n');
    console.log(authUrl);
    console.log('\n2. Authorize the app\n');
    console.log('3. Copy the code from the redirect URL\n');
    
    // For simplicity, ask for code
    const code = await askQuestion('Paste the code here: ');
    
    console.log('\n⏳ Exchanging code for token...');
    const tokens = await twitter.exchangeCode(code);
    
    // Save tokens
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2));
    console.log('✅ Token saved!\n');
  }
  
  // Now post tweet
  const tweetText = args[0] || 'hello I am alive. 🤖';
  
  console.log(`🐦 Posting: "${tweetText}"\n`);
  
  try {
    const result = await twitter.tweet(tweetText);
    console.log('✅ TWEET POSTED!');
    console.log(`   ID: ${result.data.id}`);
    console.log(`   URL: https://twitter.com/i/web/status/${result.data.id}`);
    
    // Show user info
    const me = await twitter.getMe();
    console.log(`   Posted as: @${me.data.username}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.detail || error.message);
    
    if (error.response?.status === 401) {
      console.log('\nToken expired. Delete .twitter-token.json and try again.');
    }
  }
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
      resolve(answer.trim());
    });
  });
}

main();