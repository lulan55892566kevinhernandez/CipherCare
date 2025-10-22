#!/bin/bash

echo "================================="
echo "  CipherCare Test Suite Runner"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Test Summary${NC}"
echo ""

# Count test files
CONTRACT_TESTS=$(find test -name "*.test.js" ! -path "*/frontend/*" | wc -l | tr -d ' ')
FRONTEND_TESTS=$(find test/frontend -name "*.test.js" 2>/dev/null | wc -l | tr -d ' ')

echo "Smart Contract Tests: $CONTRACT_TESTS files"
echo "Frontend Tests: $FRONTEND_TESTS files"
echo "Total Test Files: $((CONTRACT_TESTS + FRONTEND_TESTS))"
echo ""

echo -e "${YELLOW}🧪 Running Tests...${NC}"
echo ""

# Run smart contract tests
echo "Running Smart Contract Tests..."
npx hardhat test 2>&1 | tee test-results.log

# Check results
if grep -q "passing" test-results.log; then
    PASSING=$(grep "passing" test-results.log | awk '{print $1}')
    echo -e "${GREEN}✅ Tests completed: $PASSING passing${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
fi

echo ""
echo "Full results saved to: test-results.log"
echo ""
echo -e "${YELLOW}📊 Test Coverage${NC}"
echo "Run: npx hardhat coverage"
echo ""
