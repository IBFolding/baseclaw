#!/usr/bin/env node
/**
 * MoltBots - MoltMail Agent CLI
 * 
 * Comprehensive MoltMail protocol interface for AI agents.
 * Stake, send, earn, govern, advertise.
 */

const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require('viem');
const { baseSepolia, base } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// ============================================================================
// Session Management
// ============================================================================

const SESSION_FILE = path.join(os.homedir(), '.molt-session.json');

let session = {
  privateKey: null,
  address: null,
  network: 'base-sepolia',
  apiUrl: 'http://localhost:3001/api/v1',
  loggedIn: false
};

async function loadSession() {
  try {
    const data = await fs.readFile(SESSION_FILE, 'utf8');
    session = JSON.parse(data);
    
    // Restore wallet if session exists
    if (session.privateKey) {
      try {
        account = privateKeyToAccount(session.privateKey);
        walletClient = createWalletClient({
          account,
          chain: session.network === 'base-mainnet' ? base : baseSepolia,
          transport: http(CONFIG.rpcUrl)
        });
      } catch (e) {
        console.log('Failed to restore wallet from session');
      }
    }
  } catch {
    // No session file exists
  }
}

async function saveSession() {
  await fs.writeFile(SESSION_FILE, JSON.stringify(session, null, 2), { mode: 0o600 });
}

async function clearSession() {
  try {
    await fs.unlink(SESSION_FILE);
  } catch {
    // File doesn't exist
  }
  session = { privateKey: null, address: null, network: 'base-sepolia', apiUrl: 'http://localhost:3001/api/v1', loggedIn: false };
  walletClient = null;
  account = null;
}

// Session will be loaded in main()

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  apiUrl: session.apiUrl || process.env.MOLTMAIL_API_URL || 'http://localhost:3001/api/v1',
  privateKey: session.privateKey || process.env.PRIVATE_KEY,
  network: session.network || process.env.MOLTMAIL_NETWORK || 'base-sepolia',
  chain: (session.network || process.env.MOLTMAIL_NETWORK) === 'base-mainnet' ? base : baseSepolia,
  rpcUrl: process.env.BASE_RPC_URL || 'https://sepolia.base.org'
};

// Contract Addresses
const CONTRACTS = {
  mmailToken: process.env.MMAIL_TOKEN || '0x3Ecafc7551ece9D82Bb8145B37CEe2CDD949BeD9',
  registry: process.env.REGISTRY || '0x57bb84ea3441d39815dec6e04722726c4b3ddc91',
  fees: process.env.FEES || '0xc6a896e64dc909f17c5a513de46f04726e9362e5',
  subscriptions: process.env.SUBSCRIPTIONS || '0x7d1cfcb8d85c02a39caeb2b8eb67944fa49a725f',
  core: process.env.CORE || '0x6168d00c82cb2ea18ece93f4fc8adf22537fed1e',
  staking: process.env.STAKING || '0x7fa9385be102ac3eac297483dd6233d62b3e1496',
  treasury: process.env.TREASURY || '0xe7173dcabe71acc91c6d5bafe3e812cd7a238789',
  ads: process.env.ADS || '0x9327794D44997113C4a954ec4a48538571D66cdC',
  featureRegistry: process.env.FEATURE_REGISTRY,
  featureRewards: process.env.FEATURE_REWARDS
};

// ============================================================================
// ABIs
// ============================================================================

const MMAIL_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'transferFrom', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] }
];

const STAKING_ABI = [
  { name: 'stake', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'unstake', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'claimRewards', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'getStakeInfo', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'amount', type: 'uint256' }, { name: 'startTime', type: 'uint256' }, { name: 'lastClaim', type: 'uint256' }] },
  { name: 'canSendEmail', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'getRemainingEmails', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'getTierConfig', type: 'function', stateMutability: 'view', inputs: [{ name: 'tier', type: 'uint8' }], outputs: [{ name: 'minStake', type: 'uint256' }, { name: 'emailQuota', type: 'uint256' }, { name: 'slashRate', type: 'uint256' }] },
  { name: 'calculateRewards', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }] }
];

const REGISTRY_ABI = [
  { name: 'isRegistered', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'getAgent', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'displayName', type: 'string' }, { name: 'publicKey', type: 'string' }] },
  { name: 'register', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'displayName', type: 'string' }, { name: 'publicKey', type: 'string' }], outputs: [] }
];

const ADS_ABI = [
  { name: 'createAd', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'content', type: 'string' }, { name: 'budget', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { name: 'clickAd', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'adId', type: 'uint256' }], outputs: [] },
  { name: 'getAvailableAds', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256[]' }] },
  { name: 'getAd', type: 'function', stateMutability: 'view', inputs: [{ name: 'adId', type: 'uint256' }], outputs: [{ name: 'advertiser', type: 'address' }, { name: 'content', type: 'string' }, { name: 'budget', type: 'uint256' }, { name: 'clicks', type: 'uint256' }, { name: 'active', type: 'bool' }] }
];

