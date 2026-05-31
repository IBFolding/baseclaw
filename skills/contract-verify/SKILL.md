# Contract Verification Skill

## Overview
Auto-verify deployed contracts on BaseScan. Uploads source code and ABI for public verification.

## Usage
```javascript
baseclaw.verify.contract({
  address: '0x...',
  sourceCode: '...',
  abi: [...],
  network: 'base-sepolia' // or 'base-mainnet'
})
```

## Process
1. Compile contract with exact compiler version
2. Flatten imports (if using multiple files)
3. Submit to BaseScan API
4. Poll for verification status
5. Return verification link

## API Endpoint
- Base Sepolia: `https://api-sepolia.basescan.org/api`
- Base Mainnet: `https://api.basescan.org/api`

## Required
- BaseScan API key
- Exact compiler version
- Optimization settings
- Source code

## Output
```json
{
  "verified": true,
  "url": "https://sepolia.basescan.org/address/0x...#code",
  "message": "Contract source code verified"
}
```
