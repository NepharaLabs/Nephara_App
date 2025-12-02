# Making Payments with Luna402

This guide walks you through making your first autonomous payment and understanding the payment process.

## Quick Start

### 1. Connect Your Wallet

First, connect a Web3 wallet:

- Click "Connect Wallet" button
- Choose MetaMask, Coinbase Wallet, or another provider
- Approve the connection

### 2. Make a Request

Tell Luna402 what you need:

```
"Get me weather data for San Francisco"
```

### 3. Review Payment

Luna402 will show you:

```
Found: WeatherAPI Premium
Cost: 0.001 ETH (~$2.50)
✓ Within spending limits
```

### 4. Automatic Processing

Payment happens automatically:

- Transaction submitted
- Confirmed in ~2 seconds
- Service accessed
- Data delivered

## Detailed Payment Flow

### Step 1: Service Discovery

When you make a request, Luna402:

1. **Parses your intent**: Understands what service you need
2. **Queries x402 Registry**: Finds compatible services
3. **Checks availability**: Ensures service is online
4. **Retrieves pricing**: Gets current cost

### Step 2: Pre-Flight Checks

Before processing payment:

```
Checking:
✓ Wallet connected
✓ Sufficient balance (0.01 ETH available)
✓ Within daily limit (0.003/0.01 ETH used)
✓ Within weekly limit (0.015/0.05 ETH used)
✓ Within monthly limit (0.08/0.2 ETH used)
✓ Service verified
```

### Step 3: Transaction Construction

Luna402 builds the transaction:

```javascript
{
  to: servicePaymentAddress,
  value: "0.001 ETH",
  data: paymentProofData,
  gas: estimatedGas,
  nonce: nextNonce
}
```

### Step 4: Signing & Submission

Your wallet automatically:

- Signs the transaction
- Submits to blockchain
- Returns transaction hash

### Step 5: Confirmation

Wait for blockchain confirmation:

```
Transaction: 0x1234...
Status: Pending...
Block: Waiting...
───────────────────
✓ Confirmed in block 12345678
✓ 2.1 seconds elapsed
```

### Step 6: Service Access

With payment confirmed:

1. Luna402 retries service request
2. Includes payment proof in headers
3. Service validates payment
4. Returns requested data

## Payment Methods

### Native Tokens

Pay with blockchain's native currency:

**Ethereum**

```
Amount: 0.001 ETH
Gas: ~0.00015 ETH
Total: 0.00115 ETH
```

**Solana**

```
Amount: 0.01 SOL
Gas: ~0.000005 SOL
Total: 0.010005 SOL
```

### ERC20 Tokens

Pay with stablecoins or other tokens:

**USDC**

```
Amount: 2.50 USDC
Gas: 0.00015 ETH
Note: Gas still paid in native token
```

### Automatic Chain Selection

Luna402 automatically uses the correct chain:

- Service specifies accepted chains
- Luna402 selects cheapest/fastest
- Prompts wallet to switch if needed

## Understanding Costs

### Service Fee

What the service charges:

```
Base Price: 0.001 ETH
Per-request fee determined by service
```

### Gas Fee

Blockchain transaction cost:

```
Gas Price: 20 gwei
Gas Limit: 21,000
Total Gas: 0.00042 ETH

Varies by:
- Network congestion
- Transaction complexity
- Chain (Ethereum > Polygon)
```

### Total Cost

```
Service Fee:  0.001 ETH
Gas Fee:      0.00042 ETH
──────────────────────
Total:        0.00142 ETH
```

## Payment Examples

### Example 1: Simple Data Request

```
User: "Get current Bitcoin price"

Luna402:
  Service: CoinGecko API
  Cost: 0.0005 ETH
  Processing...
  ✓ Transaction: 0xabc...
  ✓ Confirmed

  Bitcoin: $42,150.23
  24h Change: +2.5%
```

### Example 2: AI Image Generation

```
User: "Generate an image of a sunset"

Luna402:
  Service: Heurist Mesh
  Cost: 0.002 ETH
  Processing...
  ✓ Transaction: 0xdef...
  ✓ Confirmed
  ✓ Generating...

  [Image displayed]
  Download: sunset_001.png
```

### Example 3: File Storage

```
User: "Pin this file to IPFS"

Luna402:
  Service: Pinata
  Cost: 0.001 ETH
  File size: 2.5 MB
  Processing...
  ✓ Transaction: 0xghi...
  ✓ Confirmed
  ✓ Uploading...

  IPFS Hash: Qm...
  Gateway URL: https://...
```

