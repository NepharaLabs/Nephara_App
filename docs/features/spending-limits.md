# Spending Limits

Spending limits are your safety net when using Luna402's autonomous payment system. They prevent overspending and give you complete control over how much the AI can spend on your behalf.

## Overview

Spending limits work in three time periods:

- **Daily**: Maximum spending per 24-hour period
- **Weekly**: Maximum spending per 7-day period
- **Monthly**: Maximum spending per 30-day period

All limits are enforced automatically before any payment is processed.

## How Limits Work

### Hierarchical Structure

Limits must follow this hierarchy:

```
Monthly ≥ Weekly ≥ Daily

Example:
Daily:   0.01 ETH  ✓
Weekly:  0.05 ETH  ✓
Monthly: 0.2 ETH   ✓
```

Invalid configuration:

```
Daily:   0.1 ETH   ❌
Weekly:  0.05 ETH  (Less than daily!)
Monthly: 0.2 ETH
```

### Automatic Resets

- **Daily**: Resets every 24 hours from first transaction
- **Weekly**: Resets every 7 days
- **Monthly**: Resets every 30 days

### Real-Time Enforcement

Before every payment:

```
1. Check daily spending + new amount ≤ daily limit
2. Check weekly spending + new amount ≤ weekly limit
3. Check monthly spending + new amount ≤ monthly limit
4. If all pass → Process payment
5. If any fail → Reject and notify user
```

## Setting Up Limits

### Initial Configuration

On first use, set conservative limits:

```
Recommended for beginners:
Daily:   0.01 ETH (~$25)
Weekly:  0.05 ETH (~$125)
Monthly: 0.2 ETH  (~$500)
```

### Using Smart Contracts

Limits are stored on-chain for security:

```solidity
function setLimits(
    uint256 dailyLimit,
    uint256 weeklyLimit,
    uint256 monthlyLimit
) external
```

### Through the UI

Coming soon: Web interface for easy limit management.

## Limit Strategies

### Conservative (Recommended for New Users)

```
Daily:   0.005 ETH
Weekly:  0.025 ETH
Monthly: 0.1 ETH

Use case: Testing, occasional use
```

### Moderate (Regular Users)

```
Daily:   0.02 ETH
Weekly:  0.1 ETH
Monthly: 0.4 ETH

Use case: Daily API access, moderate usage
```

### Aggressive (Power Users)

```
Daily:   0.1 ETH
Weekly:  0.5 ETH
Monthly: 2 ETH

Use case: Heavy usage, multiple services
```

### Business/Enterprise

```
Daily:   1 ETH
Weekly:  5 ETH
Monthly: 20 ETH

Use case: Production apps, team usage
```

## Monitoring Your Spending

### Current Usage

Check anytime:

```
Daily Limit:   0.01 ETH
Spent Today:   0.0035 ETH
Remaining:     0.0065 ETH
───────────────────────────
Progress: ████░░░░░░ 35%
```

### Spending Trends

View historical data:

```
This Week:     0.015 ETH / 0.05 ETH (30%)
Last Week:     0.022 ETH
Average/Day:   0.003 ETH
```

### Alerts

Get notified when:

- 80% of any limit reached
- Limit exceeded (payment rejected)
- Unusual spending pattern detected

## Adjusting Limits

### Increasing Limits

Need more capacity? Increase anytime:

```
Before:
Daily: 0.01 ETH → After: 0.02 ETH

Effect: Immediately available for new payments
```

### Decreasing Limits

Reduce exposure:

```
Before:
Daily: 0.1 ETH → After: 0.05 ETH

Note: Doesn't affect already spent amount
```

### Temporary Overrides

Coming soon:

- One-time limit increase
- Expires after 24 hours
- Requires additional confirmation

## Smart Contract Integration

### SpendingLimits Contract

Core functions:

```solidity
// Set limits
setLimits(daily, weekly, monthly)

// Check if spending allowed
canSpend(user, amount) returns (bool)

// Record spending
recordSpending(user, amount)

// Get remaining allowance
getRemainingAllowance(user) returns (daily, weekly, monthly)
```

