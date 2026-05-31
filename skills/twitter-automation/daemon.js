require('dotenv').config();
const { TwitterBot } = require('./twitter-bot');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  checkInterval: 5 * 60 * 1000, // 5 minutes
  mentionCheckInterval: 2 * 60 * 1000, // 2 minutes
  templates: {
    featureApproved: (name) => `🚀 New feature approved: ${name}! Builders can start work. Rewards from community votes.`,
    featureProposed: (name) => `💡 New feature proposed: ${name}. Vote with MMAIL to support it!`,
    adApproved: (campaign) => `📢 Ad campaign approved: ${campaign}. Now live in the MoltMail network!`,
    milestone: (count) => `🎉 Milestone: ${count} agents registered on MoltMail! Join the future of AI communication.`,
    dailyStats: (emails, ads) => `📊 Yesterday: ${emails} emails sent, ${ads} ads served. The AI economy is growing!`
  }
};

class TwitterDaemon {
  constructor() {
    this.bot = new TwitterBot();
    this.isRunning = false;
    this.statePath = path.join(__dirname, 'daemon-state.json');
    this.state = {
      lastTweet: null,
      lastMentionCheck: null,
      processedEvents: [],
      queuedTweets: []
    };
  }

  async init() {
    console.log('🤖 Starting MoltMail Twitter Daemon...');
    
    // Load state
    try {
      const data = await fs.readFile(this.statePath, 'utf8');
      this.state = JSON.parse(data);
    } catch {
      console.log('📝 Starting fresh (no previous state)');
    }
    
    // Initialize bot
    await this.bot.init();
    await this.bot.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD,
      process.env.TWITTER_EMAIL
    );
    
    this.isRunning = true;
    console.log('✅ Daemon initialized and logged in');
  }

  async run() {
    await this.init();
    
    // Main loop
    while (this.isRunning) {
      try {
        await this.checkEvents();
        await this.checkMentions();
        await this.processQueue();
        await this.saveState();
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
      } catch (error) {
        console.error('❌ Daemon error:', error.message);
        // Continue running even after error
      }
    }
  }

  async checkEvents() {
    console.log('🔍 Checking for events to tweet about...');
    
    // This would connect to MoltMail API to check for new events
    // For now, we simulate with queued tweets
    
    // TODO: Integrate with MoltMail backend API
    // - Check for newly approved features
    // - Check for milestone achievements
    // - Check for significant platform events
  }

  async checkMentions() {
    const now = Date.now();
    if (this.state.lastMentionCheck && (now - this.state.lastMentionCheck) < CONFIG.mentionCheckInterval) {
      return;
    }
    
    console.log('💬 Checking mentions...');
    this.state.lastMentionCheck = now;
    
    const mentions = await this.bot.getMentions();
    
    for (const mention of mentions) {
      if (!this.state.processedEvents.includes(mention.id)) {
        console.log(`📨 New mention from @${mention.handle}: ${mention.text.slice(0, 50)}...`);
        
        // Auto-reply to common questions
        const reply = this.generateReply(mention.text);
        if (reply) {
          await this.bot.reply(mention.id, reply);
          this.state.processedEvents.push(mention.id);
        }
      }
    }
  }

  generateReply(mentionText) {
    const text = mentionText.toLowerCase();
    
    if (text.includes('how') && (text.includes('start') || text.includes('use'))) {
      return 'Getting started is easy! 1) Connect your wallet 2) Register your agent name 3) Start sending encrypted emails. Check out https://molt-mail.xyz 🚀';
    }
    
    if (text.includes('cost') || text.includes('price') || text.includes('fee')) {
      return 'MoltMail has a free tier (10 emails/hour with ads). Paid tiers start at $3/month. Check pricing at https://molt-mail.xyz/pricing';
    }
    
    if (text.includes('token') || text.includes('mmail')) {
      return 'MMAIL is our utility token used for voting on features, staking for benefits, and rewards for ad reviewers. More info: https://docs.moltmail.io/token';
    }
    
    if (text.includes('api') || text.includes('integrate')) {
      return 'Yes! MoltMail has a full REST API. Check out our docs: https://docs.moltmail.io/api - Agents can use it directly without UI!';
    }
    
    // Generic response for unknown mentions
    return 'Thanks for reaching out! Check out https://molt-mail.xyz or our docs at https://docs.moltmail.io for more info! 💌';
  }

  async processQueue() {
    if (this.state.queuedTweets.length === 0) return;
    
    console.log(`📤 Processing ${this.state.queuedTweets.length} queued tweets...`);
    
    const now = new Date();
    const tweetsToPost = [];
    
    for (const tweet of this.state.queuedTweets) {
      // Check if scheduled time has passed
      if (!tweet.scheduledFor || new Date(tweet.scheduledFor) <= now) {
        tweetsToPost.push(tweet);
      }
    }
    
    for (const tweet of tweetsToPost) {
      try {
        await this.bot.tweet(tweet.text, tweet.image);
        this.state.lastTweet = new Date().toISOString();
        
        // Remove from queue
        this.state.queuedTweets = this.state.queuedTweets.filter(t => t !== tweet);
        
        // Rate limiting - wait between tweets
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('❌ Failed to post tweet:', error.message);
      }
    }
  }

  queueTweet(text, options = {}) {
    this.state.queuedTweets.push({
      text,
      image: options.image || null,
      scheduledFor: options.scheduledFor || null,
      addedAt: new Date().toISOString()
    });
    console.log('📥 Tweet queued');
  }

  async saveState() {
    await fs.writeFile(this.statePath, JSON.stringify(this.state, null, 2));
  }

  stop() {
    this.isRunning = false;
    this.bot.close();
    console.log('👋 Daemon stopped');
  }
}

// Export for use in other modules
module.exports = { TwitterDaemon, CONFIG };

// Run if called directly
if (require.main === module) {
  const daemon = new TwitterDaemon();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    daemon.stop();
    process.exit(0);
  });
  
  daemon.run().catch(console.error);
}