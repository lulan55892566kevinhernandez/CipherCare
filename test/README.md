# CipherCare Test Suite

Comprehensive unit and integration tests for the CipherCare platform.

## Test Structure

```
test/
├── AccessControl.test.js      # Access control & role management tests
├── PolicyManager.test.js      # Policy creation & management tests
├── BenefitVault.test.js       # Benefit recording & retrieval tests
├── Integration.test.js        # End-to-end integration tests
├── frontend/
│   └── fhe.test.js           # FHE library unit tests
└── README.md                  # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test File
```bash
npx hardhat test test/AccessControl.test.js
npx hardhat test test/PolicyManager.test.js
npx hardhat test test/BenefitVault.test.js
npx hardhat test test/Integration.test.js
```

### With Gas Reporting
```bash
REPORT_GAS=true npm test
```

### With Coverage
```bash
npm run coverage
```

## Test Coverage

### Smart Contracts

#### AccessControl.sol
- ✅ Role initialization
- ✅ Role granting/revoking
- ✅ Permission checks
- ✅ Role enumeration
- ✅ Events emission

#### SimplePolicyManager.sol
- ✅ Policy creation
- ✅ Policy details retrieval
- ✅ Active policies query
- ✅ Policy deactivation
- ✅ Input validation
- ✅ Events emission

#### SimpleBenefitVault.sol
- ✅ Benefit recording
- ✅ Benefit retrieval (single & batch)
- ✅ Status updates
- ✅ Member benefit queries
- ✅ Statistics tracking
- ✅ Events emission

### Integration Tests
- ✅ Complete benefit lifecycle
- ✅ Multi-policy scenarios
- ✅ Multi-member scenarios
- ✅ Role-based access control
- ✅ Data consistency
- ✅ Gas optimization

### Frontend Tests
- ✅ FHE initialization
- ✅ Data encryption
- ✅ Type conversions
- ✅ Address hashing

## Test Scenarios

### Unit Tests
Each contract has comprehensive unit tests covering:
- Deployment and initialization
- Core functionality
- Edge cases and error handling
- Events emission
- Access control
- Data validation

### Integration Tests
Full workflow tests including:
1. Policy creation by admin
2. Benefit submission by members
3. Benefit approval/rejection
4. Multi-member interactions
5. Cross-contract consistency

## Writing New Tests

### Template
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YourContract", function () {
  let contract;
  let owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("YourContract");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  describe("Feature", function () {
    it("Should do something", async function () {
      // Test implementation
      expect(await contract.someFunction()).to.equal(expectedValue);
    });
  });
});
```

## Continuous Integration

Tests are automatically run on:
- Every commit
- Pull requests
- Before deployment

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive names**: Use clear test descriptions
3. **Isolation**: Each test should be independent
4. **Coverage**: Aim for >90% code coverage
5. **Edge cases**: Test boundary conditions
6. **Events**: Verify event emissions
7. **Reverts**: Test error conditions

## Gas Optimization Tests

Monitor gas usage for:
- Policy creation (~50k-100k gas)
- Benefit recording (~80k-120k gas)
- Batch operations
- Query operations

## Security Tests

Verify:
- Access control enforcement
- Input validation
- Reentrancy protection
- Integer overflow/underflow
- Proper event logging

## Dependencies

- Hardhat: Testing framework
- Chai: Assertion library
- Ethers.js: Ethereum library
- Mocha: Test runner

## Troubleshooting

### Common Issues

**Tests failing with "Contract not deployed"**
- Check contract compilation: `npm run compile`

**Gas estimation errors**
- Increase gas limit in hardhat.config.js

**Timeout errors**
- Increase mocha timeout in test file

## Resources

- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Assertions](https://www.chaijs.com/api/)
- [Ethers.js Docs](https://docs.ethers.org/)
