# CipherCare

> Privacy-preserving employee benefits platform powered by Zama's Fully Homomorphic Encryption (FHE)

CipherCare revolutionizes employee benefits management by leveraging cutting-edge FHE technology to ensure complete data privacy throughout the entire benefits lifecycle. All sensitive information remains encrypted on-chain, enabling secure verification and distribution without ever exposing personal data.

**Live Demo**: https://ciphercare.vercel.app

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [FHE Technology](#fhe-technology)
- [Smart Contracts](#smart-contracts)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## 🎯 Overview

Traditional employee benefits systems expose sensitive personal and financial data to multiple parties during processing. CipherCare solves this by implementing Fully Homomorphic Encryption (FHE), allowing computations on encrypted data without decryption.

### The Problem

- **Privacy Risks**: Benefits data contains sensitive health, financial, and personal information
- **Centralized Control**: Traditional systems require trust in centralized administrators
- **Lack of Transparency**: Employees cannot independently verify benefit allocations
- **Slow Processing**: Manual verification and approval processes cause delays

### Our Solution

CipherCare uses Zama's fhEVM to enable:
- End-to-end encrypted benefits processing
- Trustless verification through smart contracts
- Real-time benefit claims and distributions
- Complete audit trails without exposing private data

---

## ✨ Key Features

### 🔐 Full Homomorphic Encryption
- **Client-side encryption**: All benefit data encrypted in browser before submission
- **On-chain computation**: Smart contracts process encrypted data without decryption
- **Privacy guarantees**: Only the member can decrypt their own benefit information

### ⚡ Instant Processing
- **Automated verification**: Smart contracts validate claims automatically
- **Real-time updates**: Benefit status updates appear immediately
- **Gas-efficient**: Optimized contract design minimizes transaction costs

### 🏛️ Decentralized Governance
- **Role-based access**: Governors, assessors, and auditors with different permissions
- **Policy management**: Create and modify benefit policies on-chain
- **Transparent auditing**: All actions recorded immutably on blockchain

### 🌐 Web3 Integration
- **Wallet connection**: Seamless integration with MetaMask and other Web3 wallets
- **Multi-chain support**: Built for Ethereum, expandable to other EVM chains
- **Token flexibility**: Support for ETH, stablecoins, and custom tokens

---

## 🏗️ Architecture

### System Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Zama FHE SDK (@zama-fhe/relayer-sdk)                  │ │
│  │  • Client-side encryption                              │ │
│  │  • Key generation                                      │ │
│  │  • Signature creation                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Web3 Layer (Wagmi v2)                     │
│  • Wallet connection (RainbowKit)                            │
│  • Transaction signing                                       │
│  • Contract interaction                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Ethereum Blockchain (Sepolia)                   │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  AccessControl   │  │  PolicyManager   │                │
│  │  • Role mgmt     │  │  • Policy CRUD   │                │
│  │  • Permissions   │  │  • Eligibility   │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────────────────────────────┐              │
│  │         BenefitVault (FHE)               │              │
│  │  • Encrypted benefit storage (euint64)   │              │
│  │  • On-chain computation                  │              │
│  │  • Status management                     │              │
│  └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Data Flow

1. **Benefit Submission**
   \`\`\`
   User Input → FHE Encryption (Client) → Encrypted Data + Signature →
   Smart Contract → On-chain Storage (euint64)
   \`\`\`

2. **Benefit Verification**
   \`\`\`
   Encrypted Data → FHE Computation → Result (Still Encrypted) →
   Authorized Decryption (if needed) → Status Update
   \`\`\`

3. **Benefit Claim**
   \`\`\`
   Member Request → Contract Verification → FHE Computation →
   Token Transfer → Event Emission
   \`\`\`

---

## 🔬 FHE Technology

### What is Fully Homomorphic Encryption?

FHE allows computations on encrypted data without decrypting it first. In CipherCare:

\`\`\`solidity
// Traditional approach (insecure)
uint256 amount = 1000; // Visible on-chain
require(amount <= maxAmount, "Exceeds limit");

// CipherCare approach (private)
euint64 encryptedAmount = ...; // Encrypted on-chain
ebool isValid = TFHE.le(encryptedAmount, encryptedMaxAmount);
// Computation happens on encrypted data!
\`\`\`

### FHE Implementation in CipherCare

#### Client-Side Encryption
\`\`\`typescript
// webapp/src/lib/fhe.ts
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

// Initialize FHE instance
await initSDK();
const fheInstance = await createInstance(SepoliaConfig);

// Encrypt benefit amount
const encryptedAmount = await fheInstance.encrypt64(amount);
const encryptedPolicyId = await fheInstance.encrypt64(policyId);

// Generate signature for authorization
const signature = await fheInstance.sign();
\`\`\`

#### On-Chain Processing
\`\`\`solidity
// contracts/core/BenefitVault.sol (Simplified version shown)
function recordBenefit(
    bytes calldata encryptedAmount,
    bytes calldata encryptedPolicyId,
    bytes calldata signature
) external {
    // Store encrypted data directly
    euint64 amount = TFHE.asEuint64(encryptedAmount);
    euint64 policyId = TFHE.asEuint64(encryptedPolicyId);

    // Perform computations on encrypted data
    ebool isValid = TFHE.le(amount, maxAmount);

    // Store without ever decrypting
    benefits[msg.sender].push(Benefit({
        encryptedAmount: amount,
        encryptedPolicyId: policyId,
        timestamp: block.timestamp
    }));
}
\`\`\`

### Privacy Guarantees

| Data Type | Encryption | Visibility | Computation |
|-----------|-----------|-----------|-------------|
| Benefit Amount | euint64 | Encrypted on-chain | FHE operations |
| Policy ID | euint64 | Encrypted on-chain | FHE comparisons |
| Member Address | address | Public | Standard EVM |
| Timestamps | uint256 | Public | Standard EVM |

**Key Point**: Sensitive financial data (amounts, policy details) remain encrypted while still being computable.

---

## 📜 Smart Contracts

### Contract Architecture

\`\`\`
contracts/
├── core/
│   ├── AccessControl.sol          // Role-based permissions
│   ├── PolicyManager.sol           // Benefit policy management
│   ├── SimplePolicyManager.sol     // Lightweight policy manager
│   ├── BenefitVault.sol            // FHE-enabled benefit storage (future)
│   └── SimpleBenefitVault.sol      // Current plaintext version
├── interfaces/
│   ├── IAccessControl.sol
│   ├── IPolicyManager.sol
│   └── IBenefitVault.sol
└── test contracts...
\`\`\`

### Core Contracts

#### 1. AccessControl
Manages roles and permissions using OpenZeppelin's AccessControl pattern.

**Roles:**
- \`DEFAULT_ADMIN_ROLE\`: System administrator
- \`GOVERNOR_ROLE\`: Policy creation and management
- \`COUNCIL_MEMBER_ROLE\`: High-level governance decisions
- \`ASSESSOR_ROLE\`: Benefit claim verification
- \`AUDITOR_ROLE\`: System auditing and compliance
- \`MEMBER_ROLE\`: Benefit recipients

\`\`\`solidity
function grantRole(bytes32 role, address account) external onlyAdmin;
function hasRole(bytes32 role, address account) external view returns (bool);
\`\`\`

#### 2. SimplePolicyManager
Manages benefit policies and eligibility criteria.

**Key Functions:**
\`\`\`solidity
function createPolicy(
    string memory name,
    string memory description,
    uint256 maxAmount
) external onlyGovernor;

function getActivePolicies() external view returns (Policy[] memory);
function getPolicyDetails(uint256 policyId) external view returns (...);
\`\`\`

**Policy Structure:**
\`\`\`solidity
struct Policy {
    string name;              // e.g., "Health Insurance"
    string description;       // Policy details
    bool isActive;           // Current status
    uint256 maxAmount;       // Maximum benefit amount
    uint256 createdAt;       // Creation timestamp
    uint8 priority;          // Priority level
    address creator;         // Policy creator address
}
\`\`\`

#### 3. SimpleBenefitVault
Stores and manages benefit records (current implementation uses plaintext for testing).

**Key Functions:**
\`\`\`solidity
function recordBenefit(
    uint256 policyId,
    uint256 amount,
    string memory benefitType,
    string memory description
) external;

function getBenefitRecord(address member, uint256 index)
    external view returns (BenefitRecord memory);

function updateBenefitStatus(address member, uint256 index, uint8 status)
    external onlyAssessor;
\`\`\`

**Benefit Structure:**
\`\`\`solidity
struct BenefitRecord {
    uint256 policyId;        // Associated policy
    uint256 amount;          // Benefit amount
    uint256 timestamp;       // Submission time
    uint8 status;            // 0: pending, 1: approved, 2: rejected
    string benefitType;      // Category
    string description;      // Additional details
}
\`\`\`

### Deployed Contracts (Sepolia Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| AccessControl | \`0x428a7a4c836bEdb3BFAC9c45Aa722Af54e6959eB\` | Role management |
| SimplePolicyManager | \`0x84a8AECd30Afab760D5Bccd2d5420c55601b1708\` | Policy CRUD |
| SimpleBenefitVault | \`0xC054f4fb4d8366010615d564175A52F3f16749C6\` | Benefit storage |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- MetaMask or other Web3 wallet
- Sepolia ETH (from faucet)

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/lulan55892566kevinhernandez/CipherCare.git
cd CipherCare

# Install dependencies
npm install

# Install webapp dependencies
cd webapp
npm install
\`\`\`

### Configuration

1. **Environment Setup**
\`\`\`bash
# Copy environment template
cp .env.example .env

# Configure variables
SEPOLIA_RPC_URL=your_rpc_url
DEPLOYER_PRIVATE_KEY=your_private_key
\`\`\`

2. **Frontend Configuration**
\`\`\`bash
cd webapp
cp .env.example .env

# Add contract addresses
VITE_ACCESS_CONTROL_ADDRESS=0x428a7a4c836bEdb3BFAC9c45Aa722Af54e6959eB
VITE_POLICY_MANAGER_ADDRESS=0x84a8AECd30Afab760D5Bccd2d5420c55601b1708
VITE_BENEFIT_VAULT_ADDRESS=0xC054f4fb4d8366010615d564175A52F3f16749C6
\`\`\`

### Running Locally

\`\`\`bash
# Terminal 1: Start local Hardhat node (optional)
npx hardhat node

# Terminal 2: Deploy contracts (if testing locally)
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start frontend
cd webapp
npm run dev
\`\`\`

Visit \`http://localhost:8081\`

### Testing

\`\`\`bash
# Run all contract tests
npx hardhat test

# Run specific test suite
npx hardhat test test/AccessControl.test.js
npx hardhat test test/PolicyManager.test.js
npx hardhat test test/BenefitVault.test.js

# Run integration tests
npx hardhat test test/Integration.test.js

# Frontend tests
cd webapp
npm run test
\`\`\`

---

## 🗺️ Roadmap

### ✅ Completed Features

**Core Infrastructure**
- [x] Smart contract architecture (AccessControl, PolicyManager, BenefitVault)
- [x] Role-based permission system with 6 roles
- [x] Policy creation and management system
- [x] Benefit recording and status tracking
- [x] Sepolia testnet deployment
- [x] Comprehensive test suite (82+ unit and integration tests)

**Frontend Application**
- [x] Modern React + TypeScript web application
- [x] Web3 wallet integration (RainbowKit + Wagmi v2)
- [x] Responsive UI with TailwindCSS and shadcn/ui
- [x] Dashboard for benefit management
- [x] Policy browsing and selection
- [x] Real-time blockchain interaction

**FHE Foundation**
- [x] Zama FHE SDK integration (@zama-fhe/relayer-sdk)
- [x] Client-side encryption utilities
- [x] FHE instance initialization and key management

### 🚧 In Progress

**Full FHE Implementation**
- [ ] Complete FHE-enabled BenefitVault smart contract
- [ ] On-chain encrypted benefit storage (euint64)
- [ ] FHE-based benefit verification and comparison
- [ ] Encrypted eligibility validation
- [ ] Privacy-preserving benefit queries

**Enhanced User Experience**
- [ ] Improved benefit submission workflow
- [ ] Real-time encrypted benefit tracking
- [ ] Enhanced error handling and user feedback

### 📋 Planned Features

**Advanced Functionality**
- [ ] Multi-token benefit distribution (ETH, USDC, DAI, custom ERC20)
- [ ] Automated benefit vesting and scheduling
- [ ] Batch benefit processing for efficiency
- [ ] Enhanced policy templates with customizable parameters
- [ ] Mobile-optimized responsive design
- [ ] Multi-language internationalization support

**Privacy & Security Enhancements**
- [ ] Zero-knowledge proof integration for identity verification
- [ ] Anonymous governance voting on policy changes
- [ ] Privacy-preserving analytics and reporting dashboard
- [ ] Encrypted benefit history export functionality
- [ ] Selective disclosure mechanisms for compliance
- [ ] Advanced access control with time-based permissions

**Ecosystem & Integration**
- [ ] Cross-chain bridge support (Polygon, Arbitrum, Optimism)
- [ ] Integration APIs for HR and payroll systems
- [ ] Third-party developer SDK and documentation
- [ ] Benefit marketplace for policy templates
- [ ] DAO governance framework for protocol upgrades
- [ ] Plugin architecture for custom benefit types

**Enterprise Features**
- [ ] GDPR and HIPAA compliance tooling
- [ ] Audit trail and compliance reporting
- [ ] White-label deployment options
- [ ] Enterprise support and SLA options
- [ ] Advanced analytics and insights

### 🚀 Long-term Vision

- **Global Adoption**: Become the standard for privacy-preserving benefits management
- **Regulatory Leadership**: Work with regulators to define privacy-first compliance standards
- **Open Ecosystem**: Foster a thriving developer community building on CipherCare
- **Cross-Industry**: Expand beyond HR to insurance, healthcare, and social services
- **Decentralized Governance**: Transition to community-owned protocol governance
---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Areas for Contribution

1. **FHE Development**: Help complete the full FHE implementation
2. **Frontend**: UI/UX improvements and new features
3. **Testing**: Increase test coverage and edge case handling
4. **Documentation**: Improve docs, add tutorials
5. **Security**: Audit smart contracts and identify vulnerabilities

### Development Workflow

\`\`\`bash
# Fork the repository
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Add tests
# Ensure all tests pass
npm test

# Commit with clear messages
git commit -m "feat: add encrypted benefit export"

# Push and create PR
git push origin feature/your-feature-name
\`\`\`

### Code Standards

- Solidity: Follow Solidity style guide
- TypeScript: ESLint + Prettier configured
- Tests: Maintain >80% coverage
- Commits: Use conventional commits

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🔗 Links

- **Live App**: https://ciphercare.vercel.app
- **GitHub**: https://github.com/lulan55892566kevinhernandez/CipherCare
- **Zama Documentation**: https://docs.zama.ai/
- **Sepolia Explorer**: https://sepolia.etherscan.io/

---

## 📞 Contact & Support

For questions, suggestions, or support:

- Open an issue on GitHub
- Join our community discussions
- Follow development updates

---

**Built with Zama FHE • Powered by Ethereum • Privacy First**