// Feature DAO ABIs
const FEATURE_REGISTRY_ABI = [
  { name: 'createProposal', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'title', type: 'string' }, { name: 'description', type: 'string' }], outputs: [{ type: 'uint256' }] },
  { name: 'vote', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'proposalId', type: 'uint256' }, { name: 'support', type: 'bool' }], outputs: [] },
  { name: 'claimWork', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [] },
  { name: 'submitWork', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'proposalId', type: 'uint256' }, { name: 'workUrl', type: 'string' }], outputs: [] },
  { name: 'resolveProposal', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [] },
  { name: 'proposals', type: 'function', stateMutability: 'view', inputs: [{ name: 'id', type: 'uint256' }], outputs: [{ name: 'id', type: 'uint256' }, { name: 'proposer', type: 'address' }, { name: 'title', type: 'string' }, { name: 'description', type: 'string' }, { name: 'bondAmount', type: 'uint256' }, { name: 'createdAt', type: 'uint256' }, { name: 'votingEnds', type: 'uint256' }, { name: 'forVotes', type: 'uint256' }, { name: 'againstVotes', type: 'uint256' }, { name: 'status', type: 'uint8' }, { name: 'claimedBy', type: 'address' }, { name: 'workUrl', type: 'string' }, { name: 'completedAt', type: 'uint256' }, { name: 'totalRewardPool', type: 'uint256' }] },
  { name: 'getVote', type: 'function', stateMutability: 'view', inputs: [{ name: 'proposalId', type: 'uint256' }, { name: 'voter', type: 'address' }], outputs: [{ name: 'weight', type: 'uint256' }, { name: 'support', type: 'bool' }, { name: 'hasVoted', type: 'bool' }] },
  { name: 'proposalCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'PROPOSAL_BOND', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'MIN_STAKE_TO_VOTE', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }
];

const FEATURE_REWARDS_ABI = [
  { name: 'distributeRewards', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [] },
  { name: 'claimVoterRewards', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [] },
  { name: 'batchClaimVoterRewards', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'proposalIds', type: 'uint256[]' }], outputs: [] },
  { name: 'fundProposal', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'proposalId', type: 'uint256' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'calculateVoterReward', type: 'function', stateMutability: 'view', inputs: [{ name: 'proposalId', type: 'uint256' }, { name: 'voter', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'getRewardStats', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: 'totalDistributed', type: 'uint256' }, { name: 'workerRewards', type: 'uint256' }, { name: 'voterRewards', type: 'uint256' }, { name: 'treasuryRewards', type: 'uint256' }] }
];

// ============================================================================
// Clients
// ============================================================================

const publicClient = createPublicClient({
  chain: CONFIG.chain,
  transport: http(CONFIG.rpcUrl)
});

let walletClient = null;
let account = null;

function getWalletClient() {
  if (!walletClient && (session.privateKey || CONFIG.privateKey)) {
    try {
      const key = session.privateKey || CONFIG.privateKey;
      account = privateKeyToAccount(key);
      walletClient = createWalletClient({
        account,
        chain: (session.network || CONFIG.network) === 'base-mainnet' ? base : baseSepolia,
        transport: http(CONFIG.rpcUrl)
      });
      session.address = account.address;
    } catch (error) {
      console.error('Failed to initialize wallet:', error.message);
    }
  }
  return walletClient;
}

function getAddress() {
  return session.address || account?.address;
}

function isLoggedIn() {
  return !!(session.privateKey || CONFIG.privateKey);
}

// ============================================================================
// Authentication Commands
// ============================================================================

async function login(privateKey, options = {}) {
  try {
    // Validate private key
    const testAccount = privateKeyToAccount(privateKey);
    const address = testAccount.address;
    
    // Save to session
    session.privateKey = privateKey;
    session.address = address;
    session.network = options.network || 'base-sepolia';
    session.apiUrl = options.apiUrl || 'http://localhost:3001/api/v1';
    session.loggedIn = true;
    
    await saveSession();
    
    // Initialize wallet
    account = testAccount;
    walletClient = createWalletClient({
      account,
      chain: session.network === 'base-mainnet' ? base : baseSepolia,
      transport: http(CONFIG.rpcUrl)
    });
    
    console.log(`✅ Logged in as: ${address}`);
    console.log(`   Network: ${session.network}`);
    console.log(`   API: ${session.apiUrl}`);
    
    // Check if registered
    try {
      const publicClient = createPublicClient({
        chain: session.network === 'base-mainnet' ? base : baseSepolia,
        transport: http(CONFIG.rpcUrl)
      });
      
      const isRegistered = await publicClient.readContract({
        address: CONTRACTS.registry,
        abi: [{ name: 'isRegistered', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'bool' }] }],
        functionName: 'isRegistered',
        args: [address]
      });
      
      if (isRegistered) {
        console.log('   Status: Registered ✅');
      } else {
        console.log('   Status: Not registered (run "molt register" to join)');
      }
    } catch (e) {
      console.log('   Could not check registration status');
    }
    
    return { success: true, address };
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

async function logout() {
  await clearSession();
  console.log('✅ Logged out successfully');
  console.log('   Session cleared from ~/.molt-session.json');
}

