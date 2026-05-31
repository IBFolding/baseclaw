# Upgradeable Contracts Skill

## Overview
Deploy contracts with upgrade capability using UUPS proxy pattern. Fix bugs, add features without losing state or addresses.

## Features
- **UUPS Proxy** — Universal Upgradeable Proxy Standard
- **Implementation** — Logic contract that can be replaced
- **Proxy** — User-facing contract that delegates calls
- **Admin** — Controls who can upgrade
- **Timelock** — Delay upgrades for safety

## Usage
```javascript
baseclaw.upgrade.deploy({
  name: 'MyToken',
  type: 'erc20',
  upgradeable: true
})

// Later...
baseclaw.upgrade.upgrade({
  proxyAddress: '0x...',
  newImplementation: '0x...'
})
```

## Security
- Only admin can upgrade
- Optional timelock delay
- Storage layout validation
- Emergency pause function

## Best Practices
- Test upgrades on Sepolia first
- Audit new implementations
- Use timelock for production
- Document all changes
