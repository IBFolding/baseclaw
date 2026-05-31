// Simple Twitter OAuth tester
// This will help us see exactly what error Twitter is giving

require('dotenv').config({ path: '/Users/brain/.openclaw/workspace/.env' });

const clientId = process.env.TWITTER_CLIENT_ID;

console.log('🐦 Twitter OAuth Debug\n');
console.log('Client ID:', clientId ? '✅ Found' : '❌ Missing');
console.log('');

// Generate the auth URL with detailed logging
const params = new URLSearchParams({
  response_type: 'code',
  client_id: clientId,
  redirect_uri: 'http://localhost:8080/callback',
  scope: 'tweet.read tweet.write users.read offline.access',
  state: 'debug_' + Date.now(),
  code_challenge: 'challenge',
  code_challenge_method: 'plain'
});

const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

console.log('Authorization URL:');
console.log('='.repeat(70));
console.log(authUrl);
console.log('='.repeat(70));
console.log('');
console.log('🔍 DEBUG INFO:');
console.log('  - response_type: code');
console.log('  - redirect_uri: http://localhost:8080/callback');
console.log('  - scope: tweet.read tweet.write users.read offline.access');
console.log('  - code_challenge_method: plain');
console.log('');
console.log('⚠️  If you see "Something went wrong", check these in Twitter Developer Portal:');
console.log('  1. User authentication settings → OAuth 2.0 is ENABLED');
console.log('  2. App permissions → Read and Write');
console.log('  3. Type of App → Web App, Automated App or Bot');
console.log('  4. Callback URLs → http://localhost:8080/callback');
console.log('  5. Website URL → https://molt-mail.xyz (or any valid URL)');
console.log('');
console.log('Try the URL above. If it works, you\'ll be redirected to localhost.');
console.log('Copy the FULL redirect URL and paste it here.\n');

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Paste the FULL redirect URL (or just the code): ', async (input) => {
  let code = input.trim();
  
  // Extract code from URL if full URL provided
  if (code.includes('code=')) {
    const match = code.match(/code=([^&]+)/);
    if (match) code = match[1];
  }
  
  if (!code || code === input.trim() && !code.includes('code=')) {
    console.log('\n❌ No code found');
    rl.close();
    return;
  }
  
  console.log('\n✅ Got code:', code.slice(0, 20) + '...');
  console.log('⏳ Exchanging for token...\n');
  
  const axios = require('axios');
  const fs = require('fs').promises;
  const path = require('path');
  
  const tokenParams = new URLSearchParams({
    code: code,
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: 'http://localhost:8080/callback',
    code_verifier: 'challenge'
  });
  
  const auth = Buffer.from(`${clientId}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', tokenParams.toString(), {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const tokenFile = path.join(__dirname, '.twitter-token.json');
    await fs.writeFile(tokenFile, JSON.stringify(response.data, null, 2));
    
    console.log('✅ TOKEN SAVED!');
    console.log(`   Access Token: ${response.data.access_token.slice(0, 30)}...`);
    console.log(`   Expires: ${response.data.expires_in} seconds`);
    console.log(`   Scope: ${response.data.scope}`);
    console.log('');
    
    // Post tweet
    console.log('📝 Posting tweet...');
    const tweetRes = await axios.post('https://api.twitter.com/2/tweets', 
      { text: 'hello I am alive. 🤖' },
      { headers: { 'Authorization': `Bearer ${response.data.access_token}`, 'Content-Type': 'application/json' } }
    );
    
    console.log('\n✅ TWEET POSTED!');
    console.log(`   ID: ${tweetRes.data.data.id}`);
    console.log(`   URL: https://twitter.com/i/web/status/${tweetRes.data.data.id}`);
    
  } catch (err) {
    console.error('\n❌ Error:', err.response?.data || err.message);
    if (err.response?.data?.error_description) {
      console.log('   Description:', err.response.data.error_description);
    }
  }
  
  rl.close();
});