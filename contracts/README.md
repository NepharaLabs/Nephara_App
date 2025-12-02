# Luna402 Smart Contracts

This directory contains the smart contracts for the Luna402 autonomous payment system built on the x402 protocol.

## Contracts Overview

### 1. PaymentGateway.sol

The core payment processing contract that handles x402 protocol payments.

**Features:**

- Support for both native tokens and ERC20 payments
- Payment initiation, completion, and refund mechanisms
- Request hash tracking for resource access
- Payment status tracking and verification
- Reentrancy protection

**Key Functions:**

- `payNative()` - Initiate payment with native blockchain token
- `payToken()` - Initiate payment with ERC20 token
- `completePayment()` - Complete payment and transfer funds to service provider
- `refundPayment()` - Refund a payment (admin only)
- `getPayment()` - Get payment details
- `isPaymentCompleted()` - Check payment status

### 2. SpendingLimits.sol

Manages autonomous spending limits for AI agents to prevent overspending.

**Features:**

- Daily, weekly, and monthly spending limits
- Automatic limit reset based on time periods
- Approved spender management (AI agents/contracts)
- Real-time spending tracking
- Remaining allowance queries

**Key Functions:**

- `setLimits()` - Configure spending limits
- `approveSpender()` - Authorize an AI agent to spend on your behalf
- `revokeSpender()` - Remove spending authorization
- `recordSpending()` - Record a spending transaction (called by approved spenders)
- `getRemainingAllowance()` - Check remaining spend capacity
- `activateLimits()` / `deactivateLimits()` - Toggle limit enforcement

### 3. X402Registry.sol

Registry for x402-compatible services and APIs.

**Features:**

- Service registration and discovery
- Multi-tier pricing support
- Service verification system
- Provider statistics tracking
- Service activation/deactivation

**Key Functions:**

- `registerService()` - Register a new x402-compatible service
- `addPricingTier()` - Add pricing tiers (basic, premium, enterprise, etc.)
- `updateService()` - Update service details
- `verifyService()` - Mark service as verified (admin only)
- `getService()` - Get service information
- `getAllServices()` - List all registered services
- `getPricingTiers()` - Get pricing options for a service

### 4. RecurringPayments.sol

Manages subscription-based recurring payments for automated service billing.

**Features:**

- Support for daily, weekly, monthly, and yearly subscriptions
- Both native token and ERC20 subscription payments
- Prepaid balance system for automatic renewals
- Subscription lifecycle management (create, cancel, process)
- Payment history tracking

**Key Functions:**

- `createSubscriptionNative()` - Create subscription with native token
- `createSubscriptionToken()` - Create subscription with ERC20 token
- `processPayment()` - Process a subscription payment when due
- `cancelSubscription()` - Cancel an active subscription
- `depositBalance()` - Add funds to prepaid balance for auto-renewals
- `withdrawBalance()` - Withdraw unused prepaid balance
- `isPaymentDue()` - Check if subscription payment is due

### 5. PaymentSplitter.sol

Splits incoming payments among multiple recipients based on predefined shares.

**Features:**

- Revenue sharing among multiple parties
- Configurable share distribution (proportional, not percentages)
- Support for both native tokens and ERC20 tokens
- Withdrawal-based payment collection (pull pattern)
- Dynamic split updates
- Individual recipient statistics

**Key Functions:**

- `createSplit()` - Create a payment split configuration
- `sendPaymentNative()` - Send payment to be split (native token)
- `sendPaymentToken()` - Send payment to be split (ERC20 token)
- `withdrawNative()` - Withdraw pending native token payments
- `withdrawToken()` - Withdraw pending ERC20 token payments
- `updateSplit()` - Update split configuration
- `getSharePercentage()` - Calculate recipient's share percentage

### 6. EscrowPayment.sol

Manages milestone-based escrow payments for secure project-based transactions.

**Features:**

- Milestone-based payment releases
- Optional third-party arbiter for dispute resolution
- Support for both native tokens and ERC20 tokens
- Dispute mechanism with arbiter resolution
- Flexible milestone completion workflow
- Deadline tracking

**Key Functions:**

- `createEscrow()` - Create escrow with multiple milestones
- `fundEscrowNative()` - Fund escrow with native token
- `fundEscrowToken()` - Fund escrow with ERC20 token
- `completeMilestone()` - Mark milestone as completed (by payee)
- `releaseMilestonePayment()` - Release payment for completed milestone (by payer)
- `disputeEscrow()` - Raise a dispute
- `resolveDispute()` - Resolve dispute (by arbiter)
- `cancelEscrow()` - Cancel unfunded escrow

### 7. PaymentStreaming.sol

Enables continuous, per-second payment flows for real-time compensation.

**Features:**

- Continuous payment streams over specified time periods
- Per-second rate calculation
- Real-time balance withdrawals
- Stream extension with additional funding
- Early cancellation with automatic settlement
- Support for both native tokens and ERC20 tokens

**Key Functions:**

- `createStreamNative()` - Create payment stream with native token
- `createStreamToken()` - Create payment stream with ERC20 token
- `withdrawFromStream()` - Withdraw available streamed balance
- `cancelStream()` - Cancel stream and settle balances
- `extendStreamNative()` - Extend stream duration with native token
- `extendStreamToken()` - Extend stream duration with ERC20 token
- `balanceOf()` - Check available balance for withdrawal
- `isStreamActive()` - Check if stream is currently active

## Deployment Order

1. Deploy `PaymentGateway.sol` - Core payment processing
2. Deploy `SpendingLimits.sol` - Spending controls
3. Deploy `X402Registry.sol` - Service registry
4. Deploy `RecurringPayments.sol` - Subscription management
5. Deploy `PaymentSplitter.sol` - Revenue sharing
6. Deploy `EscrowPayment.sol` - Milestone-based payments
7. Deploy `PaymentStreaming.sol` - Continuous payment flows
8. Connect contracts (set addresses for cross-contract calls if needed)

## Integration with Luna402

The contracts integrate with the Luna402 Next.js application through:

1. **Payment Flow**: Web3 wallet integration for initiating payments
2. **Service Discovery**: Query X402Registry for available services
3. **Limit Management**: Users configure spending limits through the UI
4. **Subscription Management**: AI agents can auto-renew service subscriptions
5. **Revenue Sharing**: Automatic payment distribution for multi-party agreements
6. **Project Payments**: Milestone-based escrow for contracted work
7. **Real-time Billing**: Continuous payment streams for per-second services

## Security Features

- OpenZeppelin battle-tested contract imports
- Reentrancy protection on payment functions
- Access control with Ownable pattern
- Input validation on all public functions
- Event emission for transparency and tracking

## Testing

Before deploying to mainnet:

1. Deploy to testnet (Sepolia, Mumbai, etc.)
2. Test all payment flows
3. Verify spending limits work correctly
4. Test service registration and discovery
5. Audit contracts for security vulnerabilities

## License

MIT License - See individual contract files for details
