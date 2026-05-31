require('dotenv').config({ path: '/Users/brain/.openclaw/workspace/.env' });

const clientId = process.env.TWITTER_CLIENT_ID;
const redirectUri = 'http://localhost:3000/callback';

if (!clientId) {
  console.log('❌ TWITTER_CLIENT_ID not set in .env');
  process.exit(1);
}

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

console.log('🐦 Twitter OAuth Authorization URL\n');
console.log('='.repeat(60));
console.log('\n' + authUrl + '\n');
console.log('='.repeat(60));
console.log('\n1. COPY the URL above');
console.log('2. PASTE it into your browser');
console.log('3. LOG IN to Twitter if needed');
console.log('4. CLICK "Authorize app"');
console.log('5. COPY the code from the redirect URL (after ?code=)');
console.log('6. PASTE the code here:\n');

// Then ask for the code
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Paste the code here: ', async (code) => {
  console.log('\n⏳ Exchanging code for access token...');
  
  const axios = require('axios');
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  
  const tokenParams = new URLSearchParams({
    code: code.trim(),
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: 'challenge'
  });
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', tokenParams.toString(), {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const fs = require('fs').promises;
    const path = require('path');
    const tokenFile = path.join(__dirname, '.twitter-token.json');
    
    await fs.writeFile(tokenFile, JSON.stringify(response.data, null, 2));
    
    console.log('✅ Token saved!');
    console.log(`   Access token: ${response.data.access_token.slice(0, 20)}...`);
    console.log(`   Expires in: ${response.data.expires_in} seconds`);
    console.log(`   Scope: ${response.data.scope}`);
    console.log('\nYou can now post tweets!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
  
  rl.close();
});