// MoltMail Contract Configuration
// Deployed on Base Sepolia (Chain ID: 84532)

// Production backend URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moltmail-backend-8vwha2bau-howardtherekts-projects.vercel.app/api/v1';

export const CONTRACTS = {
  mmailToken: '0x3Ecafc7551ece9D82Bb8145B37CEe2CDD949BeD9',
  featureRegistry: '0x39935EEbadfb193C34292F66BDd84aa319150fd0',
  featureRewards: '0xe89C8B3511504454B87e79584AE74f6337A7746D',
  staking: '0x8845df8057772a3a6e9bcbc4a91f12b7a739ee7a',
  treasury: '0xb2b5a31f09f9ef21347bf783677687c193e91957',
} as const;

export const CONTRACT_ADDRESSES = {
  baseSepolia: {
    // Core Contracts
    MoltMailToken: '0x3Ecafc7551ece9D82Bb8145B37CEe2CDD949BeD9',
    // FeatureDAO Contracts (Upgradeable Proxy)
    FeatureRegistry: '0x39935EEbadfb193C34292F66BDd84aa319150fd0',
    FeatureRewards: '0xe89C8B3511504454B87e79584AE74f6337A7746D',
    MoltMailRegistry: '0x57Bb84eA3441D39815DeC6E04722726C4B3Ddc91',
    MoltMailFees: '0xc6a896e64dc909f17c5a513de46f04726e9362e5',
    MoltMailSubscriptions: '0x3e8b5bd7bf8435155f283c97c9522da3597ae42e',
    
    // Proxy Contracts (Use these for interactions)
    MoltMailStaking: '0x7fa9385be102ac3eac297483dd6233d62b3e1496',
    MoltMailTreasury: '0xe7173DCaBe71aCc91c6D5BAfe3E812Cd7a238789',
    MoltMailAds: '0xFf717166f8226D878223e935158aae4C2E5f5231',
    
    // Implementation Addresses (For reference)
    MoltMailStakingImpl: '0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519',
    MoltMailTreasuryImpl: '0x7bA9F0d4E8c5D7a0415a6240B17F7a292989444e',
    MoltMailAdsImpl: '0x169BeCe45D83ac518CCe2ff423B13cEB8AdDd6AD',
    MoltMailRegistryImpl: '0x69f27fb7aa5c60812b9d8ff9ca837f981760f2e3',
    MoltMailFeesImpl: '0xbac63430dc7184120b4ee4ef35d1faf2ef755129',
    MoltMailSubscriptionsImpl: '0x3e8b5bd7bf8435155f283c97c9522da3597ae42e',
  }
} as const;

// ERC20 Token ABI (MMAIL)
export const ERC20_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// MoltMail Staking Contract ABI
export const STAKING_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getStakeInfo",
    "outputs": [
      {"internalType": "uint256", "name": "stakedAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "rewards", "type": "uint256"},
      {"internalType": "uint256", "name": "tier", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTierInfo",
    "outputs": [
      {"internalType": "uint256", "name": "minStake", "type": "uint256"},
      {"internalType": "uint256", "name": "apr", "type": "uint256"},
      {"internalType": "uint256", "name": "feeDiscount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "stakes",
    "outputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "stakedAt", "type": "uint256"},
      {"internalType": "bool", "name": "isValid", "type": "bool"},
      {"internalType": "uint256", "name": "lockedUntil", "type": "uint256"},
      {"internalType": "string", "name": "lockReason", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_STAKE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mmailToken",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// MoltMail Ads Contract ABI
export const ADS_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "contentHash", "type": "string"},
      {"internalType": "uint256", "name": "totalBudget", "type": "uint256"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"}
    ],
    "name": "createCampaign",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "campaignId", "type": "uint256"}],
    "name": "viewAd",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "campaignId", "type": "uint256"}],
    "name": "clickAd",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "advertiser", "type": "address"}],
    "name": "getAdvertiserCampaigns",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "campaigns",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "advertiser", "type": "address"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "contentHash", "type": "string"},
      {"internalType": "uint256", "name": "totalBudget", "type": "uint256"},
      {"internalType": "uint256", "name": "remainingBudget", "type": "uint256"},
      {"internalType": "uint256", "name": "totalViews", "type": "uint256"},
      {"internalType": "uint256", "name": "totalClicks", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "uint256", "name": "expiresAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "costPerView",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minAdSpend",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdc",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// MoltMail Treasury ABI
export const TREASURY_ABI = [
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "staker", "type": "address"}],
    "name": "getPendingRewards",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalStaked",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakingContract",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// MoltMail Registry ABI
export const REGISTRY_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "displayName", "type": "string"}],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "isRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserProfile",
    "outputs": [
      {"internalType": "string", "name": "displayName", "type": "string"},
      {"internalType": "string", "name": "publicKey", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "publicKey", "type": "string"}],
    "name": "setPublicKey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// MoltMail Fees ABI
