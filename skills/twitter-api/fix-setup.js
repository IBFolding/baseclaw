require('dotenv').config({ path: '/Users/brain/.openclaw/workspace/.env' });
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const clientId = process.env.TWITTER_CLIENT_ID;
const clientSecret = process.env.TWITTER_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.log('❌ Missing credentials in .env file');
  process.exit(1);
}

// Use a URL that won't fail
const redirectUri = 'https://twitter.com'; // This will show an error but we can still get the code

const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'];
const state = 'moltmail_' + Date.now();

const params = new URLSearchParams({
  response_type: 'code',
  client_id: clientId,
  redirect_uri: redirectUri,
  scope: scopes.join(' '),
  state: state,
  code_challenge: 'challenge',
  code_challenge_method: 'plain'
});

const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

console.log('🐦 Twitter OAuth Authorization\n');
console.log('If you got "Something went wrong", the app needs setup in Twitter Developer Portal.');
console.log('\n🔧 REQUIRED SETUP:');
console.log('1. Go to https://developer.twitter.com/en/portal/dashboard');
console.log('2. Click your app');
console.log('3. Go to "User authentication settings"');
console.log('4. Enable OAuth 2.0');
console.log('5. Set Callback URLs to: http://localhost:3000/callback');
console.log('6. Set Website URL to: https://molt-mail.xyz');
console.log('7. Save and try again\n');

console.log('='.repeat(60));
console.log('If setup is complete, use this URL:');
console.log('='.repeat(60));
console.log('\n' + authUrl + '\n');
console.log('='.repeat(60));

console.log('\n⚠️  NOTE: If you see "localhost refused to connect" after authorizing,');
console.log('    that\'s OK! The code is in the URL. Copy it from the address bar.');
console.log('\n    The code looks like: aBcD1234xYz... (after ?code=)\n');