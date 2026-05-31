require('dotenv').config();
const axios = require('axios');

const TWITTER_API_BASE = 'https://api.twitter.com/2';
const TWITTER_OAUTH_BASE = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';

class TwitterAPI {
  constructor(clientId, clientSecret, redirectUri = 'http://localhost:3000/callback') {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Generate authorization URL
  getAuthUrl(state = 'random_state') {
    const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'];
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state: state,
      code_challenge: 'challenge',
      code_challenge_method: 'plain'
    });
    return `${TWITTER_OAUTH_BASE}?${params.toString()}`;
  }

  // Exchange code for tokens
  async exchangeCode(code) {
    const params = new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      code_verifier: 'challenge'
    });

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await axios.post(TWITTER_TOKEN_URL, params.toString(), {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    this.accessToken = response.data.access_token;
    this.refreshToken = response.data.refresh_token;
    
    return response.data;
  }

  // Post a tweet
  async tweet(text, options = {}) {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call exchangeCode() first or set accessToken.');
    }

    const data = { text };
    
    // Support for reply, quote, etc.
    if (options.replyTo) {
      data.reply = { in_reply_to_tweet_id: options.replyTo };
    }
    
    if (options.mediaKeys) {
      data.media = { media_ids: options.mediaKeys };
    }

    const response = await axios.post(`${TWITTER_API_BASE}/tweets`, data, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  // Get user info
  async getMe() {
    const response = await axios.get(`${TWITTER_API_BASE}/users/me`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });
    return response.data;
  }

  // Upload media (requires additional setup)
  async uploadMedia(filePath) {
    // Media upload is more complex - requires chunked upload for large files
    // Simplified version for images under 5MB
    const fs = require('fs');
    const mediaData = fs.readFileSync(filePath);
    
    const response = await axios.post('https://upload.twitter.com/1.1/media/upload.json', 
      mediaData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/octet-stream'
        }
      }
    );
    
    return response.data.media_id_string;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }
}

module.exports = { TwitterAPI };