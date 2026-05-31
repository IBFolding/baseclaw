# Custom Domains Skill

## Overview
Configure custom domains and ENS names for your deployed contracts and webpages. Professional branding without technical hassle.

## Features
- **Custom Domain** — myproject.com instead of vercel.app
- **ENS Name** — myproject.eth resolves to your contract
- **Subdomains** — app.myproject.com, docs.myproject.com
- **Auto SSL** — HTTPS automatically configured
- **DNS Management** — Auto-configure records
- **Redirect Rules** — www to non-www, etc.

## Usage
```javascript
baseclaw.domain.configure({
  type: 'custom', // or 'ens'
  domain: 'myproject.com',
  project: 'MyToken',
  autoSSL: true
})

baseclaw.domain.configure({
  type: 'ens',
  name: 'myproject.eth',
  contract: '0x...'
})
```

## Setup Steps
### Custom Domain
1. Enter domain in BaseClaw settings
2. Add DNS record (CNAME to cname.vercel-dns.com)
3. Verify ownership
4. Auto-SSL in ~2 minutes

### ENS Domain
1. Own ENS name (myproject.eth)
2. Set contenthash to IPFS CID or contract address
3. BaseClaw auto-updates on redeploy

## DNS Records
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 60
```

## Subdomains
```
app.myproject.com → dApp
api.myproject.com → API endpoints
docs.myproject.com → Documentation
staging.myproject.com → Testnet version
```

## ENS Integration
```
myproject.eth → 0x1234... (contract)
myproject.eth → ipfs://Qm... (webpage)
```

## Features
- **Auto-Renewal** — ENS reminders
- **Multi-Chain** — Same domain, different chains
- **Redirect** — Auto-redirect to preferred chain
- **Analytics** — Track domain visits

## Pricing
- Custom domain: Free (you pay registrar)
- ENS: ~$5/year + gas
- Subdomains: Free
- SSL: Free (Let's Encrypt)
