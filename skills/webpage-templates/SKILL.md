# Webpage Templates Skill

## Overview
Prebuilt React/Next.js templates for BaseClaw projects. Auto-configured for contract type with Web3 integration.

## Templates

### ERC20 Token Page
- Token info display (name, symbol, supply)
- Balance checker
- Transfer form
- Mint button (if owner)
- Token holders list

### NFT Collection Page
- Gallery grid with metadata
- Mint button with price
- Owner dashboard
- Collection stats

### Staking Pool Page
- Stake/unstake forms
- Rewards display
- APY calculator
- Pool stats

### DAO Dashboard
- Active proposals list
- Create proposal form
- Vote buttons
- Execution status

## Usage
```
baseclaw.webpage.generate({
  contractType: "erc20",
  contractAddress: "0x...",
  abi: [...],
  projectName: "MyToken"
})
```

## Dependencies
- nextjs-expert
- react-expert
- shadcn-ui
- typescript-pro

## Installation
1. Copy to `~/.openclaw/workspace/skills/webpage-templates/`
2. Add to `agents.defaults.skills` in `~/.openclaw/openclaw.json`
