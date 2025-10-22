# Quick Start Guide - CipherCare Tests

## 🚀 Run Tests in 30 Seconds

### Option 1: Run All Tests
```bash
cd /Users/songsu/Desktop/zama/CipherCare
npx hardhat test
```

### Option 2: Use Test Script
```bash
cd /Users/songsu/Desktop/zama/CipherCare
./test/run-tests.sh
```

### Option 3: Run Specific Tests
```bash
# Test AccessControl
npx hardhat test test/AccessControl.test.js

# Test PolicyManager  
npx hardhat test test/PolicyManager.test.js

# Test BenefitVault
npx hardhat test test/BenefitVault.test.js

# Test Integration
npx hardhat test test/Integration.test.js
```

## 📊 What to Expect

When tests run successfully, you'll see:

```
  AccessControl Contract
    Deployment
      ✓ Should set the deployer as DEFAULT_ADMIN_ROLE
      ✓ Should initialize role constants correctly
    Role Management
      ✓ Should allow admin to grant GOVERNOR_ROLE
      ✓ Should allow admin to grant COUNCIL_ROLE
      ... more tests ...

  SimplePolicyManager Contract
    Deployment
      ✓ Should set correct initial state
    Policy Creation
      ✓ Should create a new policy
      ✓ Should store policy details correctly
      ... more tests ...

  70+ passing (5-8s)
```

## 🐛 Troubleshooting

### Tests fail with compilation errors
```bash
# Clean and recompile
npx hardhat clean
npx hardhat compile
npx hardhat test
```

### Tests timeout
```bash
# Increase timeout in hardhat.config.js
mocha: {
  timeout: 60000
}
```

### Gas estimation errors
```bash
# Check hardhat.config.js gas settings
networks: {
  hardhat: {
    gas: 12000000
  }
}
```

## 📚 Test Documentation

- **Full Guide**: `test/README.md`
- **Summary**: `test/TEST_SUMMARY.md`
- **Statistics**: `test/test-stats.txt`

## 💡 Tips

1. **Run tests before committing** - Catch bugs early
2. **Check coverage** - Run `npx hardhat coverage`
3. **Read test output** - Detailed error messages help debug
4. **Update tests** - When adding new features

## 🎯 Next Steps

After running tests:
1. Check coverage report
2. Review failed tests (if any)
3. Update code based on findings
4. Re-run tests to verify fixes

---

**Need Help?** Check `test/README.md` for detailed documentation.
