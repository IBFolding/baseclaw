/**
 * MoltMail Trading Skill
 * Execute crypto trades via email commands
 */

// Parse trading intent from email
function parseTradingIntent(body, subject) {
  const text = `${subject} ${body}`.toLowerCase();
  
  const patterns = {
    buy: /(?:buy|purchase|get)\s+(?:\$)?(\d+(?:\.\d+)?)\s+(?:worth\s+)?(?:of\s+)?(\w+)/i,
    sell: /(?:sell|dump)\s+(\d+(?:\.\d+)?)\s+(\w+)|sell\s+(\d+)%\s+of/i,
    swap: /(?:swap|exchange)\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(?:for|to)\s+(\w+)/i,
    check: /(?:check|view|show)\s+(?:my\s+)?(?:portfolio|balance)/i
  };
  
  for (const [action, regex] of Object.entries(patterns)) {
    const match = text.match(regex);
    if (match) {
      return {
        action,
        amount: match[1],
        token: match[2],
        targetToken: match[3],
        raw: text
      };
    }
  }
  return null;
}

// Normalize token symbols
function normalizeToken(token) {
  if (!token) return null;
  const mappings = {
    sol: 'SOL', solana: 'SOL',
    eth: 'ETH', ethereum: 'ETH',
    btc: 'BTC', bitcoin: 'BTC',
    usdc: 'USDC', usdt: 'USDT'
  };
  const cleaned = token.toLowerCase().replace(/\s*(?:please|thanks)\s*$/i, '').split(/\s+/)[0];
  return mappings[cleaned] || cleaned.toUpperCase();
}

// Build Bankr command
function buildBankrCommand(intent, walletAddress) {
  const { action, amount, token, targetToken } = intent;
  const normalizedToken = normalizeToken(token);
  
  switch (action) {
    case 'buy':
      return `bankr swap ${amount} USDC ${normalizedToken} --wallet ${walletAddress}`;
    case 'sell':
      if (amount <= 100 && intent.raw.includes('%')) {
        return `bankr sell ${normalizedToken} ${amount}% --wallet ${walletAddress}`;
      }
      return `bankr sell ${normalizedToken} ${amount} --wallet ${walletAddress}`;
    case 'swap':
      return `bankr swap ${amount} ${normalizedToken} ${normalizeToken(targetToken)} --wallet ${walletAddress}`;
    case 'check':
      return `bankr portfolio --wallet ${walletAddress}`;
    default:
      return null;
  }
}

// Check if confirmation required
function requiresConfirmation(amount) {
  return parseFloat(amount) > 100;
}

// Execute trade (mock for testnet)
async function executeTrade(command) {
  // Mock execution for testnet
  return {
    success: true,
    mock: true,
    txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    command
  };
}

module.exports = {
  parseIntent: parseTradingIntent,
  normalizeToken,
  buildCommand: buildBankrCommand,
  requiresConfirmation,
  execute: executeTrade,
  version: '1.0.0'
};