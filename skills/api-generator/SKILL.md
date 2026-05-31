# API Generator Skill

## Overview
Generate REST API endpoints from smart contract functions. Allow non-web3 apps to interact with contracts.

## Features
- **Auto Endpoints** — GET/POST for each contract function
- **Type Safety** — TypeScript types from ABI
- **Authentication** — API keys, rate limiting
- **Caching** — Redis caching for read operations
- **Webhooks** — Event subscriptions
- **Documentation** — Swagger/OpenAPI spec

## Usage
```javascript
baseclaw.api.generate()
// Generates:
// - /api/token/balance/:address
// - /api/token/transfer
// - /api/nft/owner/:tokenId
// - /api/staking/stake
// etc.
```

## Output
```
api/
  routes/
    token.js
    nft.js
    staking.js
  middleware/
    auth.js
    rateLimit.js
  docs/
    swagger.json
```

## Integration
- Express.js or Fastify server
- Vercel Serverless Functions
- AWS Lambda
- Docker container
