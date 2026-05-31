# Template Marketplace Skill

## Overview
Share, sell, and discover custom templates for BaseClaw projects. Community-driven template ecosystem.

## Features
- **Template Upload** — Share your custom designs
- **Marketplace Browse** — Discover templates by category
- **Pricing** — Free or paid (ETH/USDC)
- **Ratings** — Community reviews and stars
- **Sales** — Track earnings from template sales
- **Collections** — Curated template packs

## Template Format
```json
{
  "name": "DeFi Dashboard Pro",
  "description": "Professional DeFi interface with charts",
  "category": "defi",
  "price": 0.05,
  "currency": "ETH",
  "author": "0x...",
  "files": {
    "page.tsx": "...",
    "components/": "...",
    "styles.css": "..."
  },
  "preview": "preview.png",
  "tags": ["defi", "charts", "dark-mode"],
  "compatibility": ["erc20", "staking"]
}
```

## Categories
- Token Launch
- NFT Collection
- DeFi Dashboard
- DAO Governance
- Gaming
- Social
- Analytics
- Landing Page

## Usage
```javascript
baseclaw.marketplace.browse()
baseclaw.marketplace.upload(template)
baseclaw.marketplace.purchase(templateId)
baseclaw.marketplace.rate(templateId, 5)
```

## Revenue
- 85% to creator
- 10% to BaseClaw
- 5% to community treasury
