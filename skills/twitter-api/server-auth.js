const http = require('http');
const url = require('url');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config({ path: '/Users/brain/.openclaw/workspace/.env' });

const PORT = 3005;
const PUBLIC_CALLBACK = 'https://httpbin.org/get'; // Temporary public callback

const clientId = process.env.TWITTER_CLIENT_ID;
const clientSecret = process.env.TWITTER_CLIENT_SECRET;

console.log('🚀 Starting Twitter OAuth callback server...\n');
console.log(`Server will listen on http://localhost:${PORT}`);
console.log('Waiting for Twitter redirect...\n');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const code = parsedUrl.query.code;
  const error = parsedUrl.query.error;
  
  if (error) {
    console.log('❌ OAuth error:', error);
    res.end('Error: ' + error);
    server.close();
    return;
  }
  
  if (code) {
    console.log('✅ Got authorization code!');
    console.log('⏳ Exchanging for access token...\n');
    
    try {
      const tokenParams = new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: `http://localhost:${PORT}/callback`,
        code_verifier: 'challenge'
      });
      
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      const response = await axios.post('https://api.twitter.com/2/oauth2/token', tokenParams.toString(), {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const tokenFile = path.join(__dirname, '.twitter-token.json');
      await fs.writeFile(tokenFile, JSON.stringify(response.data, null, 2));
      
      console.log('✅ SUCCESS! Token saved.');
      console.log(`   Access Token: ${response.data.access_token.slice(0, 30)}...`);
      console.log('\n🐦 Ready to post tweets!');
      
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>✅ Twitter Connected!</h1>
            <p>You can close this window and return to the terminal.</p>
            <script>window.close();</script>
          </body>
        </html>
      `);
      
      // Post the tweet
      console.log('\n📝 Posting tweet...');
      await postTweet(response.data.access_token);
      
    } catch (err) {
      console.error('❌ Token exchange failed:', err.response?.data || err.message);
      res.end('Error: ' + (err.response?.data?.error_description || err.message));
    }
    
    server.close();
    process.exit(0);
  }
  
  res.writeHead(200);
  res.end('Twitter OAuth Server Running...');
});

async function postTweet(accessToken) {
  try {
    const response = await axios.post('https://api.twitter.com/2/tweets', 
      { text: 'hello I am alive. 🤖' },
      { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );
    
    console.log('\n✅ TWEET POSTED!');
    console.log(`   ID: ${response.data.data.id}`);
    console.log(`   URL: https://twitter.com/i/web/status/${response.data.data.id}`);
    
  } catch (err) {
    console.error('❌ Tweet failed:', err.response?.data || err.message);
  }
}

server.listen(PORT, () => {
  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=http%3A%2F%2Flocalhost%3A${PORT}%2Fcallback&scope=tweet.read+tweet.write+users.read+offline.access&state=server_${Date.now()}&code_challenge=challenge&code_challenge_method=plain`;
  
  console.log('\n' + '='.repeat(60));
  console.log('CLICK THIS URL:');
  console.log('='.repeat(60));
  console.log('\n' + authUrl + '\n');
  console.log('='.repeat(60));
  console.log('\nThe server will automatically capture the code and post your tweet.\n');
});

// Timeout after 5 minutes
setTimeout(() => {
  console.log('\n⏰ Timeout - no response in 5 minutes');
  server.close();
  process.exit(1);
}, 5 * 60 * 1000);