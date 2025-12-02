# Smart Contracts Architecture

Luna402's autonomous payment system is powered by three core smart contracts that work together to enable secure, transparent, and autonomous transactions.

## Contract Overview

```
┌─────────────────────────────────────┐
│        Luna402 Ecosystem          │
├─────────────────────────────────────┤
│  User Interface (Next.js App)       │
├─────────────────────────────────────┤
│  AI Agent (Google Gemini)           │
├─────────────────────────────────────┤
│        Smart Contracts              │
│  ┌───────────────────────────────┐  │
│  │  PaymentGateway.sol           │  │
│  │  - Payment processing         │  │
│  │  - Escrow & release           │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  SpendingLimits.sol           │  │
│  │  - Limit enforcement          │  │
│  │  - Spending tracking          │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  X402Registry.sol             │  │
│  │  - Service discovery          │  │
│  │  - Provider registry          │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  Blockchain (Ethereum/Solana/etc)   │
└─────────────────────────────────────┘
```

## 1. PaymentGateway.sol

### Purpose

Handles all payment processing, escrow, and fund transfers.

### Key Features

- Native token and ERC20 support
- Payment escrow and release
- Refund mechanism
- Transaction tracking

### Core Functions

```solidity
// Initiate payment with native token
function payNative(
    address payee,
    bytes32 requestHash
) external payable returns (bytes32 paymentId)

// Initiate payment with ERC20
function payToken(
    address payee,
    address token,
    uint256 amount,
    bytes32 requestHash
) external returns (bytes32 paymentId)

// Complete payment (release funds)
function completePayment(
    bytes32 paymentId
) external

// Refund payment (owner only)
function refundPayment(
    bytes32 paymentId
) external onlyOwner
```

### Data Structures

```solidity
struct Payment {
    address payer;          // Who paid
    address payee;          // Who receives
    uint256 amount;         // Payment amount
    address token;          // Token address (0x0 for native)
    uint256 timestamp;      // When created
    bytes32 requestHash;    // Service request hash
    bool completed;         // Payment status
}
```

### Events

```solidity
event PaymentInitiated(
    bytes32 indexed paymentId,
    address indexed payer,
    address indexed payee,
    uint256 amount,
    address token
);

event PaymentCompleted(
    bytes32 indexed paymentId,
    address indexed payer,
    address indexed payee,
    uint256 amount
);

event PaymentRefunded(
    bytes32 indexed paymentId,
    address indexed payer,
    uint256 amount
);
```

## 2. SpendingLimits.sol

### Purpose

Enforces user-defined spending limits to prevent overspending.

### Key Features

- Daily/weekly/monthly limits
- Automatic time-based resets
- Approved spender management
- Real-time limit checking

### Core Functions

```solidity
// Set spending limits
function setLimits(
    uint256 dailyLimit,
    uint256 weeklyLimit,
    uint256 monthlyLimit
) external

// Approve spender (AI agent)
function approveSpender(
    address spender
) external

// Revoke spender approval
function revokeSpender(
    address spender
) external

// Record spending (called by approved spender)
function recordSpending(
    address user,
    uint256 amount
) external returns (bool)

// Get remaining allowance
function getRemainingAllowance(
    address user
) external view returns (
    uint256 daily,
    uint256 weekly,
    uint256 monthly
)
```

### Data Structures

```solidity
struct Limit {
    uint256 dailyLimit;        // Max per day
    uint256 weeklyLimit;       // Max per week
    uint256 monthlyLimit;      // Max per month
    uint256 dailySpent;        // Spent today
    uint256 weeklySpent;       // Spent this week
    uint256 monthlySpent;      // Spent this month
    uint256 lastDailyReset;    // Last reset timestamp
    uint256 lastWeeklyReset;   // Last reset timestamp
    uint256 lastMonthlyReset;  // Last reset timestamp
    bool active;               // Limits enabled?
}
```

### Events

```solidity
event LimitSet(
    address indexed user,
    uint256 dailyLimit,
    uint256 weeklyLimit,
    uint256 monthlyLimit
);

event SpendingRecorded(
    address indexed user,
    address indexed spender,
    uint256 amount,
    uint256 timestamp
);

event SpenderApproved(
    address indexed user,
    address indexed spender
);

event SpenderRevoked(
    address indexed user,
    address indexed spender
);
```

## 3. X402Registry.sol

### Purpose

Central registry for x402-compatible services and their pricing.

### Key Features

- Service registration
- Multi-tier pricing
- Service verification
- Statistics tracking

### Core Functions

