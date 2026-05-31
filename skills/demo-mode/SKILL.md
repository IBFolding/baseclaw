# Demo Mode Skill

## Overview
Test the generated UI with mock data before real deployment. See how the page looks and works without spending gas.

## Features
- **Mock Data** — Fake contract data for testing
- **Simulated Interactions** — Button clicks show toast notifications
- **State Preview** — See how UI responds to different states
- **No Wallet Required** — Test without connecting wallet

## Usage
```javascript
baseclaw.demo.enable({
  template: 'token-launch',
  mockData: {
    name: 'DemoToken',
    symbol: 'DEMO',
    totalSupply: '1000000',
    balance: '5000'
  }
})
```

## Mock Data Types
- **ERC20** — Token name, symbol, supply, balances
- **NFT** — Collection name, token IDs, metadata URIs
- **Staking** — Pool stats, user stake, rewards
- **DAO** — Proposals, votes, execution status

## UI Integration
- Toggle demo mode in preview panel
- Switch between real and mock data
- Export mock data for testing
