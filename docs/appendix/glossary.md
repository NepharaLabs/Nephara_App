# Glossary

Key terms and concepts for understanding Luna402 and the x402 protocol.

## x402 Protocol Terms

**x402**
An open protocol for internet-native payments built around the HTTP 402 status code. Enables programmatic, blockchain-based payments for digital resources.

**HTTP 402 Payment Required**
A standard HTTP status code indicating that payment is required to access a resource. The x402 protocol leverages this for autonomous payment flows.

**Facilitator**
A service or smart contract that mediates x402 payments between payers and service providers.

**Payment Proof**
Cryptographic evidence (transaction hash, receipt) that demonstrates a payment has been made on-chain.

**Service Provider**
Entity offering x402-compatible APIs, data, or digital resources for payment.

**x402 Registry**
On-chain registry of verified services that accept x402 payments.

## Luna402 Terms

**Luna402**
An autonomous AI agent that handles x402 payments on behalf of users through natural language interaction.

**Autonomous Payment**
Payment processed automatically by Luna402 without manual wallet approval for each transaction (within configured limits).

**Spending Limit**
User-defined maximum amounts (daily/weekly/monthly) that Luna402 can spend autonomously.

**Payment Gateway**
Smart contract that processes x402 payments, holding funds briefly before releasing to service providers.


## Blockchain Terms

**Gas Fee**
Transaction cost paid to blockchain validators for processing transactions. Varies by network congestion.

**Settlement Time**
Time required for blockchain transaction confirmation. Typically ~2 seconds on modern chains.

**Blockchain Agnostic**
Compatible with multiple blockchain networks (Ethereum, Solana, etc.) without being tied to one specific chain.

**Non-Custodial**
System where users retain control of their private keys and funds. Luna402 never holds your crypto.

**Smart Contract**
Self-executing code on blockchain that automatically enforces agreements without intermediaries.

**Transaction Hash (TxHash)**
Unique identifier for a blockchain transaction. Used to verify and track payments.

**Wallet**
Software (MetaMask, Coinbase Wallet) that stores private keys and enables blockchain interactions.

## AI & Chat Terms

**Natural Language Processing (NLP)**
AI technology that understands human language, enabling conversational interaction with Luna402.

**Streaming Response**
Real-time text generation where AI response appears word-by-word as it's generated.

**Context Window**
Amount of conversation history the AI remembers for maintaining coherent dialogue.

**Prompt**
User's input message to the AI agent.

**Token (AI Context)**
Unit of text the AI processes. Different from cryptocurrency tokens.

## Payment & Economic Terms

**Micropayment**
Very small payment (e.g., $0.01 - $1.00) enabled by low-fee blockchain transactions.

**Pay-Per-Use**
Pricing model where you pay only for what you consume, not subscriptions.

**Zero-Fee Transaction**
x402 payments have no platform fees - only blockchain gas and service costs.

**Settlement**
Finalization of payment transfer from payer to service provider.

**Refund**
Return of payment if service fails to deliver or dispute is resolved in payer's favor.

## Security Terms

**Spending Cap**
See "Spending Limit" - maximum autonomous spending allowed.

**Rate Limiting**
Restrictions on request frequency to prevent abuse.

**Verification**
Process of confirming service legitimacy in the x402 registry.

**Transaction Monitoring**
Tracking payments and spending against configured limits.

**Private Key**
Secret cryptographic key that controls your wallet. Never share this!

**Seed Phrase**
12-24 word backup phrase for recovering your wallet. Store securely!

## Service & API Terms

**API (Application Programming Interface)**
Software interface that allows different programs to communicate. Many x402 services are APIs.

**Endpoint**
Specific URL where an API service can be accessed.

**HTTP Request**
Message sent to a server to access a resource or service.

**HTTP Response**
Server's reply to a request, containing data or status codes.

**JSON (JavaScript Object Notation)**
Standard format for structuring data in API responses.

**REST API**
Type of web API that uses HTTP requests. Common for x402 services.

## OpenZeppelin Terms

**ERC20**
Standard interface for fungible tokens on Ethereum.

**Ownable**
Contract pattern where certain functions can only be called by the contract owner.

**ReentrancyGuard**
Security feature preventing attacks where malicious contracts call functions repeatedly.

**Burnable**
Token feature allowing permanent destruction of tokens to reduce supply.

## Solidity & Smart Contract Terms

**Solidity**
Programming language used for writing Ethereum smart contracts.

**Mapping**
Data structure in Solidity similar to a dictionary or hash table.

**Event**
Blockchain log emitted by smart contract for tracking state changes.

**Modifier**
Reusable code in Solidity that adds conditions to functions.

**Wei**
Smallest unit of Ether. 1 ETH = 10^18 wei.

## Testing Terms

**Hardhat**
Development environment for compiling, testing, and deploying Ethereum smart contracts.

**Chai**
Assertion library used for writing contract tests.

**Test Fixture**
Reusable test setup that deploys contracts in a consistent state.

**Coverage**
Percentage of code executed by tests. Higher coverage = better testing.

**Mock Contract**
Simplified version of a contract used for testing purposes.

## Common Abbreviations

**AI** - Artificial Intelligence
**API** - Application Programming Interface
**DYOR** - Do Your Own Research
**ETH** - Ethereum (cryptocurrency)
**HTTP** - Hypertext Transfer Protocol
**IPFS** - InterPlanetary File System
**JSON** - JavaScript Object Notation
**NLP** - Natural Language Processing
**REST** - Representational State Transfer
**SDK** - Software Development Kit
**SOL** - Solana (cryptocurrency)
**URL** - Uniform Resource Locator
**UX** - User Experience
**Web3** - Decentralized internet built on blockchain

## Usage Examples

### Using Terms in Context

**"I set my daily spending limit to 0.1 ETH"**

- Spending limit: maximum autonomous spending
- ETH: Ethereum cryptocurrency
- Daily: 24-hour period

**"The transaction settled in 2 seconds"**

- Transaction: blockchain payment
- Settled: confirmed and finalized
- 2 seconds: settlement time

**"Luna402 found an x402-compatible weather API"**

- x402-compatible: accepts x402 protocol payments
- API: web service providing data
- Weather API: specific service type

**"Check the transaction hash on Etherscan"**

- Transaction hash: unique payment identifier
- Etherscan: blockchain explorer website
- Verification of on-chain activity

## Related Resources

- **x402 Protocol**: [x402.org](https://x402.org)
- **Ethereum Terms**: [Ethereum Glossary](https://ethereum.org/en/glossary/)
- **Solidity Docs**: [docs.soliditylang.org](https://docs.soliditylang.org/)
- **OpenZeppelin**: [docs.openzeppelin.com](https://docs.openzeppelin.com/)

## Contributing

Missing a term? Suggest additions at: [feedback@luna402xyz.xyz](mailto:feedback@luna402xyz.xyz)

---

_This glossary is continuously updated with new terms as the x402 ecosystem evolves._
