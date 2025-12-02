# Luna402 Smart Contract Tests

Comprehensive test suite for all Luna402 smart contracts using Hardhat and Chai.

## Test Files

### 1. PaymentGateway.test.js

Tests for the core payment processing contract.

**Test Coverage:**

- ✅ Contract deployment and initialization
- ✅ Native token payments (ETH, MATIC, etc.)
- ✅ ERC20 token payments
- ✅ Payment completion flow
- ✅ Payment refunds
- ✅ Payment queries and status checks
- ✅ Reentrancy protection
- ✅ Access control
- ✅ Edge cases and error handling

**Key Test Scenarios:**

- Initiating payments with native and ERC20 tokens
- Completing payments and fund transfers
- Preventing double completion
- Owner-only refund functionality
- Invalid input validation
- Total paid/received tracking

### 2. SpendingLimits.test.js

Tests for autonomous spending limit management.

**Test Coverage:**

- ✅ Setting spending limits (daily/weekly/monthly)
- ✅ Spender approval and revocation
- ✅ Recording spending transactions
- ✅ Limit enforcement
- ✅ Automatic time-based resets
- ✅ Remaining allowance calculations
- ✅ Activation/deactivation functionality

**Key Test Scenarios:**

- Valid and invalid limit configurations
- Approved spender workflows
- Exceeding spending limits
- Daily reset after 24 hours
- Weekly reset after 7 days
- Monthly reset after 30 days
- Multiple spender management

### 3. X402Registry.test.js

Tests for the x402 service registry.

**Test Coverage:**

- ✅ Service registration
- ✅ Service updates by providers
- ✅ Service activation/deactivation
- ✅ Multiple pricing tiers
- ✅ Service verification (admin)
- ✅ Request and revenue tracking
- ✅ Provider service queries
- ✅ Service discovery

**Key Test Scenarios:**

- Registering services with various configurations
- Adding Basic/Premium/Enterprise pricing tiers
- Provider-only service management
- Admin verification system
- Accumulating request statistics
- Filtering active/inactive services

## Running Tests

### Prerequisites

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox chai ethers
```

### Run All Tests

```bash
npx hardhat test
```

### Run Specific Test File

```bash
npx hardhat test test/PaymentGateway.test.js
npx hardhat test test/SpendingLimits.test.js
npx hardhat test test/X402Registry.test.js
```

### Run Tests with Coverage

```bash
npx hardhat coverage
```

### Run Tests with Gas Reporting

```bash
REPORT_GAS=true npx hardhat test
```

## Test Structure

Each test file follows this structure:

```javascript
describe('ContractName', function () {
  // Deployment fixture
  async function deployFixture() {
    // Setup and deployment
  }

  describe('Feature Group', function () {
    it('Should do something specific', async function () {
      // Test implementation
    });
  });
});
```

## Test Utilities

### Fixtures

Uses `@nomicfoundation/hardhat-network-helpers` for:

- `loadFixture()` - Efficient test state snapshots
- `time.increase()` - Fast-forward blockchain time
- Network state management

### Assertions

Common Chai assertions used:

- `expect().to.equal()` - Value equality
- `expect().to.emit()` - Event emission
- `expect().to.be.revertedWith()` - Error messages
- `expect().to.be.gt()` / `.lt()` - Greater/less than
- `expect().to.be.true` / `.false` - Boolean checks

## Mock Contracts

### MockERC20

A simple ERC20 token used for testing token payments:

```solidity
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply)
        ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}
```

## Test Coverage Goals

Target coverage metrics:

- **Line Coverage**: > 95%
- **Branch Coverage**: > 90%
- **Function Coverage**: 100%
- **Statement Coverage**: > 95%

## Common Test Patterns

### Testing Events

```javascript
await expect(contract.function()).to.emit(contract, 'EventName').withArgs(arg1, arg2);
```

### Testing Reverts

```javascript
await expect(contract.function()).to.be.revertedWith('Error message');
```

### Testing Access Control

```javascript
await expect(contract.connect(unauthorized).function()).to.be.revertedWithCustomError(
  contract,
  'OwnableUnauthorizedAccount'
);
```

### Time-Based Tests

```javascript
await time.increase(24 * 60 * 60); // Fast forward 24 hours
```

## Integration Testing

Consider testing cross-contract interactions:

1. PaymentGateway → X402Registry (recording service requests)
2. SpendingLimits → PaymentGateway (enforcing limits)

## Security Considerations

Tests verify:

- ✅ Reentrancy protection
- ✅ Integer overflow/underflow protection
- ✅ Access control enforcement
- ✅ Input validation
- ✅ State consistency
- ✅ Event emission for transparency

## Continuous Integration

Recommended CI pipeline:

```yaml
- Run linter (solhint)
- Compile contracts
- Run all tests
- Generate coverage report
- Run gas reporter
- Deploy to testnet
- Run integration tests
```

## Additional Resources

- [Hardhat Testing Docs](https://hardhat.org/tutorial/testing-contracts)
- [Chai Assertions](https://www.chaijs.com/api/bdd/)
- [OpenZeppelin Test Helpers](https://docs.openzeppelin.com/test-helpers/)
- [Waffle Matchers](https://ethereum-waffle.readthedocs.io/en/latest/matchers.html)
