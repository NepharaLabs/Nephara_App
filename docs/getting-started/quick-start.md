# Quick Start Guide

Get started with NECRORA in just 5 minutes! This guide will walk you through setting up and making your first autonomous payment.

## What You'll Learn

- How to access NECRORA
- Making your first payment request
- Understanding the autonomous payment flow
- Best practices for safe usage

## Prerequisites

Before you begin, you'll need:

- A web browser (Chrome, Firefox, or Safari recommended)
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)
- Some cryptocurrency for gas fees and payments
- Basic understanding of blockchain transactions

## Step 1: Access NECRORA

Open your web browser and navigate to:

```
https://NECRORAlabs.tech
```

You'll see the landing page featuring:

- Hero section explaining autonomous AI payments
- Features showcasing x402 protocol capabilities
- Statistics (0% fees, ~2s settlement, blockchain agnostic)
- How it works section

## Step 2: Launch the App

Click the **"Launch App"** button in the navigation or hero section.

The app interface features:

- Clean, modern design with orange accents
- AI chat interface powered by Google Gemini
- Message input area for natural language requests
- Real-time streaming responses

## Step 3: Your First Request

Let's make a simple request to understand how NECRORA works.

### Try a Basic Query

Type in the chat:

```
What services can you help me access?
```

The AI will respond with information about x402-compatible services and APIs available through the protocol.

### Example Response

```markdown
I can help you access x402-compatible services including:

1. **Data APIs**
   - Weather data APIs
   - Financial market data
   - News and content APIs

2. **AI Services**
   - Image generation (Heurist Mesh)
   - Text processing
   - Data analysis

3. **Storage Services**
   - IPFS pinning (Pinata)
   - Decentralized storage

4. **Web3 Services**
   - Smart contract deployments (thirdweb)
   - Blockchain data APIs

When you need access to any of these, just tell me what you need
and I'll handle the payment automatically!
```

## Step 4: Understanding the Payment Flow

Here's how NECRORA handles payments autonomously:

### 1. You Make a Request

```
Get me the current weather data for New York City from WeatherAPI
```

### 2. NECRORA Detects Payment Requirement

- The service returns HTTP 402 (Payment Required)
- NECRORA reads the x402 payment details
- Shows you the cost: "This will cost 0.001 ETH"

### 3. Autonomous Processing

- NECRORA checks your configured spending limits
- Submits blockchain transaction automatically
- Waits for confirmation (~2 seconds)
- Shows transaction hash for transparency

### 4. Instant Access

- Retries the request with payment proof
- Receives the weather data
- Presents formatted results to you
- All within seconds!

## Step 5: Configure Spending Limits (Recommended)

For safety, set spending limits before making payments:

1. **Daily Limit**: Maximum per 24 hours
2. **Weekly Limit**: Maximum per 7 days
3. **Monthly Limit**: Maximum per 30 days

Example limits for testing:

- Daily: 0.01 ETH
- Weekly: 0.05 ETH
- Monthly: 0.2 ETH

> **Note**: Currently, spending limits are managed through smart contracts. See [Configuration Guide](configuration.md) for full setup.

## Step 6: Make Your First Payment Request

Now let's make a real payment request:

```
I need access to premium weather data for the next 7 days in San Francisco
```

The AI will:

1. Find an x402-compatible weather service
2. Show you the pricing
3. Request confirmation
4. Process payment automatically
5. Deliver the data

### What You'll See

```
Finding x402 weather service...
Found: WeatherAPI Premium
Cost: 0.001 ETH (~$2.50)

Proceeding with payment...
✓ Transaction submitted: 0x1234...
✓ Confirmed in 2.1 seconds
✓ Accessing data...

Here's your 7-day forecast for San Francisco:
[Weather data displayed]
```

## Understanding the Interface

### Chat Interface

- **Message Input**: Type natural language requests
- **Streaming Responses**: See AI responses in real-time
- **Markdown Formatting**: Responses use headers, lists, and formatting
- **Transaction Links**: Click to view on block explorer

### Transaction History

Each payment shows:

- Service name
- Amount paid
- Transaction hash (clickable)
- Timestamp
- Status (pending/confirmed/failed)

## Best Practices

### 1. Start Small

❌ Bad: Set daily limit to 10 ETH without testing
✅ Good: Start with 0.01 ETH daily limit while learning

### 2. Be Specific

❌ Bad: "Get me some data"
✅ Good: "Get weather data for NYC from WeatherAPI"

### 3. Monitor Spending

Check your transaction history regularly to:

- Track spending against limits
- Verify service costs
- Review transaction hashes

### 4. Verify Services

Before using a new x402 service:

- Check if it's verified in the registry
- Read reviews from other users
- Start with small test payments

### 5. Keep Wallet Funded

Ensure you have enough for:

- Service payment costs
- Blockchain gas fees
- Small buffer for multiple requests

## Common First-Time Questions

### Q: Is my wallet connected?

A: NECRORA uses your browser wallet (MetaMask, etc.). You'll be prompted to connect when making your first payment.

### Q: How much does it cost?

A: NECRORA charges **0% platform fees**. You only pay:

- Service provider fees (varies by service)
- Blockchain gas fees (typically $0.01-$1.00)

### Q: What if a payment fails?

A: Failed payments are automatically refunded. The blockchain transaction will show the refund.

### Q: Can I cancel a payment?

A: Once submitted to the blockchain, transactions cannot be cancelled. However, if the service doesn't deliver, you can dispute through the smart contract.

### Q: Which blockchains are supported?

A: NECRORA is blockchain agnostic and supports:

- Ethereum
- Solana
- Any x402-compatible chain

### Q: Are my conversations saved?

A: No. Chats are not stored on servers. Refresh to start fresh.

## Safety Tips

🔒 **Security Best Practices:**

- Set conservative spending limits initially
- Verify service URLs and contracts
- Never share your private keys
- Use a dedicated wallet for AI payments
- Monitor transaction history regularly
- Only use verified x402 services

⚠️ **Important Warnings:**

- All blockchain transactions are irreversible
- You are responsible for spending limit configuration
- Always verify service reputation before use
- This is experimental software - use at your own risk

## What's Next?

Now that you've completed your first request:

- 📖 [Read the Full Installation Guide](installation.md)
- ⚙️ [Configure Spending Limits](configuration.md)
- 🔍 [Explore Available Services](../user-guide/finding-services.md)
- 🛡️ [Learn Security Best Practices](../user-guide/best-practices.md)
- 📚 [Read the FAQ](../appendix/faq.md)

## Need Help?

- 🐦 **X**: [@NECRORAtechtech](https://x.com/NecroraLabs)

---

**Ready for full setup?** Continue to the [Installation Guide](installation.md) for complete configuration →