```solidity
// Register new service
function registerService(
    string memory name,
    string memory description,
    string memory endpoint,
    address paymentAddress,
    uint256 basePrice,
    address acceptedToken
) external returns (bytes32 serviceId)

// Add pricing tier
function addPricingTier(
    bytes32 serviceId,
    string memory tierName,
    uint256 price,
    uint256 requestLimit,
    uint256 validityPeriod
) external

// Update service details
function updateService(
    bytes32 serviceId,
    string memory description,
    uint256 basePrice,
    address paymentAddress
) external

// Verify service (admin only)
function verifyService(
    bytes32 serviceId
) external onlyOwner

// Record service request
function recordRequest(
    bytes32 serviceId,
    uint256 amount
) external
```

### Data Structures

```solidity
struct Service {
    address provider;       // Service owner
    string name;           // Service name
    string description;    // Description
    string endpoint;       // API endpoint
    address paymentAddress;// Payment recipient
    uint256 basePrice;     // Base price
    address acceptedToken; // Token accepted
    bool active;           // Service status
    uint256 registeredAt;  // Registration time
    uint256 totalRequests; // Request count
    uint256 totalRevenue;  // Total earned
}

struct PricingTier {
    string tierName;       // Tier name
    uint256 price;         // Tier price
    uint256 requestLimit;  // Requests included
    uint256 validityPeriod;// How long valid
}
```

### Events

```solidity
event ServiceRegistered(
    bytes32 indexed serviceId,
    address indexed provider,
    string name,
    string endpoint
);

event ServiceVerified(
    bytes32 indexed serviceId
);

event PricingTierAdded(
    bytes32 indexed serviceId,
    string tierName,
    uint256 price
);

event RequestRecorded(
    bytes32 indexed serviceId,
    uint256 amount
);
```

## Contract Interactions

### Payment Flow

```
1. User makes request via AI
   ↓
2. AI queries X402Registry for service
   ↓
3. SpendingLimits checks if allowed
   ↓
4. PaymentGateway processes payment
   ↓
5. Service delivers content
   ↓
6. PaymentGateway releases funds
   ↓
7. X402Registry records request
```

### Limit Enforcement Flow

```
AI Agent attempts payment
   ↓
SpendingLimits.canSpend()
   ├─ Check daily limit
   ├─ Check weekly limit
   └─ Check monthly limit
   ↓
If all pass:
   SpendingLimits.recordSpending()
   PaymentGateway.payNative/payToken()
   ↓
If any fail:
   Reject transaction
   Notify user
```

## Security Features

### Access Control

- `Ownable`: Admin functions
- `approvedSpenders`: Authorized agents
- `ReentrancyGuard`: Prevent reentrancy attacks

### Input Validation

- Non-zero addresses
- Positive amounts
- Valid limit hierarchies
- Service existence checks

### State Management

- Payment completion flags
- Spending trackers
- Timestamp validations
- Limit resets

## Gas Optimization

### Efficient Storage

- Pack structs to save slots
- Use `uint256` for counters
- Minimize SLOAD operations

### Batch Operations

- Coming soon: Batch payments
- Coming soon: Batch limit updates

## Upgradeability

### Current Status

Contracts are **not upgradeable** for security.

### Future Plans

Consider proxy pattern with:

- Timelock governance
- Multi-sig approval
- Community voting

## Testing

Each contract has 30+ tests covering:

- ✅ Normal operations
- ✅ Edge cases
- ✅ Access control
- ✅ Error handling
- ✅ Gas optimization
- ✅ Integration scenarios

See [/contracts/test](../../contracts/test/) for full test suite.

## Deployment

### Networks Supported

- Ethereum Mainnet
- Polygon
- Base
- Arbitrum
- Optimism
- Solana (adapted version)

### Deployment Process

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Contract Addresses

### Mainnet

```
PaymentGateway: Coming soon
SpendingLimits: Coming soon
X402Registry: Coming soon
```

### Testnet (Sepolia)

```
PaymentGateway: 0x...
SpendingLimits: 0x...
X402Registry: 0x...
```

## Audits

### Status

- ⏳ Security audit in progress
- Target: Q1 2025

### Auditors

- Trail of Bits (planned)
- OpenZeppelin (planned)

## Source Code

All contracts are open source:

- GitHub: [github.com/luna402/luna402](https://github.com/Luna402-xyz/luna402)
- License: MIT
- Folder: `/contracts`

## Learn More

- [Contract Source Code](../../contracts/)
- [Test Suite](../../contracts/test/)
- [Deployment Guide](../deployment/vercel.md)
- [API Reference](../api-reference/chat.md)

---

**Questions?** Email [dev@luna402xyz.xyz](mailto:dev@luna402xyz.xyz)
