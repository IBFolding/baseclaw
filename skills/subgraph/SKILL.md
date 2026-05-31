# Subgraph Generator Skill

## Overview
Auto-generate Graph Protocol subgraphs for your contracts. Query events, transactions, and state changes with GraphQL.

## Features
- **Auto-Generate Schema** — From contract ABI
- **Event Handlers** — Auto-map events to entities
- **Real-time Indexing** — Sync with blockchain
- **GraphQL API** — Query with standard GraphQL
- **Hosted Service** — Deploy to The Graph
- **Local Node** — Run your own indexer

## Usage
```javascript
baseclaw.subgraph.generate({
  contractAddress: '0x...',
  contractABI: [...],
  network: 'base',
  name: 'MyTokenSubgraph'
})
```

## Generated Files
```
subgraph/
├── schema.graphql
├── subgraph.yaml
├── src/
│   ├── mappings/
│   │   ├── token.ts
│   │   └── staking.ts
│   └── utils/
└── abis/
    └── MyToken.json
```

## Schema Example
```graphql
type Token @entity {
  id: ID!
  name: String!
  symbol: String!
  totalSupply: BigInt!
  holders: [Holder!]! @derivedFrom(field: "token")
}

type Holder @entity {
  id: ID!
  address: Bytes!
  balance: BigInt!
  token: Token!
}

type Transfer @entity {
  id: ID!
  from: Bytes!
  to: Bytes!
  value: BigInt!
  timestamp: BigInt!
}
```

## Queries
```graphql
{
  tokens(first: 5) {
    id
    name
    symbol
    totalSupply
  }
  transfers(orderBy: timestamp, orderDirection: desc) {
    from
    to
    value
  }
}
```

## Deployment
```bash
cd subgraph
graph codegen
graph build
graph deploy --product hosted-service username/subgraph-name
```

## Integration
- The Graph Hosted Service (free)
- Local graph-node
- Subgraph Studio
- Custom indexing