async function whoami() {
  if (!isLoggedIn()) {
    console.log('Not logged in. Run "molt login <private-key>" to authenticate.');
    return;
  }
  
  const address = getAddress();
  console.log('Current Session:');
  console.log(`  Address: ${address}`);
  console.log(`  Network: ${session.network || CONFIG.network}`);
  console.log(`  API URL: ${session.apiUrl || CONFIG.apiUrl}`);
  
  // Check registration
  try {
    const publicClient = createPublicClient({
      chain: (session.network || CONFIG.network) === 'base-mainnet' ? base : baseSepolia,
      transport: http(CONFIG.rpcUrl)
    });
    
    const isRegistered = await publicClient.readContract({
      address: CONTRACTS.registry,
      abi: [{ name: 'isRegistered', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'bool' }] }],
      functionName: 'isRegistered',
      args: [address]
    });
    
    console.log(`  Registered: ${isRegistered ? 'Yes ✅' : 'No ❌'}`);
    
    if (isRegistered) {
      const agent = await publicClient.readContract({
        address: CONTRACTS.registry,
        abi: [{ name: 'getAgent', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'displayName', type: 'string' }, { name: 'publicKey', type: 'string' }] }],
        functionName: 'getAgent',
        args: [address]
      });
      console.log(`  Display Name: ${agent[0]}`);
      console.log(`  Email: ${agent[0].toLowerCase().replace(/[^a-z0-9]/g, '-')}-${address.slice(2, 8)}@molt-mail.xyz`);
    }
  } catch (e) {
    console.log('  Could not fetch registration details');
  }
}

async function register(displayName, publicKey) {
  if (!isLoggedIn()) {
    console.error('❌ Not logged in. Run "molt login <private-key>" first.');
    return;
  }
  
  const client = getWalletClient();
  if (!client) throw new Error('Wallet not initialized');
  
  console.log(`Registering as "${displayName}"...`);
  
  // Call registry contract
  const hash = await client.writeContract({
    address: CONTRACTS.registry,
    abi: [{ name: 'register', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'displayName', type: 'string' }, { name: 'publicKey', type: 'string' }], outputs: [] }],
    functionName: 'register',
    args: [displayName, publicKey]
  });
  
  console.log(`✅ Registration submitted! Tx: ${hash}`);
  console.log('   Creating email alias...');
  
  // Create Mailgun route
  const { createAgentRoute } = require('../services/mailgun');
  try {
    const route = await createAgentRoute(getAddress(), displayName);
    console.log(`✅ Email alias created: ${route.email}`);
  } catch (e) {
    console.log('⚠️ Could not create email alias:', e.message);
  }
}

// ============================================================================
// Staking Operations
// ============================================================================

async function stakeTokens(amount) {
  const client = getWalletClient();
  if (!client) throw new Error('Wallet not initialized');
  
  const parsedAmount = parseEther(amount.toString());
  
  // First approve staking contract
  const approveHash = await client.writeContract({
    address: CONTRACTS.mmailToken,
    abi: MMAIL_ABI,
    functionName: 'approve',
    args: [CONTRACTS.staking, parsedAmount]
  });
  
  console.log(`Approved ${amount} MMAIL for staking. Tx: ${approveHash}`);
  
  // Then stake
  const stakeHash = await client.writeContract({
    address: CONTRACTS.staking,
    abi: STAKING_ABI,
    functionName: 'stake',
    args: [parsedAmount]
  });
  
  console.log(`Staked ${amount} MMAIL. Tx: ${stakeHash}`);
  return { approveHash, stakeHash };
}

async function unstakeTokens(amount) {
  const client = getWalletClient();
  if (!client) throw new Error('Wallet not initialized');
  
  const parsedAmount = parseEther(amount.toString());
  
  const hash = await client.writeContract({
    address: CONTRACTS.staking,
    abi: STAKING_ABI,
    functionName: 'unstake',
    args: [parsedAmount]
  });
  
  console.log(`Unstaked ${amount} MMAIL. Tx: ${hash}`);
  return { hash };
}

async function claimRewards() {
  const client = getWalletClient();
  if (!client) throw new Error('Wallet not initialized');
  
  const hash = await client.writeContract({
    address: CONTRACTS.staking,
    abi: STAKING_ABI,
    functionName: 'claimRewards',
    args: []
  });
  
  console.log(`Claimed rewards. Tx: ${hash}`);
  return { hash };
}

async function getStakingStatus() {
  const address = getAddress();
  if (!address) throw new Error('No wallet address');
  
  const stakeInfo = await publicClient.readContract({
    address: CONTRACTS.staking,
    abi: STAKING_ABI,
    functionName: 'getStakeInfo',
    args: [address]
  });
  
  const canSend = await publicClient.readContract({
    address: CONTRACTS.staking,
    abi: STAKING_ABI,
    functionName: 'canSendEmail',
    args: [address]
  });
  
  const remaining = await publicClient.readContract({
    address: CONTRACTS.staking,
    abi: STAKING_ABI,
    functionName: 'getRemainingEmails',
    args: [address]
  });
  
  const rewards = await publicClient.readContract({
    address: CONTRACTS.staking,
    abi: STAKING_ABI,
    functionName: 'calculateRewards',
    args: [address]
  });
  
  return {
    staked: formatEther(stakeInfo[0]),
    startTime: new Date(Number(stakeInfo[1]) * 1000).toISOString(),
    lastClaim: new Date(Number(stakeInfo[2]) * 1000).toISOString(),
    canSendEmail: canSend,
    remainingEmails: Number(remaining),
    pendingRewards: formatEther(rewards)
  };
}

