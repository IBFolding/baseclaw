# Agent BLUE 🦞

**AI-Powered Blockchain Development Agent for Base Chain**

🌐 **Live URL:** https://baseclaw-puce.vercel.app

Agent BLUE turns your AI assistant into a blockchain developer. Deploy tokens, NFTs, staking pools, DAOs, and more — all through natural language conversation.

![Agent BLUE Logo](logo.svg)

## What It Is

Agent BLUE connects to your local OpenClaw Gateway and gives it blockchain superpowers:

- 🪙 **Deploy ERC20 tokens** with custom supply, decimals, and metadata
- 🎨 **Launch NFT collections** with configurable max supply
- ⚡ **Create staking pools** with reward tokens
- 🏛️ **Deploy DAO governance** with voting mechanisms
- 🎯 **Launch token presales** with hard caps
- 🎁 **Distribute airdrops** via merkle proofs
- 💧 **Create liquidity pools** on Uniswap V2
- ⚙️ **Manage token settings** (mint, burn, pause, transfer ownership)
- 🔐 **Deploy multi-sig wallets** (Gnosis Safe style)
- 📊 **View token dashboards** with real-time metrics
- ✅ **20 contract templates** ready to customize
- 🎨 **Generate AI logos** for your projects

## Architecture

```
User → Browser UI → engine.js → window.ethereum (MetaMask)
                              → LLM API (Kimi/OpenAI/Anthropic)
                              → Base RPC (sepolia.base.org)
```

| Component | Purpose |
|-----------|---------|
| `index.html` | Web UI (chat, projects, wallet, settings) |
| `landing.html` | Landing page with project info |
| `templates.html` | Contract template viewer (20 Solidity templates) |
| `web-templates.html` | Web page template viewer (5 HTML templates) |
| `engine.js` | Real blockchain engine (ethers.js, wallet, LLM) |
| `logo.png` | Agent BLUE logo |
| `baseclaw.json` | OpenClaw agent configuration |
| `SOUL.md` | Agent identity and capabilities |
| `skills/blockchain-deployer/` | Blockchain deployment tools |
| `templates/` | 20 Solidity contract templates |
| `web-templates/` | 5 HTML web page templates |

## Quick Start

### 1. Start the UI Server

**Option A: Local Development**
```bash
cd Agent BLUE
python3 -m http.server 3025
```
Open [http://localhost:3025](http://localhost:3025) in your browser.

**Option B: Live Production**
Visit [https://baseclaw-puce.vercel.app](https://baseclaw-puce.vercel.app) — already deployed and ready to use!

### 2. First-Time Setup (Walkthrough)

When you first open the app, you'll see a walkthrough:

**Step 1: Add Your API Key**
- Go to **Settings** (⚙️ icon in sidebar)
- Click **API Keys** tab
- Add your LLM API key:
  - **Kimi**: Get from [platform.moonshot.cn](https://platform.moonshot.cn)
  - **OpenAI**: Get from [platform.openai.com](https://platform.openai.com)
  - **Claude**: Get from [console.anthropic.com](https://console.anthropic.com)
- Select your preferred provider (Kimi recommended)
- Click **Save**

**Step 2: Connect Your Wallet**
- Click **Connect Wallet** in the right panel
- MetaMask (or any EIP-1193 wallet) will pop up
- Select **Base Sepolia** testnet (free!)
- If you don't have Sepolia ETH, get some from [Base Faucet](https://www.base.org/faucets)

**Step 3: Build Something!**
- Type in the chat: `Create a token called MoonCoin with 1M supply`
- The AI will generate Solidity code
- Review the code, then compile with Foundry
- Deploy to Base Sepolia

### 3. Explore Templates

**Contract Templates** (visit `/templates.html`):

| Template | Type | Description |
|----------|------|-------------|
| ERC20 | Token | Standard token with mint, burn, permit |
| ERC721 | NFT | NFT collection with enumerable and URI |
| ERC1155 | Multi-Token | Gaming/collectible multi-token |
| Staking | DeFi | Reward staking pool |
| DAO | Governance | Voting, proposals, timelock |
| Timelock | Security | Delayed execution |
| Multisig | Wallet | M-of-N signatures |
| Vesting | Token | Cliff and linear release |
| Airdrop | Distribution | Merkle tree distribution |
| Marketplace | NFT | Fixed price and auctions |
| DEX | DeFi | Constant product AMM |
| Bridge | Cross-Chain | Token bridge with relayer |
| Escrow | P2P | Dispute resolution |
| Lending | DeFi | Collateralized loans |
| Yield | DeFi | Auto-compounding vault |
| Launchpad | IDO | Tiered allocations |
| Oracle | Data | Price feeds |
| Random | VRF | Random numbers (testing) |
| Upgradeable | Proxy | ERC1967 proxy pattern |

**Web Page Templates** (visit `/web-templates.html`):

| Template | Type | Description |
|----------|------|-------------|
| Landing Page | Marketing | Hero, features, tokenomics, roadmap |
| DApp Dashboard | Dashboard | Sidebar, stats, assets, transactions |
| NFT Collection | NFT | Gallery grid, mint button, stats |
| Token Sale | Sale | Progress bar, calculator, purchase form |
| Staking Page | DeFi | APY display, stake/unstake forms |

### 4. Deploy a Contract

1. **Chat**: "Deploy an ERC20 token called MyToken with symbol MTK and 1 million supply"
2. **Review**: The AI generates Solidity code — review it in the chat
3. **Compile**: Save the code to `MyToken.sol` and run:
   ```bash
   forge build
   ```
4. **Deploy**: The app will guide you through deployment with your connected wallet
5. **Verify**: Contracts are verified on BaseScan automatically

## Supported Chains

| Chain | Chain ID | Status |
|-------|----------|--------|
| Base Sepolia | 84532 | ✅ Default (free) |
| Base Mainnet | 8453 | ⚠️ Requires explicit confirmation |

## LLM Support

| Provider | Model | API Base |
|----------|-------|----------|
| Kimi (Moonshot) | kimi-k2-6 | api.moonshot.cn |
| OpenAI | gpt-4o | api.openai.com |
| Anthropic | Claude 3 Opus | api.anthropic.com |

## Security

- **No key storage**: Private keys never stored, only used in memory via browser wallet
- **Testnet first**: Defaults to Base Sepolia for all deployments
- **Explicit approval**: Mainnet deployments require manual confirmation
- **Browser wallet only**: Uses EIP-1193 (MetaMask), no raw key handling

## Development

### Adding New Templates

1. Create a new `.sol` file in `templates/`
2. Use `{{PLACEHOLDER}}` syntax for customizable values
3. Add entry to `templates.html` template list

### Testing Locally

```bash
# Run tests
npm test

# Test specific skill
node -e "const { BlockchainDeployer } = require('./skills/blockchain-deployer/index.js'); const d = new BlockchainDeployer(); d.connectPrivateKey('0x...').then(() => d.getBalance('0x...')).then(console.log)"
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main app UI |
| `landing.html` | Landing page |
| `templates.html` | Contract template viewer |
| `engine.js` | Blockchain engine |
| `logo.png` | Agent BLUE logo |
| `baseclaw.json` | Agent config |
| `SOUL.md` | Agent identity |
| `templates/*.sol` | 20 contract templates |
| `skills/blockchain-deployer/` | Deployment skill |

## License

MIT — See [LICENSE](LICENSE)

---

**Built with 🦞 by Howard and the Agent BLUE community**
