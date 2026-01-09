# Welcome to NepharaLabs Documentation

<div align="center">
  <img src="https://img.shields.io/badge/AI-Powered-green?style=for-the-badge" alt="AI Powered">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/x402-Protocol-orange?style=for-the-badge" alt="x402 Protocol">
  <img src="https://img.shields.io/badge/Blockchain-Agnostic-blue?style=for-the-badge" alt="Blockchain Agnostic">
</div>

## Overview

**NEPHARALabs** is an autonomous AI agent that handles **privacy-preserving payments** on your behalf using the x402 protocol. It enables you to access paid APIs, services, and digital resources without manual intervention—just tell NEPHARA what you need, and the agent handles the payment automatically through an Opus/ASCII-styled interface on top of the x402 grid.

> Utility token: **$NEPHARA** – used to pay for services and power the ecosystem.

### Key Features

- 🤖 **Autonomous Payments** – AI agent automatically processes HTTP 402 payment flows  
- 🕶️ **Payment Privacy** – request and payment flows are designed to minimize exposed metadata  
- ⚡ **Instant Settlement** – Payments settle in ~2 seconds at blockchain speed  
- 💰 **Zero Platform Fees** – No middlemen, only blockchain gas and service costs  
- 🌐 **Blockchain Agnostic** – Works with Ethereum, Solana, and any x402-compatible chain  
- 🔒 **No Registration** – Access services without accounts, emails, or OAuth  
- 🛡️ **Spending Limits** – Set daily, weekly, and monthly spending caps for safety  
- 📊 **Open Protocol** – Built on the open x402 standard for internet-native payments  
- 🧠 **AI-Powered** – Natural language interface powered by Google Gemini  
- 🧾 **Opus / ASCII UI** – Terminal-like, ASCII-driven interface inspired by Opus experiments

## What is x402?

x402 is an open protocol for internet-native payments built around the **HTTP 402 Payment Required** status code. It enables:

- **Programmatic payments** without accounts or sessions  
- **Direct blockchain transactions** for instant service access  
- **Zero-fee transactions** with no intermediaries  
- **Machine-to-machine commerce** at internet scale  

Learn more at [x402.org](https://x402.org) and [x402.gitbook.io](https://x402.gitbook.io/x402)

## Getting Started

Ready to use autonomous AI payments with $NEPHARA? Choose your path:

1. **[Quick Start](getting-started/quick-start.md)** – Get up and running in 5 minutes  
2. **[Installation Guide](getting-started/installation.md)** – Detailed setup instructions  
3. **[Configuration](getting-started/configuration.md)** – Configure spending limits and wallets  

## Documentation Structure

This documentation is organized into the following sections:

### Getting Started

- [Quick Start](getting-started/quick-start.md) – Start using NEPHARALabs in minutes  
- [Installation](getting-started/installation.md) – Detailed installation steps  
- [Configuration](getting-started/configuration.md) – Setup wallets and spending limits  

### Appendix

- [FAQ](appendix/faq.md) – Frequently asked questions  
- [Glossary](appendix/glossary.md) – Key terms and definitions  
- [Resources](appendix/resources.md) – External links and tools  
- [Changelog](appendix/changelog.md) – Version history  

## How NEPHARALabs Works

### The Payment Flow

1. **You Make a Request**  
   - Tell NEPHARALabs in natural language what service you need  
   - Example: “Get me the latest weather data from WeatherAPI”

2. **NEPHARALabs Detects Payment Required**  
   - Service returns HTTP 402 (Payment Required)  
   - NEPHARALabs reads the x402 payment details from the response  

3. **Autonomous Payment Processing**  
   - NEPHARALabs checks your spending limits  
   - Submits blockchain transaction automatically using $NEPHARA (or supported assets)  
   - Waits for payment confirmation (~2 seconds)  

4. **Instant Access**  
   - Retries the original request with payment proof  
   - Receives and presents the data to you in an Opus/ASCII-style interface  
   - All within seconds, zero manual intervention  

## Technology Stack

NEPHARALabs is built with modern web technologies and blockchain infrastructure:

- **Frontend**: Next.js 16 (App Router), Tailwind CSS 4, Framer Motion  
- **AI**: Vercel AI SDK with Google Gemini  
- **Blockchain**: Ethereum, Solana, and multi-chain support  
- **Smart Contracts**: Solidity with OpenZeppelin libraries  
- **Protocol**: x402 for autonomous payments  
- **Testing**: Hardhat, Chai, Ethers.js  

## Use Cases

### For Users

- **AI Developers** – Build agents that can pay for API access autonomously  
- **Researchers** – Access premium datasets and academic APIs on-demand  
- **Creators** – Use paid APIs without managing subscriptions  
- **Web3 Enthusiasts** – Experience the future of internet-native, privacy-focused payments  

### For Service Providers

- **API Monetization** – Instantly monetize your API without auth infrastructure  
- **Micropayments** – Enable pay-per-use pricing models  
- **Reduced Friction** – Remove account creation and subscription barriers  
- **Global Access** – Accept payments from anyone, anywhere  

## Smart Contracts

NEPHARALabs includes a complete suite of Solidity smart contracts:

- **PaymentGateway.sol** – Core payment processing  
- **SpendingLimits.sol** – User-defined spending controls  
- **X402Registry.sol** – Service discovery and registration  

See the [contracts folder](../contracts/) for full source code and tests.

## Community & Support

Join our growing community:

- **Email Support**: [support@NEPHARAlabs.xyz](mailto:support@NEPHARAlabs)  
- **X**: [@NEPHARAlabs](https://x.com/NEPHARA_labs)    
- **GitHub**: [Report issues](ttps://github.com/NEPHARALabs/)  

## Security & Safety

NEPHARALabs takes your security seriously:

- ✅ Set spending limits to prevent overspending  
- ✅ All transactions are transparent and on-chain  
- ✅ No custody – you control your wallet  
- ✅ Open-source smart contracts auditable by anyone  
- ✅ Non-custodial architecture  

## Important Disclaimers

⚠️ **Please Read**:

- **User Responsibility** – You are responsible for setting appropriate spending limits  
- **Irreversible Transactions** – All blockchain transactions are permanent  
- **Service Trust** – Always verify the services you're accessing  
- **Beta Software** – This is experimental software; use at your own risk  
- **Not Financial Advice** – This is a payment tool, not investment advice  

## Contributing

We welcome contributions! Whether it's:

- 🐛 Bug reports and fixes  
- ✨ Feature requests and implementations  
- 📚 Documentation improvements  
- 🧪 Adding test coverage  

See our Contributing Guide for details.

## License

NEPHARALabs is open source and available under the MIT License.

## External Resources

- **x402 Protocol**: [x402.org](https://x402.org) | [Documentation](https://x402.gitbook.io/x402)  
- **Solidity**: [Solidity Docs](https://docs.soliditylang.org/)  
- **OpenZeppelin**: [Contracts](https://docs.openzeppelin.com/contracts/)  
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)  

---

**Ready to dive in?** Start with the [Quick Start Guide](getting-started/quick-start.md) →