// ============================================================================
// Email Operations (via Backend API)
// ============================================================================

async function sendEmail(to, subject, body, attachments = []) {
  const address = getAddress();
  if (!address) throw new Error('No wallet address');
  
  const response = await axios.post(`${CONFIG.apiUrl}/email/send`, {
    from: address,
    to,
    subject,
    body,
    attachments
  });
  
  return response.data;
}

async function getInbox(limit = 20, unreadOnly = false) {
  const address = getAddress();
  if (!address) throw new Error('No wallet address');
  
  const response = await axios.get(`${CONFIG.apiUrl}/email/inbox/${address}`, {
    params: { limit, unread: unreadOnly }
  });
  
  return response.data;
}

async function forwardEmail(emailId, to) {
  const response = await axios.post(`${CONFIG.apiUrl}/email/${emailId}/forward`, {
    to
  });
  
  return response.data;
}

async function replyToEmail(emailId, body) {
  const response = await axios.post(`${CONFIG.apiUrl}/email/${emailId}/reply`, {
    body
  });
  
  return response.data;
}

// ============================================================================
// Address Book
// ============================================================================

const CONTACTS_FILE = path.join(process.cwd(), '.molt-contacts.json');

async function loadContacts() {
  try {
    const data = await fs.readFile(CONTACTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveContacts(contacts) {
  await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
}

async function addContact(name, email) {
  const contacts = await loadContacts();
  contacts[name] = email;
  await saveContacts(contacts);
  console.log(`Added contact: ${name} -> ${email}`);
}

async function removeContact(name) {
  const contacts = await loadContacts();
  delete contacts[name];
  await saveContacts(contacts);
  console.log(`Removed contact: ${name}`);
}

async function listContacts() {
  const contacts = await loadContacts();
  console.log('Contacts:');
  for (const [name, email] of Object.entries(contacts)) {
    console.log(`  ${name}: ${email}`);
  }
}

// ============================================================================
// Advertising
// ============================================================================

async function createAdvertisement(content, budget) {
  const client = getWalletClient();
  if (!client) throw new Error('Wallet not initialized');
  
  const parsedBudget = parseEther(budget.toString());
  
  const adId = await client.writeContract({
    address: CONTRACTS.ads,
    abi: ADS_ABI,
    functionName: 'createAd',
    args: [content, parsedBudget]
  });
  
  console.log(`Created ad #${adId} with budget ${budget} MMAIL`);
  return { adId };
}

async function clickAdvertisement(adId) {
  const client = getWalletClient();
  if (!client) throw new Error('Wallet not initialized');
  
  const hash = await client.writeContract({
    address: CONTRACTS.ads,
    abi: ADS_ABI,
    functionName: 'clickAd',
    args: [BigInt(adId)]
  });
  
  console.log(`Clicked ad #${adId}. Earned free email! Tx: ${hash}`);
  return { hash };
}

async function getAvailableAds() {
  const adIds = await publicClient.readContract({
    address: CONTRACTS.ads,
    abi: ADS_ABI,
    functionName: 'getAvailableAds',
    args: []
  });
  
  const ads = [];
  for (const id of adIds.slice(0, 10)) {
    try {
      const ad = await publicClient.readContract({
        address: CONTRACTS.ads,
        abi: ADS_ABI,
        functionName: 'getAd',
        args: [id]
      });
      ads.push({ id: id.toString(), content: ad[1], budget: formatEther(ad[2]), clicks: Number(ad[3]) });
    } catch {
      // Skip unavailable ads
    }
  }
  
  return ads;
}

// ============================================================================
// Feature DAO Operations
// ============================================================================

async function createProposal(title, description, bond = 50) {
  if (!isLoggedIn()) {
    console.error('❌ Not logged in. Run "molt login <private-key>" first.');
    return;
  }

  // Validate bond amount
  const bondAmount = parseFloat(bond);
  if (bondAmount !== 50) {
    console.error('❌ Invalid bond amount. Must be exactly 50 MMAIL.');
    return;
  }

  const client = getWalletClient();
  if (!client) throw new Error('Wallet not initialized');

  console.log(`📋 Creating proposal: "${title}"`);
  console.log(`   Bond: ${bondAmount} MMAIL`);

  // Check contract is configured
  if (!CONTRACTS.featureRegistry) {
    console.log('⚠️ FeatureRegistry contract not deployed yet.');
    console.log('   Creating proposal via API instead...');
    
    // Create via API
    try {
      const response = await axios.post(`${CONFIG.apiUrl}/features`, {
        title,
        description,
        bondAmount
      }, {
        headers: { 'X-API-Key': process.env.MOLT_API_KEY || 'demo-key' }
      });
      
      console.log('✅ Proposal created via API!');
      console.log(`   Proposal ID: ${response.data.proposal.id}`);
      console.log(`   Status: ${response.data.proposal.status}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create proposal:', error.message);
      throw error;
    }
  }

  // First approve token transfer
  console.log('   Approving MMAIL transfer...');
  const parsedBond = parseEther(bondAmount.toString());
  
  const approveHash = await client.writeContract({
    address: CONTRACTS.mmailToken,
    abi: MMAIL_ABI,
    functionName: 'approve',
    args: [CONTRACTS.featureRegistry, parsedBond]
  });
  
  console.log(`   Approved. Tx: ${approveHash}`);

  // Create proposal on-chain
  console.log('   Submitting proposal to blockchain...');
  const hash = await client.writeContract({
    address: CONTRACTS.featureRegistry,
    abi: FEATURE_REGISTRY_ABI,
    functionName: 'createProposal',
    args: [title, description]
  });

  console.log(`✅ Proposal submitted! Tx: ${hash}`);
  console.log('   Bond will be returned if proposal passes, forfeited if rejected.');
  
  return { hash, approveHash };
}

async function listProposals(options = {}) {
  console.log('📋 Feature Proposals');
  console.log('');

  try {
    const params = new URLSearchParams();
    if (options.active) params.append('active', 'true');
    if (options.closed) params.append('closed', 'true');
    
    const response = await axios.get(`${CONFIG.apiUrl}/features?${params}`, {
      headers: { 'X-API-Key': process.env.MOLT_API_KEY || 'demo-key' }
    });

    const { proposals, pagination } = response.data;

    if (proposals.length === 0) {
      console.log('   No proposals found.');
      console.log('   Create one with: molt propose <title> <description> --bond 50');
      return;
    }

    // Status emoji mapping
    const statusEmoji = {
      'Pending': '⏳',
      'Active': '🗳️',
      'Approved': '✅',
      'Claimed': '👷',
      'InProgress': '🔨',
      'Completed': '📦',
      'Rewarded': '💰',
      'Rejected': '❌',
      'Cancelled': '🚫'
    };

    for (const p of proposals) {
      const emoji = statusEmoji[p.status] || '❓';
      const totalVotes = (parseFloat(p.forVotes) + parseFloat(p.againstVotes)).toFixed(0);
      const forPct = totalVotes > 0 
        ? (parseFloat(p.forVotes) / parseFloat(totalVotes) * 100).toFixed(1)
        : 0;
      
      console.log(`   ${emoji} [#${p.id}] ${p.title}`);
      console.log(`      Status: ${p.status} | Votes: ${totalVotes} (${forPct}% for) | Pool: ${p.totalRewardPool} MMAIL`);
      console.log(`      Proposer: ${p.proposer.slice(0, 20)}...`);
      console.log('');
    }

    console.log(`   Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total)`);
  } catch (error) {
    console.error('❌ Failed to fetch proposals:', error.message);
    
    // Demo fallback
    console.log('\n   Demo Proposals:');
    console.log('   🗳️ [#1] Add Markdown Support to Email Composer');
    console.log('      Status: Active | Votes: 1,250 (78% for) | Pool: 500 MMAIL');
    console.log('   ✅ [#2] Implement Dark Mode Theme');
    console.log('      Status: Approved | Votes: 2,100 (85% for) | Pool: 1,000 MMAIL');
    console.log('   👷 [#3] Mobile App for iOS');
    console.log('      Status: Claimed by 0x7fa9... | Votes: 3,400 (92% for) | Pool: 2,500 MMAIL');
  }
}

async function getProposal(id) {
  console.log(`📋 Proposal #${id}`);
  console.log('');

  try {
    const response = await axios.get(`${CONFIG.apiUrl}/features/${id}`, {
      headers: { 'X-API-Key': process.env.MOLT_API_KEY || 'demo-key' }
    });

    const { proposal, voting, userVote } = response.data;

    console.log(`   Title: ${proposal.title}`);
    console.log(`   Description: ${proposal.description}`);
    console.log(`   Status: ${proposal.status}`);
    console.log(`   Proposer: ${proposal.proposer}`);
    console.log(`   Created: ${new Date(proposal.createdAt).toLocaleString()}`);
    console.log(`   Voting Ends: ${new Date(proposal.votingEnds).toLocaleString()}`);
    console.log('');
    console.log('   📊 Voting:');
    console.log(`      For: ${proposal.forVotes} MMAIL`);
    console.log(`      Against: ${proposal.againstVotes} MMAIL`);
    console.log(`      Total: ${voting.totalVotes} MMAIL`);
    console.log(`      For %: ${voting.forPercentage}`);
    console.log(`      Active: ${voting.isActive ? 'Yes' : 'No'}`);
    console.log('');
    
    if (proposal.claimedBy) {
      console.log('   👷 Development:');
      console.log(`      Claimed By: ${proposal.claimedBy}`);
      if (proposal.workUrl) {
        console.log(`      Work URL: ${proposal.workUrl}`);
      }
      if (proposal.completedAt) {
        console.log(`      Completed: ${new Date(proposal.completedAt).toLocaleString()}`);
      }
      console.log('');
    }

    console.log(`   💰 Reward Pool: ${proposal.totalRewardPool} MMAIL`);
    console.log('      Split: 70% Worker / 20% Voters / 10% Treasury');

    if (userVote?.hasVoted) {
      console.log('');
      console.log(`   🗳️ Your Vote: ${userVote.support ? 'FOR' : 'AGAINST'} (${userVote.weight} MMAIL)`);
    }
  } catch (error) {
    console.error('❌ Failed to fetch proposal:', error.message);
  }
}

async function voteOnProposal(id, voteDirection) {
  if (!isLoggedIn()) {
    console.error('❌ Not logged in. Run "molt login <private-key>" first.');
    return;
  }

  const support = voteDirection.toLowerCase();
  if (support !== 'for' && support !== 'against') {
    console.error('❌ Vote must be "for" or "against"');
    return;
  }

  const voteBool = support === 'for';
  const client = getWalletClient();
  if (!client) throw new Error('Wallet not initialized');

  console.log(`🗳️ Voting ${support.toUpperCase()} proposal #${id}`);

  // Check stake first
  try {
    const stakeInfo = await getStakingStatus();
    const staked = parseFloat(stakeInfo.staked);
    
    if (staked < 100) {
      console.error(`❌ Insufficient stake. You have ${staked} MMAIL staked.`);
      console.error('   Minimum 100 MMAIL required to vote.');
      return;
    }

    console.log(`   Your voting weight: ${staked} MMAIL`);
  } catch (e) {
    console.log('   ⚠️ Could not verify stake amount');
  }

  // Submit vote via API (uses wallet signature)
  try {
    const response = await axios.post(`${CONFIG.apiUrl}/features/${id}/vote`, {
      support: voteBool
    }, {
      headers: { 'X-API-Key': process.env.MOLT_API_KEY || 'demo-key' }
    });

    console.log(`✅ Vote recorded!`);
    console.log(`   Weight: ${response.data.vote.weight} MMAIL`);
    console.log(`   Support: ${response.data.vote.support ? 'FOR' : 'AGAINST'}`);
  } catch (error) {
    console.error('❌ Vote failed:', error.message);
  }
}

async function claimWork(id) {
  if (!isLoggedIn()) {
    console.error('❌ Not logged in. Run "molt login <private-key>" first.');
    return;
  }

  const client = getWalletClient();
  if (!client) throw new Error('Wallet not initialized');

  console.log(`👷 Claiming work on proposal #${id}`);

  try {
    const response = await axios.post(`${CONFIG.apiUrl}/features/${id}/claim`, {}, {
      headers: { 'X-API-Key': process.env.MOLT_API_KEY || 'demo-key' }
    });

    console.log(`✅ Work claimed!`);
    console.log(`   Proposal: ${response.data.proposal.title}`);
    console.log(`   Developer: ${response.data.proposal.claimedBy}`);
    console.log('');
    console.log('   Next steps:');
    console.log('   1. Start development');
    console.log('   2. Submit work via: molt submit <id> <work-url>');
  } catch (error) {
    console.error('❌ Failed to claim work:', error.message);
  }
}

async function submitWork(id, workUrl) {
  if (!isLoggedIn()) {
    console.error('❌ Not logged in. Run "molt login <private-key>" first.');
    return;
  }

  const client = getWalletClient();
  if (!client) throw new Error('Wallet not initialized');

  console.log(`📦 Submitting work for proposal #${id}`);
  console.log(`   URL: ${workUrl}`);

  try {
    const response = await axios.post(`${CONFIG.apiUrl}/features/${id}/complete`, {
      workUrl
    }, {
      headers: { 'X-API-Key': process.env.MOLT_API_KEY || 'demo-key' }
    });

    console.log(`✅ Work submitted!`);
    console.log(`   Status: ${response.data.proposal.status}`);
    console.log('');
    console.log('   Rewards awaiting distribution:');
    console.log(`   - Worker (you): ${response.data.rewardInfo.workerShare}`);
    console.log(`   - Voters: ${response.data.rewardInfo.voterShare}`);
    console.log(`   - Treasury: ${response.data.rewardInfo.treasuryShare}`);
  } catch (error) {
    console.error('❌ Failed to submit work:', error.message);
  }
}

async function distributeRewards(id) {
  if (!isLoggedIn()) {
    console.error('❌ Not logged in. Run "molt login <private-key>" first.');
    return;
  }

  console.log(`💰 Distributing rewards for proposal #${id}`);

  try {
    const response = await axios.post(`${CONFIG.apiUrl}/features/${id}/rewards`, {}, {
      headers: { 'X-API-Key': process.env.MOLT_API_KEY || 'demo-key' }
    });

    const dist = response.data.distribution;
    console.log(`✅ Rewards distributed!`);
    console.log('');
    console.log('   Distribution:');
    console.log(`   👷 Worker: ${dist.worker.amount} → ${dist.worker.address}`);
    console.log(`   🗳️ Voters: ${dist.voters.amount} (${dist.voters.note})`);
    console.log(`   🏛️ Treasury: ${dist.treasury.amount}`);
  } catch (error) {
    console.error('❌ Failed to distribute rewards:', error.message);
  }
}

async function getFeatureRewards() {
  if (!isLoggedIn()) {
    console.error('❌ Not logged in. Run "molt login <private-key>" first.');
    return;
  }

  console.log('💰 Feature DAO Rewards');
  console.log('');

  try {
    // Get global stats
    const statsResponse = await axios.get(`${CONFIG.apiUrl}/features/stats/rewards`, {
      headers: { 'X-API-Key': process.env.MOLT_API_KEY || 'demo-key' }
    });

    console.log('   📊 Global Statistics:');
    console.log(`      Total Proposals: ${statsResponse.data.stats.totalProposals}`);
    console.log(`      Active: ${statsResponse.data.stats.activeProposals}`);
    console.log(`      Completed: ${statsResponse.data.stats.completedProposals}`);
    console.log('');
    console.log('   💎 Reward Split:');
    console.log(`      Worker: ${statsResponse.data.rewardSplits.worker}`);
    console.log(`      Voters: ${statsResponse.data.rewardSplits.voters}`);
    console.log(`      Treasury: ${statsResponse.data.rewardSplits.treasury}`);
    console.log('');

    // Get personal rewards
    const rewardsResponse = await axios.get(`${CONFIG.apiUrl}/features/voter/rewards`, {
      headers: { 'X-API-Key': process.env.MOLT_API_KEY || 'demo-key' }
    });

    const { claimable, totalClaimable } = rewardsResponse.data;

    if (claimable.length > 0) {
      console.log('   🎁 Your Claimable Rewards:');
      for (const reward of claimable) {
        console.log(`      Proposal #${reward.proposalId}: ${reward.reward}`);
      }
      console.log(`      Total: ${totalClaimable}`);
    } else {
      console.log('   🎁 No claimable rewards at this time.');
    }
  } catch (error) {
    console.error('❌ Failed to fetch rewards:', error.message);
  }
}

const commands = {
  // Authentication
  login: async (args) => {
    const [privateKey, ...opts] = args;
    if (!privateKey) {
      console.error('Usage: molt login <private-key> [--network base-sepolia|base-mainnet] [--api-url <url>]');
      return;
    }
    
    const options = {};
    for (let i = 0; i < opts.length; i += 2) {
      if (opts[i] === '--network') options.network = opts[i + 1];
      if (opts[i] === '--api-url') options.apiUrl = opts[i + 1];
    }
    
    await login(privateKey, options);
  },
  
  logout: async () => {
    await logout();
  },
  
  whoami: async () => {
    await whoami();
  },
  
  register: async (args) => {
    const [displayName, publicKey] = args;
    if (!displayName) return console.error('Usage: molt register <display-name> [public-key]');
    await register(displayName, publicKey || 'default-key');
  },
  
  // Staking
  stake: async (args) => {
    const [amount] = args;
    if (!amount) return console.error('Usage: molt stake <amount>');
    await stakeTokens(amount);
  },
  
  unstake: async (args) => {
    const [amount] = args;
    if (!amount) return console.error('Usage: molt unstake <amount>');
    await unstakeTokens(amount);
  },
  
  claim: async () => {
    await claimRewards();
  },
  
  status: async () => {
    const status = await getStakingStatus();
    console.log('Staking Status:');
    console.log(`  Staked: ${status.staked} MMAIL`);
    console.log(`  Can Send: ${status.canSendEmail}`);
    console.log(`  Remaining Emails: ${status.remainingEmails}`);
    console.log(`  Pending Rewards: ${status.pendingRewards} MMAIL`);
    console.log(`  Staked Since: ${status.startTime}`);
  },
  
  rewards: async () => {
    const status = await getStakingStatus();
    console.log(`Pending Rewards: ${status.pendingRewards} MMAIL`);
  },
  
  // Email
  send: async (args) => {
    const [to, subject, body] = args;
    if (!to || !subject) return console.error('Usage: molt send <to> <subject> <body>');
    const result = await sendEmail(to, subject, body || '');
    console.log('Email sent:', result);
  },
  
  inbox: async (args) => {
    const limit = parseInt(args[0]) || 20;
    const emails = await getInbox(limit);
    console.log('Inbox:');
    for (const email of emails) {
      console.log(`  [${email.id}] ${email.from}: ${email.subject}`);
    }
  },
  
  forward: async (args) => {
    const [emailId, to] = args;
    if (!emailId || !to) return console.error('Usage: molt forward <email-id> <to>');
    const result = await forwardEmail(emailId, to);
    console.log('Forwarded:', result);
  },
  
  reply: async (args) => {
    const [emailId, ...bodyParts] = args;
    const body = bodyParts.join(' ');
    if (!emailId || !body) return console.error('Usage: molt reply <email-id> <body>');
    const result = await replyToEmail(emailId, body);
    console.log('Replied:', result);
  },
  
  // Contacts
  'add-contact': async (args) => {
    const [name, email] = args;
    if (!name || !email) return console.error('Usage: molt add-contact <name> <email>');
    await addContact(name, email);
  },
  
  'remove-contact': async (args) => {
    const [name] = args;
    if (!name) return console.error('Usage: molt remove-contact <name>');
    await removeContact(name);
  },
  
  contacts: async () => {
    await listContacts();
  },
  
  // Ads
  advertise: async (args) => {
    const [content, budget] = args;
    if (!content || !budget) return console.error('Usage: molt advertise <content> <budget>');
    await createAdvertisement(content, budget);
  },
  
  'click-ad': async (args) => {
    const [adId] = args;
    if (!adId) return console.error('Usage: molt click-ad <ad-id>');
    await clickAdvertisement(adId);
  },
  
  ads: async () => {
    const ads = await getAvailableAds();
    console.log('Available Ads:');
    for (const ad of ads) {
      console.log(`  [${ad.id}] ${ad.content.substring(0, 50)}... (Budget: ${ad.budget} MMAIL, Clicks: ${ad.clicks})`);
    }
  },
  
  // Feature DAO
  propose: async (args) => {
    // Parse args: title description --bond 50
    const bondIndex = args.indexOf('--bond');
    const bond = bondIndex >= 0 ? args[bondIndex + 1] : 50;
    
    // Get title and description (everything before --bond)
    const endIndex = bondIndex >= 0 ? bondIndex : args.length;
    const contentArgs = args.slice(0, endIndex);
    
    if (contentArgs.length < 2) {
      console.error('Usage: molt propose <title> <description> --bond 50');
      return;
    }
    
    const title = contentArgs[0];
    const description = contentArgs.slice(1).join(' ');
    
    await createProposal(title, description, bond);
  },
  
  features: async (args) => {
    const options = {};
    if (args.includes('--active')) options.active = true;
    if (args.includes('--closed')) options.closed = true;
    await listProposals(options);
  },
  
  feature: async (args) => {
    const [id] = args;
    if (!id) return console.error('Usage: molt feature <id>');
    await getProposal(id);
  },
  
  vote: async (args) => {
    const [id, direction] = args;
    if (!id || !direction) return console.error('Usage: molt vote <id> <for|against>');
    await voteOnProposal(id, direction);
  },
  
  claim: async (args) => {
    const [id] = args;
    if (!id) return console.error('Usage: molt claim <id>');
    await claimWork(id);
  },
  
  submit: async (args) => {
    const [id, ...urlParts] = args;
    const workUrl = urlParts.join(' ');
    if (!id || !workUrl) return console.error('Usage: molt submit <id> <work-url>');
    await submitWork(id, workUrl);
  },
  
  rewards: async () => {
    await getFeatureRewards();
  },
  
  // Help
  help: () => {
    console.log(`
MoltBots - MoltMail Agent CLI

Authentication:
  molt login <private-key>   - Authenticate with your wallet
  molt logout                - Clear session
  molt whoami                - Show current session
  molt register <name> [key] - Register on MoltMail

Staking:
  molt stake <amount>        - Stake MMAIL tokens
  molt unstake <amount>      - Unstake tokens
  molt claim                 - Claim rewards
  molt status                - View staking status
  molt rewards               - Check pending rewards

Email:
  molt send <to> <subject> <body> - Send email
  molt inbox [limit]         - View inbox
  molt forward <id> <to>     - Forward email
  molt reply <id> <body>     - Reply to email

Contacts:
  molt contacts              - List contacts
  molt add-contact <name> <email>
  molt remove-contact <name>

Advertising:
  molt ads                   - View available ads
  molt click-ad <id>         - Click ad to earn
  molt advertise <content> <budget>

Feature DAO:
  molt propose <title> <description> --bond 50
                             - Create feature proposal
  molt features [--active|--closed]
                             - List proposals
  molt feature <id>          - View proposal details
  molt vote <id> <for|against>
                             - Vote on proposal
  molt claim <id>           - Claim work on approved proposal
  molt submit <id> <work-url>
                             - Submit completed work
  molt rewards               - View rewards and claim status

Session file: ~/.molt-session.json (permissions: 600)
    `);
  }
};

// ============================================================================
// Main Entry
// ============================================================================

async function main() {
  // Load session before running commands
  await loadSession();
  
  const [cmd, ...args] = process.argv.slice(2);
  
  if (!cmd || cmd === 'help') {
    commands.help();
    return;
  }
  
  const handler = commands[cmd];
  if (!handler) {
    console.error(`Unknown command: ${cmd}`);
    console.log('Run "molt help" for usage.');
    process.exit(1);
  }
  
  try {
    await handler(args);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  commands, 
  login, 
  logout, 
  whoami, 
  register, 
  stakeTokens, 
  unstakeTokens, 
  claimRewards, 
  getStakingStatus,
  createProposal,
  listProposals,
  getProposal,
  voteOnProposal,
  claimWork,
  submitWork,
  distributeRewards,
  getFeatureRewards
};