## Payment Status

### Pending

```
⏳ Transaction submitted
   Hash: 0x1234...
   Status: Pending
   Time: 3 seconds
```

**What's happening**: Transaction in mempool, waiting for miners

### Confirming

```
🔄 Transaction confirming
   Hash: 0x1234...
   Block: 12345678
   Confirmations: 1/3
```

**What's happening**: Included in block, waiting for more confirmations

### Completed

```
✅ Payment successful
   Hash: 0x1234...
   Block: 12345678
   Cost: 0.00142 ETH
```

**What's happening**: Payment confirmed, service accessed

### Failed

```
❌ Transaction failed
   Hash: 0x1234...
   Reason: Gas too low
```

**What's happening**: Transaction reverted, funds returned

## Handling Issues

### Insufficient Balance

```
❌ Cannot process payment
   Required: 0.01 ETH
   Balance: 0.005 ETH

Action: Add 0.005+ ETH to wallet
```

### Gas Price Spike

```
⚠️  High gas prices detected
   Normal: $1-2
   Current: $15

Continue anyway? [Yes] [No] [Wait]
```

### Service Unavailable

```
❌ Service temporarily unavailable
   Service: WeatherAPI
   Status: 503

⟳ Retry in 30 seconds? [Yes] [No]
```

### Limit Exceeded

```
❌ Daily spending limit exceeded
   Limit: 0.01 ETH
   Spent: 0.01 ETH
   Attempted: 0.002 ETH

Options:
- Wait until tomorrow
- Increase limit
- Use different wallet
```

## Best Practices

### Before Making Payments

1. **Verify Service**: Check if service is verified in registry
2. **Check Price**: Ensure cost is reasonable
3. **Review Limits**: Confirm within your spending limits
4. **Check Balance**: Ensure sufficient funds + gas buffer

### During Payment

1. **Don't Close**: Keep browser open during transaction
2. **Wait for Confirmation**: Don't retry immediately
3. **Check Status**: Monitor transaction hash on explorer

### After Payment

1. **Verify Receipt**: Check transaction on block explorer
2. **Save Hash**: Keep transaction hash for records
3. **Review Service**: Was the service satisfactory?
4. **Update Limits**: Adjust if needed based on usage

## Security Tips

### Protect Your Wallet

- Never share private keys
- Use hardware wallet for large amounts
- Keep seed phrase offline
- Enable 2FA where possible

### Verify Services

Before first use:

- Check service verification status
- Read reviews from other users
- Test with small payment first
- Verify service URL/address

### Monitor Spending

- Review transaction history daily
- Set conservative limits initially
- Enable spending alerts
- Use separate wallet for testing

### Recognize Scams

Red flags:

- Unverified services
- Unusually low prices
- Requests for private keys
- Off-chain payment requests

## Advanced Features

### Batch Payments

Coming soon:

```
"Pay for 10 API requests in advance"
```

### Scheduled Payments

Coming soon:

```
"Set up recurring weekly payment"
```

### Multi-Chain Routing

Coming soon:

- Auto-select cheapest chain
- Bridge tokens when needed
- Optimize for speed vs cost

## Transaction History

View all payments:

```
Recent Transactions
────────────────────────────────────
Jan 31  WeatherAPI    0.001 ETH  ✓
Jan 31  Heurist Mesh  0.002 ETH  ✓
Jan 30  IPFS Pin      0.001 ETH  ✓
Jan 30  DataAPI       0.001 ETH  ❌
────────────────────────────────────

Filters:
[All] [Successful] [Failed] [Pending]

Export: [CSV] [JSON]
```

## Troubleshooting

### Payment Stuck

**Solution**:

1. Check block explorer
2. Verify transaction is pending
3. Wait 5-10 minutes
4. Contact support if persists

### Wrong Amount Charged

**Solution**:

1. Check transaction on explorer
2. Verify service pricing
3. Account for gas fees
4. Contact service provider

### Service Didn't Deliver

**Solution**:

1. Save transaction hash
2. Contact service support
3. Request refund if eligible
4. Report to Luna402 support

## Learn More

- [Spending Limits](spending-limits.md)
- [Autonomous Payments](../features/autonomous-payments.md)
- [Best Practices](best-practices.md)
- [FAQ](../appendix/faq.md)

---

**Need help?** Email [support@luna402xyz.xyz](mailto:support@luna402xyz.xyz)
