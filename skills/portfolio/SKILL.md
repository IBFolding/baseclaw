# Portfolio Tracker Skill

## Overview
Track all your deployed contracts across multiple chains in one dashboard. View balances, transactions, and performance.

## Features
- **Multi-Chain View** — All contracts across Base, Optimism, Arbitrum, etc.
- **Balance Tracking** — Token balances, ETH, staked amounts
- **Transaction History** — All interactions with your contracts
- **Performance Metrics** — TVL, volume, holders over time
- **Alerts** — Price changes, large transactions, security events
- **Export** — CSV, PDF reports for taxes/accounting

## Dashboard
```
Portfolio Overview
├── Total Value: $45,230
├── Contracts: 12
├── Chains: 3
└── Active Users: 2,340

Contracts
├── MyToken (Base)
│   ├── Address: 0x1234...
│   ├── Holders: 1,234
│   ├── Market Cap: $23,000
│   └── 24h Volume: $5,000
├── NFT Collection (Optimism)
│   ├── Address: 0x5678...
│   ├── Minted: 500/1000
│   ├── Floor Price: 0.05 ETH
│   └── Volume: 12.5 ETH
└── Staking Pool (Arbitrum)
    ├── Address: 0x9abc...
    ├── TVL: $15,000
    ├── APY: 25%
    └── Stakers: 89
```

## Usage
```javascript
baseclaw.portfolio.view()
baseclaw.portfolio.addContract(address, chain)
baseclaw.portfolio.export('csv')
baseclaw.portfolio.setAlert('price', 'MyToken', '> $0.50')
```

## Integrations
- DeBank API
- Zapper
- Zerion
- CoinGecko (prices)

## Alerts
- Price thresholds
- Large transfers
- New holders
- Security events
- Gas price spikes
