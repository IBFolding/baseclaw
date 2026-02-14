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

export const MMAIL_CONTRACT_ADDRESS = {
  base: '0x0000000000000000000000000000000000000000' as const,
  baseSepolia: '0x0000000000000000000000000000000000000000' as const,
};
