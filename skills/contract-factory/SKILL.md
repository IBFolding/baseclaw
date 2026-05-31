# Contract Factory Skill

## Overview
Deploy multiple related contracts in one transaction. Create entire DeFi ecosystems, DAOs, or token economies with a single command.

## Bundles
- **Token Economy** — ERC20 + Staking + Airdrop
- **NFT Ecosystem** — ERC721 + Marketplace + Staking
- **DAO Suite** — Governance + Treasury + Timelock
- **DeFi Protocol** — DEX + Liquidity + Farming
- **Launchpad** — Token + Presale + Vesting + LP

## Usage
```javascript
baseclaw.factory.create('token-economy', {
  tokenName: 'MoonCoin',
  tokenSymbol: 'MOON',
  supply: '1000000',
  stakingAPY: 20,
  airdropRecipients: 1000
})
```

## Deployment Order
1. Deploy core contract (token/NFT)
2. Deploy dependent contracts with core address
3. Configure permissions
4. Verify all contracts
5. Generate unified webpage

## Gas Savings
- Single deployment transaction
- Shared initialization
- Batch verification
- ~40% gas savings vs individual deploys
