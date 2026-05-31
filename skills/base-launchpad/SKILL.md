---
name: base-launchpad
description: Zero-code token launchpad for Base blockchain. Deploy ERC20 tokens, NFTs, and staking contracts with AI-generated branding, marketing content, and one-click deployment.
metadata: {"openclaw":{"emoji":"🚀","requires":{"bins":["node","npm"],"node":"^20.0.0"}}}
user-invocable: true
---

# Base Launchpad

Launch tokens on Base blockchain with zero coding. Full branding, marketing, and deployment pipeline included.

## What It Does

**The Complete Flow:**
1. **Configure** — Answer questions about your token
2. **Security Scan** — AI checks for safety issues
3. **Generate Contract** — Battle-tested Solidity code
4. **Deploy** — One-click to Base Sepolia or Mainnet
5. **Brand** — AI logo, website, social media kit
6. **Market** — Pre-written posts, community setup, influencer templates

**Total time: ~30 minutes from idea to live token.**

## Setup

```bash
cd /Users/brain/.openclaw/workspace/base-launchpad
npm install
npm run build
```

## Usage

### Launch a Token (Interactive)

```bash
cd /Users/brain/.openclaw/workspace/base-launchpad
node dist/cli.js
```

Follow the prompts:
- Token name and symbol
- Features (burn, mint, pause)
- Taxes (marketing, LP, burn)
- Anti-whale limits
- Network (Sepolia testnet or Mainnet)

### Launch a Token (Programmatic)

```typescript
import { createLaunchpad, TokenConfig } from './dist/index.js';

const config: TokenConfig = {
  name: 'My Token',
  symbol: 'MTK',
  decimals: 18,
  totalSupply: '1000000',
  burnable: true,
  marketingTax: 2,
  lpTax: 1,
  network: 'base-sepolia',
};

const launchpad = createLaunchpad(config);
const result = await launchpad.runFullLaunch('0xYourPrivateKey');
```

## Security Features

### Template Security
- All templates based on OpenZeppelin standards
- No hidden mint functions (unless explicitly requested)
- Owner functions clearly labeled with warnings
- Renounce ownership prompt after launch
- Max transaction limits configurable (anti-whale)
- Tax caps at 10% total (safety limit)

### User Protections
- **Mainnet Gate:** Must pass security quiz to deploy to mainnet
- **Cost Warnings:** Full cost breakdown before any action
- **Scam Detection:** Warns if user is copying known rug patterns
- **Approval Flow:** Mainnet deploys require manual approval (24h expiry)
- **Test First:** Sepolia mandatory before mainnet

## Contract Templates

| Template | Complexity | Features |
|----------|-----------|----------|
| **Standard ERC20** | Simple | Transfer, Approve, Balance |
| **Deflationary ERC20** | Medium | Burn, Taxes, Anti-whale |
| **Governance ERC20** | Advanced | Voting, Delegation |
| **NFT Collection** | Medium | Mint, Metadata, Royalties |
| **Staking/Yield** | Advanced | Stake, Earn, Compound |

## Media Generation

### Logo
- AI-generated based on style (meme, professional, abstract, character, minimalist)
- Color palette selection
- Transparent background
- Multiple formats (PNG, SVG, ICO)

### Social Media Kit
- Twitter/X banner and avatar
- Telegram avatar
- Discord icon
- Website favicon

### Website Builder
One-page landing site with:
- Hero section with token info
- Contract address display
- Buy button (Uniswap link)
- Social links
- Roadmap
- FAQ
- Responsive design
- 4 themes: dark, light, cyberpunk, minimal

### Content Package
- Token description (CoinGecko/CMC ready)
- Twitter announcement thread
- Telegram welcome message
- Website about section
- Roadmap suggestions
- FAQ with common questions

## Marketing Automation

### Launch Posts
- Twitter announcement (2 tweets)
- Telegram welcome post
- Discord announcement

### Community Setup
- Telegram group template (name, rules, welcome)
- Discord server template (channels, roles)
- Twitter bio + pinned tweet

### Influencer Outreach
- 3 templates (Twitter threader, Telegram call channel, YouTube reviewer)
- Customizable with token details