### Approved Spenders

Authorize Luna402 to spend on your behalf:

```solidity
// Approve Luna402
approveSpender(luna402Address)

// Revoke approval
revokeSpender(luna402Address)
```

### On-Chain Security

Benefits of smart contract limits:

- ✅ Tamper-proof
- ✅ Transparent
- ✅ Auditable
- ✅ Decentralized enforcement

## Limit Scenarios

### Scenario 1: Within Limits

```
Daily Limit:  0.01 ETH
Spent Today:  0.007 ETH
New Payment:  0.002 ETH

Check: 0.007 + 0.002 = 0.009 ≤ 0.01 ✓
Result: Payment approved
```

### Scenario 2: Would Exceed Daily

```
Daily Limit:  0.01 ETH
Spent Today:  0.009 ETH
New Payment:  0.003 ETH

Check: 0.009 + 0.003 = 0.012 > 0.01 ❌
Result: Payment rejected
Message: "Daily limit exceeded"
```

### Scenario 3: Within Daily, Exceeds Weekly

```
Daily Limit:   0.05 ETH
Weekly Limit:  0.2 ETH
Spent Today:   0.01 ETH
Spent This Week: 0.19 ETH
New Payment:   0.03 ETH

Check Daily:  0.01 + 0.03 = 0.04 ≤ 0.05 ✓
Check Weekly: 0.19 + 0.03 = 0.22 > 0.2 ❌
Result: Payment rejected
Message: "Weekly limit exceeded"
```

## Best Practices

### 1. Start Small

Don't set high limits immediately:

- Learn the system first
- Understand typical costs
- Build confidence gradually

### 2. Review Regularly

Check spending weekly:

- Are limits too restrictive?
- Any unusual patterns?
- Adjust based on usage

### 3. Separate Wallets

Consider using different wallets:

- **Testing Wallet**: Low limits, experimental
- **Production Wallet**: Higher limits, vetted services
- **Emergency Wallet**: Backup funds

### 4. Set Realistic Limits

Base limits on:

- Your budget
- Expected usage
- Service costs
- Risk tolerance

### 5. Monitor Alerts

Enable notifications for:

- Limit approaching (80%)
- Limit exceeded
- Unusual activity

## Troubleshooting

### "Can't set limits"

**Possible causes**:

- Wallet not connected
- Invalid limit hierarchy
- Transaction failed

**Solution**:

```
1. Check wallet connection
2. Ensure: Monthly ≥ Weekly ≥ Daily
3. Try again with sufficient gas
```

### "Payment rejected despite having funds"

**Check**:

```
1. Daily limit: Not exceeded?
2. Weekly limit: Not exceeded?
3. Monthly limit: Not exceeded?
4. All must be within limits
```

### "Limits not updating"

**Solution**:

```
1. Wait for transaction confirmation
2. Refresh the page
3. Check block explorer
4. Contact support if persists
```

## Advanced Features

### Multi-Signature Limits

For organizations:

- Require 2+ approvals for limit changes
- Prevents single point of failure
- Audit trail for all modifications

### Dynamic Limits

Coming soon:

- Adjust based on time of day
- Higher limits during business hours
- Lower limits at night

### Spend Analysis

Coming soon:

- Service breakdown
- Cost optimization suggestions
- Spending predictions

## Security Considerations

### Private Key Protection

Your spending limits protect against:

- Compromised API access
- Malicious service requests
- Accidental overspending

Even if someone gains access to Luna402, they **cannot** exceed your configured limits.

### Smart Contract Audits

Our SpendingLimits contract:

- ✅ Open source
- ✅ Professionally audited
- ✅ Battle-tested
- ✅ Upgradeable (with timelock)

## Learn More

- [Autonomous Payments](autonomous-payments.md)
- [Security Features](security.md)
- [Smart Contracts](../architecture/smart-contracts.md)
- [Best Practices](../user-guide/best-practices.md)

---

**Need help?** Join our [Discord](https://discord.gg/luna402) or email [support@luna402xyz.xyz](mailto:support@luna402xyz.xyz)
