# IPFS Integration Skill

## Overview
Store NFT metadata, images, and webpages on IPFS for true decentralization. No central server needed.

## Features
- **NFT Metadata** — Upload JSON metadata to IPFS
- **Image Storage** — Upload images, get CID
- **Webpage Hosting** — Deploy entire dApp to IPFS
- **Pinning** — Persistent storage with Pinata/Infura
- **Gateway** — Access via ipfs.io or custom gateway

## Usage
```javascript
baseclaw.ipfs.uploadMetadata({
  name: 'CryptoArt #1',
  description: 'Rare digital art',
  image: 'ipfs://Qm...',
  attributes: [
    { trait_type: 'Rarity', value: 'Legendary' }
  ]
})

baseclaw.ipfs.uploadImage(file)
baseclaw.ipfs.deployWebpage(projectDir)
```

## Pinning Services
- **Pinata** — 1GB free, easy API
- **Infura** — Ethereum + IPFS
- **NFT.Storage** — Free for NFTs
- **Web3.Storage** — Free tier available

## NFT Metadata Format
```json
{
  "name": "Art Piece #1",
  "description": "Beautiful art",
  "image": "ipfs://Qmabc123...",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" },
    { "trait_type": "Eyes", "value": "Green" }
  ]
}
```

## Webpage Deployment
```
build/
├── index.html
├── static/
│   ├── js/
│   └── css/
└── ipfs-hash: Qmxyz789...
```

## ENS Integration
- Link ENS name to IPFS hash
- `myproject.eth` → `ipfs://Qm...`
- Auto-update on redeploy

## Usage
```javascript
baseclaw.ipfs.configure({
  provider: 'pinata',
  apiKey: '...',
  apiSecret: '...'
})
```
