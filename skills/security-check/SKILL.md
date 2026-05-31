# Security Check Skill

## Overview
Automated security analysis for BaseClaw contracts. Scans for vulnerabilities, malicious patterns, and best practices.

## Checks Performed

### Critical (Block Deployment)
- **Reentrancy** — Checks for external calls before state changes
- **Unchecked External Calls** — Verifies return values
- **Access Control** — Ensures onlyOwner/onlyAdmin patterns
- **Integer Overflow** — Checks for SafeMath or 0.8+ compiler
- **Self-Destruct** — Warns if contract can be destroyed

### Warning (Recommend Fix)
- **Timelock** — Admin functions should have delay
- **Event Emission** — State changes should emit events
- **Input Validation** — Parameters should be validated
- **Emergency Pause** — Circuit breaker recommended

### Info (Good Practice)
- **NatSpec Comments** — Documentation
- **Test Coverage** — Unit tests present
- **Code Comments** — Inline documentation

## Usage
```javascript
baseclaw.security.check({
  contractCode: '...',
  abi: [...],
  network: 'base-sepolia'
})
```

## Output
```json
{
  "critical": [],
  "warnings": [
    { "line": 45, "type": "timelock", "message": "Admin function lacks timelock" }
  ],
  "info": [],
  "score": 85,
  "safe": true
}
```
