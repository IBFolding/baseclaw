# BaseClaw Security Checklist

## Pre-Deployment Checks
- [ ] Contract code audited (manual or automated)
- [ ] No reentrancy vulnerabilities
- [ ] Access control properly implemented
- [ ] No unchecked external calls
- [ ] Integer overflow protected (SafeMath or 0.8+)
- [ ] Self-destruct not present or protected
- [ ] Event emission for state changes
- [ ] Input validation on all functions
- [ ] Emergency pause/circuit breaker

## Test Deployment
- [ ] Deploy to Base Sepolia first
- [ ] Verify all functions work correctly
- [ ] Test edge cases and failure modes
- [ ] Check gas costs
- [ ] Verify on BaseScan

## Mainnet Deployment
- [ ] Multi-sig configured (if team)
- [ ] Timelock enabled for sensitive operations
- [ ] All approvers notified
- [ ] Minimum 24-hour delay observed
- [ ] Emergency contacts available

## Post-Deployment
- [ ] Contract verified on BaseScan
- [ ] ABI published
- [ ] Documentation updated
- [ ] Monitoring enabled
- [ ] Incident response plan ready

## Webpage Generation
- [ ] Template matches contract type
- [ ] Contract address injected correctly
- [ ] ABI loaded properly
- [ ] Wallet connection works
- [ ] Responsive design verified
- [ ] Vercel deploy tested

## Audit Report
- [ ] Security score calculated
- [ ] All checks documented
- [ ] Warnings addressed or accepted
- [ ] Report downloaded and saved
- [ ] Team review completed

## Iron-Clad Status
- [ ] All critical checks pass
- [ ] No high-risk warnings
- [ ] Test deployment successful
- [ ] Team approval (if applicable)
- [ ] Ready for mainnet
