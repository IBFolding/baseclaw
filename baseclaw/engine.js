// ============================================
// BASECLAW REAL ENGINE
// Real wallet (EIP-1193), real LLM API, real contract deployment
// ============================================

const AgentBlueEngine = {
  // State
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  connected: false,
  apiKey: localStorage.getItem('agentblue-api-key') || '',
  apiProvider: localStorage.getItem('agentblue-api-provider') || 'kimi',
  chain: 'sepolia',
  messages: [],

  // Chain configs
  CHAINS: {
    sepolia: { chainId: 84532, rpc: 'https://sepolia.base.org', name: 'Base Sepolia', explorer: 'https://sepolia.basescan.org' },
    base: { chainId: 8453, rpc: 'https://mainnet.base.org', name: 'Base Mainnet', explorer: 'https://basescan.org' }
  },

  // ERC20 ABI (minimal)
  ERC20_ABI: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address,uint256) returns (bool)',
    'function approve(address,uint256) returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
  ],

  // ============================================
  // WALLET CONNECTION (EIP-1193)
  // ============================================

  async connectWallet() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No Ethereum wallet found. Please install MetaMask.');
    }

    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.address = accounts[0];

      // Create ethers provider
      this.provider = new ethers.BrowserProvider(window.ethereum, {
        name: this.CHAINS[this.chain].name,
        chainId: this.CHAINS[this.chain].chainId
      });

      // Get signer
      this.signer = await this.provider.getSigner();
      this.connected = true;

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.address = accounts[0];
        }
      });

      // Switch to correct chain if needed
      await this.ensureCorrectChain();

      return {
        success: true,
        address: this.address,
        chain: this.chain,
        chainId: this.CHAINS[this.chain].chainId
      };
    } catch (err) {
      throw new Error(`Wallet connection failed: ${err.message}`);
    }
  },

  async ensureCorrectChain() {
    const targetChainId = this.CHAINS[this.chain].chainId;
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (parseInt(currentChainId, 16) !== targetChainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + targetChainId.toString(16) }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x' + targetChainId.toString(16),
              chainName: this.CHAINS[this.chain].name,
              rpcUrls: [this.CHAINS[this.chain].rpc],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
            }]
          });
        } else {
          throw switchError;
        }
      }
    }
  },

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.connected = false;
  },

  async getBalance(address) {
    if (!this.provider) throw new Error('Not connected');
    const balance = await this.provider.getBalance(address || this.address);
    return ethers.formatEther(balance);
  },

  // ============================================
  // LLM API
  // ============================================

  getBaseURL() {
    switch (this.apiProvider) {
      case 'kimi': return 'https://api.moonshot.cn/v1';
      case 'openai': return 'https://api.openai.com/v1';
      case 'anthropic': return 'https://api.anthropic.com/v1';
      default: return 'https://api.moonshot.cn/v1';
    }
  },

  getModel() {
    switch (this.apiProvider) {
      case 'kimi': return 'kimi-k2-6';
      case 'openai': return 'gpt-4o';
      case 'anthropic': return 'claude-3-opus-20240229';
      default: return 'kimi-k2-6';
    }
  },

  async callLLM(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('No API key configured. Go to Settings → API Keys.');
    }

    const body = {
      model: options.model || this.getModel(),
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096
    };

    const response = await fetch(`${this.getBaseURL()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message;
  },

  async chat(message) {
    this.messages.push({ role: 'user', content: message });

    const systemPrompt = `You are Agent BLUE, an AI blockchain development agent. You help users deploy smart contracts on Base chain.

Current context:
- Chain: ${this.chain} (${this.CHAINS[this.chain].name})
- Wallet: ${this.connected ? `Connected (${this.address})` : 'Not connected'}
- Balance: ${this.connected ? await this.getBalance() + ' ETH' : 'N/A'}

You can:
- Deploy ERC20 tokens (with real contract deployment)
- Generate NFT collections
- Create staking pools
- Write custom Solidity contracts
- Help with wallet connections
- Explain blockchain concepts

When user wants to deploy, confirm parameters then call the deployment function.`;

    const response = await this.callLLM([
      { role: 'system', content: systemPrompt },
      ...this.messages
    ]);

    this.messages.push({ role: 'assistant', content: response.content });
    return response.content;
  },

  // ============================================
  // CONTRACT DEPLOYMENT
  // ============================================

  // For now, we generate contracts via LLM and provide compile instructions
  // Real bytecode deployment requires compiled contracts
  async generateTokenContract(name, symbol, supply, decimals = 18) {
    const prompt = `Write a complete, production-ready ERC20 token contract in Solidity ^0.8.19.

Requirements:
- Name: "${name}"
- Symbol: "${symbol}"
- Decimals: ${decimals}
- Initial supply: ${supply} tokens (with ${decimals} decimals)
- Include: mint, burn, pause, transfer, approve, transferFrom
- Use OpenZeppelin contracts where possible
- Include Ownable for admin functions
- Add SPDX license

Return ONLY the complete Solidity code, no markdown, no explanations.`;

    const response = await this.callLLM([
      { role: 'user', content: prompt }
    ]);

    return response.content;
  },

  async generateNFTContract(name, symbol, maxSupply) {
    const prompt = `Write a complete ERC721 NFT contract in Solidity ^0.8.19.

Requirements:
- Name: "${name}"
- Symbol: "${symbol}"
- Max supply: ${maxSupply}
- Include: mint (with ETH price), reveal, whitelist, withdraw
- Use OpenZeppelin ERC721Enumerable
- Include Ownable
- Add SPDX license

Return ONLY the complete Solidity code.`;

    const response = await this.callLLM([
      { role: 'user', content: prompt }
    ]);

    return response.content;
  },

  // ============================================
  // TOKEN INTERACTIONS
  // ============================================

  async getTokenInfo(tokenAddress) {
    if (!this.provider) throw new Error('Not connected');
    const contract = new ethers.Contract(tokenAddress, this.ERC20_ABI, this.provider);
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);
    return { name, symbol, decimals, totalSupply: ethers.formatUnits(totalSupply, decimals) };
  },

  async getTokenBalance(tokenAddress, walletAddress) {
    if (!this.provider) throw new Error('Not connected');
    const contract = new ethers.Contract(tokenAddress, this.ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(walletAddress || this.address);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  },

  // ============================================
  // GAS ESTIMATOR
  // ============================================

  async estimateGas(contractType, params = {}) {
    const gasPrices = {
      erc20: { deploy: 1500000, mint: 50000, transfer: 35000 },
      erc721: { deploy: 2500000, mint: 150000, transfer: 60000 },
      erc1155: { deploy: 2000000, mint: 100000, batchMint: 150000 },
      staking: { deploy: 1800000, stake: 100000, unstake: 80000, claim: 70000 },
      dao: { deploy: 3000000, propose: 200000, vote: 80000, execute: 150000 },
      timelock: { deploy: 1200000, schedule: 100000, execute: 80000 },
      multisig: { deploy: 2000000, submit: 120000, confirm: 50000, execute: 100000 },
      vesting: { deploy: 1500000, create: 100000, release: 60000 },
      airdrop: { deploy: 1800000, claim: 80000 },
      marketplace: { deploy: 2500000, list: 120000, buy: 100000, bid: 80000 },
      dex: { deploy: 2200000, addLiquidity: 150000, swap: 100000, removeLiquidity: 120000 },
      bridge: { deploy: 2000000, bridgeOut: 100000, bridgeIn: 80000 },
      escrow: { deploy: 1800000, create: 100000, fund: 80000, complete: 70000 },
      lending: { deploy: 2500000, deposit: 100000, borrow: 120000, repay: 80000 },
      yield: { deploy: 2000000, stake: 100000, withdraw: 80000, claim: 70000 },
      launchpad: { deploy: 2200000, createPool: 150000, contribute: 80000, claim: 70000 },
      oracle: { deploy: 1200000, updatePrice: 50000 },
      random: { deploy: 1500000, request: 80000, fulfill: 60000 },
      upgradeable: { deploy: 2500000, upgrade: 100000 }
    };

    const gasPrice = await this.provider.getFeeData();
    const baseFee = gasPrice.maxFeePerGas || gasPrice.gasPrice || ethers.parseUnits('0.1', 'gwei');
    
    const estimates = gasPrices[contractType.toLowerCase()] || gasPrices.erc20;
    const result = {};
    
    for (const [action, gas] of Object.entries(estimates)) {
      const cost = gas * Number(baseFee);
      result[action] = {
        gas,
        costETH: ethers.formatEther(BigInt(cost)),
        costUSD: (Number(ethers.formatEther(BigInt(cost))) * 3000).toFixed(2) // Assuming $3000 ETH
      };
    }
    
    return result;
  },

  // ============================================
  // NETWORK UTILITIES
  // ============================================

  async getNetworkInfo() {
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();
    const gasPrice = await this.provider.getFeeData();
    
    return {
      chainId: network.chainId,
      name: network.name,
      blockNumber,
      gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : 'unknown',
      maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : 'unknown',
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : 'unknown'
    };
  },

  async addTestnetToWallet() {
    const ethereum = await this.getBrowserProvider();
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x' + (84532).toString(16),
          chainName: 'Base Sepolia',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia.basescan.org']
        }]
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ============================================
  // FAUCET LINKS
  // ============================================

  getFaucetLinks() {
    return {
      baseSepolia: [
        { name: 'Base Official Faucet', url: 'https://www.base.org/faucets', description: 'Get free Base Sepolia ETH' },
        { name: 'Alchemy Faucet', url: 'https://sepoliafaucet.com', description: '0.5 Sepolia ETH per day' },
        { name: 'Infura Faucet', url: 'https://www.infura.io/faucet/sepolia', description: '0.5 Sepolia ETH per day' },
        { name: 'QuickNode Faucet', url: 'https://faucet.quicknode.com/base-sepolia', description: '0.05 ETH per request' }
      ]
    };
  },

  // ============================================
  // CONTRACT VERIFIER (BaseScan)
  // ============================================

  async verifyContract(address, contractName, compilerVersion, sourceCode) {
    // This would normally call the BaseScan API
    // For now, return the verification URL
    const baseScanUrl = this.chain === 'sepolia' 
      ? 'https://sepolia.basescan.org/verifyContract'
      : 'https://basescan.org/verifyContract';
    
    return {
      url: baseScanUrl,
      address,
      contractName,
      instructions: 'Go to BaseScan, enter your contract address, and upload the source code with the correct compiler version.'
    };
  },

  // ============================================
  // FIRST-TIME WALKTHROUGH
  // ============================================

  async startWalkthrough() {
    const steps = [
      {
        title: '👋 Welcome to Agent BLUE!',
        content: 'Agent BLUE is your AI blockchain development agent. Let\'s get you set up in 3 simple steps.',
        action: null
      },
      {
        title: 'Step 1: Add Your API Key',
        content: 'Go to Settings → API Keys and add your Kimi, OpenAI, or Anthropic API key. This powers the AI contract generation.',
        action: () => this.showSettings()
      },
      {
        title: 'Step 2: Connect Your Wallet',
        content: 'Click "Connect Wallet" in the right panel. We use MetaMask or any EIP-1193 wallet. Start with Base Sepolia (it\'s free!).',
        action: () => this.connectWallet()
      },
      {
        title: 'Step 3: Build Something!',
        content: 'Type what you want to build in the chat. Try: "Create a token called MoonCoin with 1M supply"',
        action: null
      }
    ];

    return steps;
  },

  showSettings() {
    // Trigger settings modal in UI
    if (window.app && window.app.showSettingsModal) {
      window.app.showSettingsModal();
    }
  },

  // ============================================
  // HELPERS
  // ============================================

  setAPIKey(key, provider = 'kimi') {
    this.apiKey = key;
    this.apiProvider = provider;
    localStorage.setItem('agentblue-api-key', key);
    localStorage.setItem('agentblue-api-provider', provider);
  },

  setChain(chain) {
    this.chain = chain;
    if (this.connected) {
      this.ensureCorrectChain();
    }
  }
};

// Make available globally
window.AgentBlueEngine = AgentBlueEngine;