### Ongoing Content
- Daily engagement posts (5 templates)
- Milestone posts (100, 1K, 10K holders)
- Airdrop announcements
- Partnership/listing announcements

## API Reference

### Security Scanner

```typescript
import { SecurityScanner } from './dist/index.js';

const report = SecurityScanner.scan(config);
console.log(report.score); // 0-100
console.log(report.passed); // true/false
console.log(report.warnings); // Array of warnings
console.log(report.errors); // Array of blocking errors
```

### Contract Generator

```typescript
import { ContractGenerator } from './dist/index.js';

const erc20 = ContractGenerator.generateERC20(config);
const nft = ContractGenerator.generateNFT(config);
const staking = ContractGenerator.generateStaking(config);
```

### Deployment Pipeline

```typescript
import { DeploymentFactory } from './dist/index.js';

const pipeline = DeploymentFactory.create(privateKey, 'base-sepolia');
const estimate = await pipeline.estimateDeploymentCost(config);
const result = await pipeline.deploy(config);
```

### Media Manager

```typescript
import { MediaManager } from './dist/index.js';

const logoPrompt = MediaManager.generateLogoPrompt({
  style: 'professional',
  primaryColor: '#0052ff',
  symbol: 'MTK',
  name: 'My Token',
});

const website = MediaManager.generateWebsite({
  tokenName: 'My Token',
  tokenSymbol: 'MTK',
  contractAddress: '0x...',
  network: 'base-sepolia',
  logoUrl: 'logo.png',
  socialLinks: { twitter: 'https://twitter.com/mytoken' },
  roadmap: ['Phase 1: Launch', 'Phase 2: Growth'],
  about: 'My Token is a community-driven...',
  buyLink: 'https://app.uniswap.org/...',
  theme: 'dark',
});
```

### Marketing Bot

```typescript
import { MarketingBot } from './dist/index.js';

const posts = MarketingBot.generateLaunchPosts(config, contractAddress, buyLink);
const community = MarketingBot.generateCommunitySetup(config);
const influencers = MarketingBot.generateInfluencerTemplates(config);
const daily = MarketingBot.generateDailyContent(config);
```

## Security Score Examples

| Configuration | Score | Status |
|--------------|-------|--------|
| Standard ERC20, no mint, testnet | 95/100 | ✅ Excellent |
| Deflationary, 5% tax, no mint | 85/100 | ✅ Good |
| Mintable, pausable, mainnet | 55/100 | ⚠️ Risky |
| 15% total tax | 0/100 | ❌ Blocked |

## Files

| File | Purpose |
|------|---------|
| `src/types.ts` | Configuration schemas + types |
| `src/security.ts` | Security scanner + scoring |
| `src/contracts.ts` | Solidity template generator |
| `src/deploy.ts` | Deployment pipeline |
| `src/media.ts` | Logo, website, content generation |
| `src/marketing.ts` | Social posts, community, outreach |
| `src/index.ts` | Main orchestrator |
| `src/cli.ts` | Interactive CLI |
| `src/index.test.ts` | Test suite |

## Network Configuration

### Base Sepolia (Testnet)
- Chain ID: 84532
- RPC: `https://sepolia.base.org`
- Explorer: `https://sepolia.basescan.org`
- **Use this for testing!**

### Base Mainnet (Live)
- Chain ID: 8453
- RPC: `https://mainnet.base.org`
- Explorer: `https://basescan.org`
- **Requires real ETH and approval!**

## Troubleshooting

**"Invalid private key"** → Must include 0x prefix (e.g., `0x1234...`)

**"Insufficient funds"** → Need ETH on Base for gas. Get from faucet for Sepolia.

**"Security scan failed"** → Fix the listed errors (usually taxes too high)

**"Contract verification failed"** → Manual verification on BaseScan may be needed

## Next Steps

1. Test on Base Sepolia first
2. Get real ETH for Base Mainnet
3. Set up social media accounts
4. Deploy landing page to Vercel/IPFS
5. Announce launch!

---

Built with 💙 for the Base ecosystem.