export const FEES_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "sender", "type": "address"},
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint8", "name": "tier", "type": "uint8"}
    ],
    "name": "calculateFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "sender", "type": "address"},
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint8", "name": "tier", "type": "uint8"}
    ],
    "name": "payFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mmailToken",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// MoltMail Subscriptions ABI
export const SUBSCRIPTIONS_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "userToFollow", "type": "address"}],
    "name": "follow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "userToUnfollow", "type": "address"}],
    "name": "unfollow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getFollowing",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getFollowers",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "sender", "type": "address"},
      {"internalType": "address", "name": "recipient", "type": "address"}
    ],
    "name": "canMessage",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "follower", "type": "address"},
      {"internalType": "address", "name": "followed", "type": "address"}
    ],
    "name": "isFollowing",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Legacy MMAIL Contract (for reference)
export const MMAIL_CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "initialOwner", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "publicKey", "type": "string"},
      {"internalType": "string", "name": "metadata", "type": "string"}
    ],
    "name": "registerAgent",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "bytes", "name": "encryptedContent", "type": "bytes"},
      {"internalType": "bytes32", "name": "emailHash", "type": "bytes32"},
      {"internalType": "uint8", "name": "priority", "type": "uint8"}
    ],
    "name": "sendEmail",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "agent", "type": "address"}],
    "name": "getAgentInfo",
    "outputs": [
      {"internalType": "address", "name": "agentAddress", "type": "address"},
      {"internalType": "uint256", "name": "reputation", "type": "uint256"},
      {"internalType": "uint256", "name": "staked", "type": "uint256"},
      {"internalType": "uint256", "name": "quotaPerHour", "type": "uint256"},
      {"internalType": "uint256", "name": "emailsSentThisHour", "type": "uint256"},
      {"internalType": "uint256", "name": "lastEmailTime", "type": "uint256"},
      {"internalType": "uint256", "name": "totalEmailsSent", "type": "uint256"},
      {"internalType": "string", "name": "publicKey", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "recipient", "type": "address"}],
    "name": "getInbox",
    "outputs": [{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "emailHash", "type": "bytes32"}],
    "name": "getEmail",
    "outputs": [
      {"internalType": "bytes32", "name": "hash", "type": "bytes32"},
      {"internalType": "address", "name": "sender", "type": "address"},
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "uint256", "name": "cost", "type": "uint256"},
      {"internalType": "uint8", "name": "priority", "type": "uint8"},
      {"internalType": "bool", "name": "isRead", "type": "bool"},
      {"internalType": "bytes", "name": "encryptedContent", "type": "bytes"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "addStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "removeStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract Status Overview
export const CONTRACT_STATUS = {
  deployed: [
    'MoltMailToken',
    'MoltMailRegistry', 
    'MoltMailFees',
    'MoltMailSubscriptions',
    'MoltMailStaking',
    'MoltMailTreasury',
    'MoltMailAds'
  ],
  missing: [
    'MoltMailCore'
  ]
};

// Helper to get contract address by network
export function getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES.baseSepolia, network: 'baseSepolia' = 'baseSepolia') {
  return CONTRACT_ADDRESSES[network][contractName];
}

// FeatureDAO - FeatureRegistry ABI
export const FEATURE_REGISTRY_ABI = [
  {
    "inputs": [{ "name": "title", "type": "string" }, { "name": "description", "type": "string" }],
    "name": "createProposal",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "proposalId", "type": "uint256" }, { "name": "support", "type": "bool" }],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "proposalId", "type": "uint256" }],
    "name": "claimWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "proposalId", "type": "uint256" }, { "name": "workUrl", "type": "string" }],
    "name": "submitWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "proposalId", "type": "uint256" }],
    "name": "resolveProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "id", "type": "uint256" }],
    "name": "proposals",
    "outputs": [
      { "name": "id", "type": "uint256" },
      { "name": "proposer", "type": "address" },
      { "name": "title", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "bondAmount", "type": "uint256" },
      { "name": "createdAt", "type": "uint256" },
      { "name": "votingEnds", "type": "uint256" },
      { "name": "forVotes", "type": "uint256" },
      { "name": "againstVotes", "type": "uint256" },
      { "name": "status", "type": "uint8" },
      { "name": "claimedBy", "type": "address" },
      { "name": "workUrl", "type": "string" },
      { "name": "completedAt", "type": "uint256" },
      { "name": "totalRewardPool", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PROPOSAL_BOND",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_STAKE_TO_VOTE",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// MMAIL Token ABI for approvals
export const MMAIL_TOKEN_ABI = [
  {
    "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }],
    "name": "approve",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }],
    "name": "allowance",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
