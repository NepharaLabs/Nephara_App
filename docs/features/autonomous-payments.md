# Autonomous Payments

Luna402's core feature is autonomous payment processing using the x402 protocol. This page explains how the system automatically handles payments on your behalf.

## Overview

Autonomous payments allow Luna402 to:

- Detect when a service requires payment (HTTP 402)
- Process blockchain transactions automatically
- Complete payments without manual approval
- Stay within your configured spending limits

## How It Works

### 1. Payment Detection

When you request access to a paid service, the flow works like this:

```
You: "Get me weather data from WeatherAPI"
  ↓
Luna402 makes HTTP request to service
  ↓
Service returns: HTTP 402 Payment Required
  ↓
Luna402 reads x402 payment details
```

### 2. Limit Verification

Before processing any payment, Luna402 checks:

- **Daily Spending Limit**: Have you exceeded today's limit?
- **Weekly Spending Limit**: Have you exceeded this week's limit?
- **Monthly Spending Limit**: Have you exceeded this month's limit?
- **Single Transaction Limit**: Is this payment within acceptable range?

If any limit would be exceeded, the payment is **rejected** and you're notified.

### 3. Automatic Processing

If limits check out:

```
1. Luna402 constructs blockchain transaction
2. Signs transaction with authorized wallet
3. Submits to blockchain network
4. Waits for confirmation (~2 seconds)
5. Receives payment proof (transaction hash)
```

### 4. Service Access

Once payment is confirmed:

```
1. Luna402 retries original request
2. Includes payment proof in headers
3. Service validates payment
4. Returns requested data
5. Luna402 presents results to you
```

Total time: **~3-5 seconds** from request to delivery!

## Payment Types Supported

### Native Token Payments

Pay with the blockchain's native currency:

- **Ethereum**: ETH
- **Solana**: SOL
- **Polygon**: MATIC
- **Base**: ETH

### ERC20 Token Payments

Pay with standard tokens:

- USDC, USDT, DAI
- Custom x402 tokens
- Service-specific tokens

### Multi-Chain Support

Luna402 is blockchain agnostic:

- Automatically detects required chain
- Uses appropriate wallet connection
- Handles gas fees correctly per chain

## Payment Flow Example

Here's a real-world example:

```
User: "I need AI-generated images of a sunset over mountains"

Luna402: "Found: Heurist Mesh AI Image Generation"
         "Cost: 0.001 ETH (~$2.50)"
         "Checking spending limits..."
         "✓ Within daily limit (0.01 ETH)"
         "✓ Within weekly limit (0.05 ETH)"

         "Processing payment..."
         "✓ Transaction submitted: 0x1234..."
         "✓ Confirmed in 2.1 seconds"

         "Accessing service..."
         "✓ Images generated successfully"

[AI-generated images displayed]

Transaction details:
- Amount: 0.001 ETH
- Gas: 0.00015 ETH
- Total: 0.00115 ETH
- Tx: 0x1234...abcd
```

## Security Features

### Spending Limits

You maintain full control with configurable limits:

```javascript
{
  daily: 0.01 ETH,
  weekly: 0.05 ETH,
  monthly: 0.2 ETH
}
```

### Transaction Transparency

Every payment is:

- ✅ Recorded on-chain (publicly verifiable)
- ✅ Displayed with transaction hash
- ✅ Includes service details
- ✅ Shows exact costs

### Non-Custodial

- You control your private keys
- Luna402 never holds your funds
- All transactions signed by your wallet
- Revoke access anytime

## Payment States

Payments go through these states:

1. **Pending** - Transaction submitted to blockchain
2. **Confirming** - Waiting for block confirmation
3. **Completed** - Payment confirmed, service accessed
4. **Failed** - Transaction reverted or rejected
5. **Refunded** - Service failed to deliver, funds returned

## Gas Fees

### What Are Gas Fees?

Gas fees are transaction costs paid to blockchain validators:

- Variable based on network congestion
- Typically $0.01 - $1.00
- Added to service payment cost

### Gas Optimization

Luna402 optimizes gas usage:

- Estimates fees before transaction
- Uses efficient transaction types
- Batches multiple payments when possible
- Alerts if fees are unusually high

## Handling Payment Failures

If a payment fails:

### Service Unavailable

```
❌ Service temporarily unavailable
⟳ Retrying in 5 seconds...
✓ Retry successful!
```

### Insufficient Funds

```
❌ Insufficient balance
   Required: 0.01 ETH
   Balance: 0.005 ETH

💡 Add funds to continue
```

### Limit Exceeded

```
❌ Daily spending limit exceeded
   Limit: 0.01 ETH
   Spent today: 0.01 ETH

💡 Increase limits or wait until tomorrow
```

### Transaction Reverted

```
❌ Transaction failed
   Reason: Gas price too low

⟳ Retry with higher gas? [Yes] [No]
```

## Payment History

View all your transactions:

```
Recent Payments
───────────────────────────────────────
🟢 WeatherAPI     0.001 ETH   2 min ago
🟢 Heurist Mesh   0.002 ETH   15 min ago
🟢 IPFS Pin       0.0005 ETH  1 hr ago
🔴 DataAPI        Failed      2 hr ago
───────────────────────────────────────
Total Today: 0.0035 ETH
```

Click any transaction to see:

- Full transaction hash
- Block explorer link
- Service details
- Timestamp
- Gas fees

## Best Practices

### Start Conservative

Begin with low limits while learning:

```
✅ Daily: 0.01 ETH
✅ Weekly: 0.05 ETH
✅ Monthly: 0.2 ETH
```

### Monitor Spending

Check your dashboard daily:

- Review transaction history
- Verify service charges
- Adjust limits as needed

### Verify Services

Before using a new service:

- Check if it's verified in x402 Registry
- Read reviews from other users
- Test with small payments first

### Keep Wallet Funded

Maintain sufficient balance:

- Service payment amount
- Gas fees (buffer ~20%)
- Emergency reserve

### Review Transaction Hashes

Always verify payments on block explorer:

- Confirms transaction was successful
- Shows actual cost (including gas)
- Provides permanent record

## Advanced Features

### Scheduled Payments

Coming soon:

- Set up recurring service payments
- Auto-renew subscriptions
- Batch process multiple services

### Multi-Signature Support

For organizations:

- Require multiple approvals
- Set role-based limits
- Audit trail for all transactions

### Payment Routing

Optimize costs:

- Automatically select cheapest chain
- Use L2 solutions when available
- Bridge tokens as needed

## Troubleshooting

### "Payment stuck in pending"

**Solution**: Check blockchain explorer

- May need higher gas price
- Wait for network congestion to clear
- Contact support if >10 minutes

### "Limits keep getting exceeded"

**Solution**: Adjust your limits

```
Current: Daily 0.01 ETH
Usage: 0.015 ETH attempted

Action: Increase to 0.02 ETH or wait
```

### "Transaction fails immediately"

**Possible causes**:

- Insufficient gas
- Network congestion
- Invalid service endpoint

## Learn More

- [Setting Spending Limits](../user-guide/spending-limits.md)
- [Security Best Practices](../user-guide/best-practices.md)
- [Smart Contracts](../architecture/smart-contracts.md)
- [FAQ](../appendix/faq.md)

---

**Questions?** Email [support@luna402xyz.xyz](mailto:support@luna402xyz.xyz)
