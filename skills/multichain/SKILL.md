# Multi-Chain Deploy Skill

## Overview
Deploy contracts to multiple chains from one interface. Base, Optimism, Arbitrum, Polygon, and more.

## Supported Chains
- **Base** (8453/84532) — Default
- **Optimism** (10/420) — L2 scaling
- **Arbitrum** (42161/421613) — L2 scaling
- **Polygon** (137/80001) — Sidechain
- **Ethereum** (1/5) — Mainnet/Goerli
- **Avalanche** (43114/43113) — C-Chain

## Features
- **One Command** — Deploy to multiple chains
- **Address Tracking** — Same contract, different addresses
- **Cross-Chain Bridge** — Move tokens between chains
- **Unified Dashboard** — View all deployments
- **Gas Comparison** — See costs across chains

## Usage
```javascript
baseclaw.multichain.deploy({
  contract: 'MyToken',
  chains: ['base', 'optimism', 'arbitrum'],
  sameAddress: true // Use CREATE2 for same address
})
```

## Bridge Integration
- **LayerZero** — Cross-chain messaging
- **Wormhole** — Token bridging
- **Axelar** — General message passing

## Dashboard
```
MyToken (ERC20)
├── Base: 0x1234...
├── Optimism: 0x5678...
├── Arbitrum: 0x9abc...
└── Total Holders: 1,234
```
