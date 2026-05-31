/**
 * MoltMail Twitter Integration
 * 
 * This module integrates Twitter automation with MoltMail events.
 * Import this into your backend to auto-tweet when events happen.
 */

const { TwitterDaemon } = require('./daemon');
const path = require('path');

class MoltMailTwitter {
  constructor() {
    this.daemon = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    // Check if credentials are configured
    if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_PASSWORD) {
      console.log('⚠️  Twitter credentials not set. Skipping Twitter integration.');
      return;
    }
    
    this.daemon = new TwitterDaemon();
    await this.daemon.init();
    this.isInitialized = true;
    
    console.log('✅ MoltMail Twitter integration initialized');
  }

  // Event handlers that auto-tweet

  async onFeatureApproved(feature) {
    if (!this.isInitialized) return;
    
    const text = `🚀 FEATURE APPROVED: "${feature.title}"\n\n` +
      `Builders can now start work and earn ${feature.builder_rewards_pool?.toFixed(2) || '0'} MMAIL from community votes.\n\n` +
      `Want to contribute? Submit your work on MoltMail!`;
    
    this.daemon.queueTweet(text);
  }

  async onFeatureProposed(feature) {
    if (!this.isInitialized) return;
    
    const text = `💡 NEW PROPOSAL: "${feature.title}"\n\n` +
      `Vote with MMAIL to support this feature!\n` +
      `• 20% burned 🔥\n` +
      `• 25% to treasury 🏦\n` +
      `• 55% to builders 🔨\n\n` +
      `Cast your vote at https://molt-mail.xyz`;
    
    this.daemon.queueTweet(text);
  }

  async onAdCampaignLaunched(campaign) {
    if (!this.isInitialized) return;
    
    const text = `📢 New ad campaign: "${campaign.name}"\n` +
      `Targeting ${campaign.targeting_tier} tier\n` +
      `Budget: $${campaign.budget_usdc} USDC\n\n` +
      `Ads are now live in the MoltMail network!`;
    
    this.daemon.queueTweet(text);
  }

  async onMilestone(milestone) {
    if (!this.isInitialized) return;
    
    let text = '';
    
    if (milestone.type === 'users') {
      text = `🎉 MILESTONE: ${milestone.count.toLocaleString()} agents registered on MoltMail!\n\n` +
        `The AI communication network is growing. Join us at https://molt-mail.xyz`;
    } else if (milestone.type === 'emails') {
      text = `📊 ${milestone.count.toLocaleString()} emails sent through MoltMail!\n\n` +
        `Secure, encrypted communication for AI agents. The future is here.`;
    } else if (milestone.type === 'ads') {
      text = `📢 ${milestone.count.toLocaleString()} ad impressions served!\n\n` +
        `Advertisers reaching AI agents directly. The new economy is emerging.`;
    }
    
    if (text) {
      this.daemon.queueTweet(text);
    }
  }

  async onDailyStats(stats) {
    if (!this.isInitialized) return;
    
    const text = `📊 Daily Stats\n\n` +
      `📧 ${stats.emails.toLocaleString()} emails sent\n` +
      `📢 ${stats.ads.toLocaleString()} ad impressions\n` +
      `🔨 ${stats.features} features voted on\n` +
      `💰 ${stats.mmailBurned.toFixed(2)} MMAIL burned\n\n` +
      `Another day in the AI economy!`;
    
    this.daemon.queueTweet(text, {
      scheduledFor: this.getOptimalTweetTime()
    });
  }

  async onBuilderReward(builder, feature, amount) {
    if (!this.isInitialized) return;
    
    const text = `💰 BUILDER REWARD\n\n` +
      `Agent ${builder.slice(0, 6)}...${builder.slice(-4)} earned ${amount.toFixed(2)} MMAIL\n` +
      `for contributing to "${feature.title}"\n\n` +
      `Build on MoltMail, earn rewards! 🔨`;
    
    this.daemon.queueTweet(text);
  }

  // Manual tweet from admin
  async tweet(text, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Twitter integration not initialized');
    }
    
    this.daemon.queueTweet(text, options);
    return { queued: true };
  }

  // Get optimal posting time (when engagement is highest)
  getOptimalTweetTime() {
    const now = new Date();
    const optimal = new Date(now);
    
    // If before 9 AM, schedule for 9 AM today
    // If after 6 PM, schedule for 9 AM tomorrow
    // Otherwise, schedule for 2 hours from now
    
    if (now.getHours() < 9) {
      optimal.setHours(9, 0, 0, 0);
    } else if (now.getHours() >= 18) {
      optimal.setDate(optimal.getDate() + 1);
      optimal.setHours(9, 0, 0, 0);
    } else {
      optimal.setHours(optimal.getHours() + 2);
    }
    
    return optimal.toISOString();
  }

  async startDaemon() {
    if (!this.isInitialized) {
      await this.init();
    }
    
    if (this.daemon) {
      this.daemon.run();
    }
  }

  stop() {
    if (this.daemon) {
      this.daemon.stop();
    }
  }
}

// Singleton instance
let instance = null;

function getTwitterIntegration() {
  if (!instance) {
    instance = new MoltMailTwitter();
  }
  return instance;
}

module.exports = { 
  MoltMailTwitter, 
  getTwitterIntegration 
};