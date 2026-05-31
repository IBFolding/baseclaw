# Dune Analytics Integration Skill

## Overview
Auto-generate Dune Analytics dashboards for your contracts. Track holders, transactions, volume, and more.

## Features
- **Auto-Generate Queries** — SQL from contract ABI
- **Dashboard Templates** — Pre-built layouts
- **Real-time Data** — Refresh schedules
- **Custom Metrics** — Define your own KPIs
- **Shareable Links** — Public or private dashboards

## Pre-built Dashboards
- **Token Analytics** — Holders, transfers, volume, price
- **NFT Collection** — Mints, sales, royalties, floor price
- **Staking Pool** — TVL, rewards, APY history
- **DAO Governance** — Proposals, votes, participation
- **DeFi Protocol** — Liquidity, volume, fees

## Usage
```javascript
baseclaw.dune.create({
  contractAddress: '0x...',
  contractType: 'erc20',
  name: 'MyToken Dashboard'
})
```

## Generated Queries
```sql
-- Token Holders Over Time
SELECT 
  date_trunc('day', evt_block_time) as day,
  count(distinct "to") as new_holders
FROM erc20_ethereum.evt_transfer
WHERE contract_address = '\x1234...'
GROUP BY 1
ORDER BY 1
```

## Integration
- Dune API key required
- Auto-refresh every hour
- Email reports
- Export to CSV/PDF
