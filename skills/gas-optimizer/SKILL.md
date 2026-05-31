# Gas Optimizer Skill

## Overview
Auto-optimize contract code for lower deployment and execution gas costs. Save money on every transaction.

## Optimizations
- **Storage Packing** — Pack variables into single slots
- **Calldata vs Memory** — Use calldata for external functions
- **Short Circuit** — Reorder conditions for early exits
- **Loop Optimization** — Cache array length, unchecked math
- **Custom Errors** — Cheaper than require strings
- **Event Packing** — Indexed vs non-indexed parameters
- **Contract Size** — Remove dead code, use libraries

## Usage
```javascript
baseclaw.gas.optimize(contractCode)
// Returns optimized code with gas report
```

## Report
```json
{
  "originalGas": 2450000,
  "optimizedGas": 1680000,
  "savings": "31%",
  "savingsUSD": "$45",
  "techniques": [
    "Packed storage variables",
    "Custom errors instead of strings",
    "Unchecked arithmetic in loops"
  ]
}
```

## Auto-Apply
- Toggle "Auto-optimize" in settings
- All contracts optimized before deployment
- Compare original vs optimized
