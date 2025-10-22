# CrypticBenefit-Network V2 Architecture Design

## 🏗️ System Architecture Overview

CrypticBenefit-Network V2 adopts a fully decoupled modular architecture, designed based on FHE Knowledge Base best practices. The entire system consists of 5 core modules, each with clear responsibilities and standardized interfaces.

## 📋 Module Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CrypticBenefitNetworkV2                     │
│                   (Main Coordinator Contract)                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│AccessControl│ │BenefitVault │ │PolicyManager│
│   (Access   │ │  (Benefit   │ │  (Policy    │
│   Control)  │ │   Vault)    │ │ Management) │
└─────────────┘ └─────────────┘ └─────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│Assessment   │ │Aggregator   │ │Gateway      │
│Engine       │ │(Aggregator) │ │(Gateway)    │
│(Assessment  │ │             │ │             │
│Engine)      │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```

## 🔧 Core Module Details

### 1. AccessControl (Access Control Module)

**Responsibility**: Role-based permission management

**Core Functions**:
- Role definition and management
- Permission assignment and verification
- Access control checks

**Interface**: `IAccessControl`

**Role Definitions**:
```solidity
bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");     // System administrator
bytes32 public constant COUNCIL_ROLE = keccak256("COUNCIL_ROLE");       // Benefit committee
bytes32 public constant ASSESSOR_ROLE = keccak256("ASSESSOR_ROLE");     // Assessor
bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");       // Auditor
bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");         // Member
```

**Based on**: FHE Knowledge Base Chapter 11 ACL Permission Management

### 2. BenefitVault (Benefit Vault Module)

**Responsibility**: Benefit data storage and management

**Core Functions**:
- Benefit record submission and update
- Benefit record freeze and flag
- Benefit data query

**Interface**: `IBenefitVault`

**Data Structure**:
```solidity
struct BenefitRecord {
    address member;                 // Member address
    bytes32 programKey;             // Benefit program identifier
    euint64 wageCipher;             // Encrypted wage
    euint32 tenureCipher;           // Encrypted tenure
    euint16 roleCipher;             // Encrypted role
    euint8 incidentCipher;          // Encrypted incident
    euint32 loyaltyCipher;          // Encrypted loyalty
    euint16 performanceCipher;      // Encrypted performance
    euint8 integrityCipher;         // Encrypted integrity
    // ... other fields
}
```

**Based on**: FHE Knowledge Base Chapter 13 Parameter Transfer Complete Flow

### 3. PolicyManager (Policy Management Module)

**Responsibility**: Benefit policy definition and management

**Core Functions**:
- Base policy management
- Program-specific policies
- Policy update and version control

**Interface**: `IPolicyManager`

**Data Structure**:
```solidity
struct BenefitPolicy {
    uint64 wageFloor;           // Wage threshold
    uint64 wagePadding;         // Wage subsidy
    uint32 tenureFloor;         // Tenure threshold
    uint16 roleFloor;           // Role threshold
    uint8 incidentAllowance;    // Incident tolerance
    uint32 loyaltyFloor;        // Loyalty threshold
    uint16 performanceFloor;    // Performance threshold
    uint8 integrityFloor;       // Integrity threshold
    uint64 premiumBoost;        // Premium benefit boost
    uint32 loyaltyBoost;        // Loyalty boost
    uint32 reviewWindow;        // Assessment window
    uint32 reviewCooldown;      // Assessment cooldown
    uint8 maxEvaluations;       // Maximum evaluations
}
```

**Based on**: FHE Knowledge Base Chapter 11 ACL Permission Management

### 4. AssessmentEngine (Assessment Engine Module)

**Responsibility**: Benefit assessment calculation and Gateway interaction

**Core Functions**:
- FHE computation and assessment
- Gateway decryption request
- Timeout handling and refund

**Interface**: `IAssessmentEngine`

**Assessment Flow**:
```
1. Receive assessment request
2. Execute FHE computation
3. Request Gateway decryption
4. Process decryption result
5. Update assessment status
```

**Based on**: FHE Knowledge Base Chapter 20 Gateway Timeout Handling

### 5. Aggregator (Aggregator Module)

**Responsibility**: Benefit data aggregation and statistics

**Core Functions**:
- Data aggregation and statistics
- Obfuscated reserves management
- Statistics data export

**Interface**: `IAggregator`

**Aggregation Features**:
```solidity
struct AggregateStats {
    euint64 totalBenefits;      // Total benefits
    euint64 totalPremiums;      // Total premium benefits
    euint32 totalLoyalty;       // Total loyalty
    uint256 memberCount;        // Member count
    uint256 activeBenefits;     // Active benefits count
    uint256 lastUpdated;        // Last updated time
}
```

**Based on**: FHE Knowledge Base Chapter 22 Obfuscated Reserves

## 🔄 Data Flow Design

### 1. Benefit Record Submission Flow

```
User → BenefitVault → Data Validation → Encrypted Storage → Event Emission
```

### 2. Benefit Assessment Flow

```
User → AssessmentEngine → FHE Computation → Gateway Decryption → Result Storage → Event Emission
```

### 3. Data Aggregation Flow

```
AssessmentEngine → Aggregator → Data Aggregation → Obfuscated Reserves → Statistics Update
```

## 🛡️ Security Design

### 1. Permission Control

- **Hierarchical Permissions**: Different roles have different permission levels
- **Least Privilege**: Each module only has necessary permissions
- **Permission Verification**: All operations undergo permission checks

### 2. Data Protection

- **Encrypted Storage**: All sensitive data is FHE encrypted
- **Access Control**: Only authorized users can access data
- **Audit Logs**: Complete audit logs for all operations

### 3. Exception Handling

- **Fail-Closed**: System maintains secure state in exceptional cases
- **Timeout Handling**: Gateway timeout automatic handling
- **Error Recovery**: Support error recovery and retry

## 📊 Performance Optimization

### 1. Modular Design

- **Independent Deployment**: Each module can be deployed and upgraded independently
- **Standardized Interfaces**: Unified interface specifications
- **Minimized Dependencies**: Reduce inter-module dependencies

### 2. FHE Optimization

- **Batch Processing**: Support batch FHE operations
- **Cache Mechanism**: Cache FHE computation results
- **Asynchronous Processing**: Long FHE computations processed asynchronously

### 3. Gas Optimization

- **Storage Optimization**: Use packed structs
- **Event Optimization**: Optimize event parameters
- **Computation Optimization**: Reduce unnecessary computations

## 🔧 Deployment Architecture

### 1. Deployment Order

```
1. AccessControl (Access Control)
2. BenefitVault (Benefit Vault)
3. PolicyManager (Policy Management)
4. AssessmentEngine (Assessment Engine)
5. Aggregator (Aggregator)
6. CrypticBenefitNetworkV2 (Main Contract)
```

### 2. Configuration Management

- **Environment Variables**: Use environment variables for configuration management
- **Network Configuration**: Support multi-network deployment
- **Version Management**: Support version control and upgrade

### 3. Monitoring and Auditing

- **Event Monitoring**: Listen to key events
- **State Checking**: Regularly check system status
- **Exception Handling**: Handle exceptional cases

## 📈 Scalability Design

### 1. Module Extension

- **Add New Modules**: Support adding new functional modules
- **Interface Extension**: Support interface feature extension
- **Backward Compatibility**: Maintain backward compatibility

### 2. Feature Extension

- **Add New Features**: Support adding new features
- **Extend Existing Features**: Support extending existing features
- **Configuration Extension**: Support configuration parameter extension

### 3. Performance Extension

- **Horizontal Scaling**: Support horizontal scaling
- **Vertical Scaling**: Support vertical scaling
- **Load Balancing**: Support load balancing

## 🎯 Best Practices

### 1. Development Practices

- **Code Standards**: Follow Solidity code standards
- **Test Coverage**: Maintain high test coverage
- **Complete Documentation**: Maintain complete documentation

### 2. Security Practices

- **Security Audits**: Regular security audits
- **Vulnerability Scanning**: Regular vulnerability scanning
- **Permission Review**: Regular permission assignment review

### 3. Operations Practices

- **Monitoring Alerts**: Set up monitoring and alerts
- **Backup Recovery**: Regular backup and recovery testing
- **Version Management**: Strict version management

---

**Version**: 2.0.0  
**Last Updated**: 2025-10-22  
**Based on**: FHE Knowledge Base v8.0
