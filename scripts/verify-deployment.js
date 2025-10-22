const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying CrypticBenefit-Network deployment...\n");

  // Contract addresses (these will be filled after deployment)
  const contractAddresses = {
    CrypticBenefitNetworkV2: process.env.MAIN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    PolicyManager: process.env.POLICY_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000",
    BenefitVault: process.env.BENEFIT_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000",
    AssessmentEngine: process.env.ASSESSMENT_ENGINE_ADDRESS || "0x0000000000000000000000000000000000000000",
    Aggregator: process.env.AGGREGATOR_ADDRESS || "0x0000000000000000000000000000000000000000",
    AccessControl: process.env.ACCESS_CONTROL_ADDRESS || "0x0000000000000000000000000000000000000000"
  };

  console.log("📋 Contract Addresses:");
  Object.entries(contractAddresses).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });

  // Check if addresses are set
  const hasAddresses = Object.values(contractAddresses).some(addr => 
    addr !== "0x0000000000000000000000000000000000000000"
  );

  if (!hasAddresses) {
    console.log("\n⚠️  No contract addresses found in environment variables.");
    console.log("Please set the contract addresses in your .env file after deployment.");
    return;
  }

  console.log("\n🔍 Verifying contracts...");

  // Verify each contract
  for (const [name, address] of Object.entries(contractAddresses)) {
    if (address === "0x0000000000000000000000000000000000000000") {
      console.log(`⏭️  Skipping ${name} - no address provided`);
      continue;
    }

    try {
      console.log(`\n📄 Verifying ${name} at ${address}...`);
      
      // Get contract code
      const code = await ethers.provider.getCode(address);
      
      if (code === "0x") {
        console.log(`❌ ${name}: No contract found at address`);
      } else {
        console.log(`✅ ${name}: Contract deployed successfully`);
        console.log(`   Code size: ${(code.length - 2) / 2} bytes`);
        
        // Try to get some basic info from the contract
        try {
          const contract = await ethers.getContractAt(name, address);
          
          // Test basic functionality based on contract type
          if (name === "CrypticBenefitNetworkV2") {
            // Test if we can call a view function
            try {
              const stats = await contract.getSystemStats();
              console.log(`   System stats: ${stats[0]} members, ${stats[1]} benefits, ${stats[2]} policies`);
            } catch (e) {
              console.log(`   ⚠️  Could not call getSystemStats: ${e.message}`);
            }
          }
        } catch (e) {
          console.log(`   ⚠️  Could not interact with contract: ${e.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${name}: Error verifying - ${error.message}`);
    }
  }

  console.log("\n🌐 Network Information:");
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
  
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log("Current block:", blockNumber);

  console.log("\n📊 Deployment Summary:");
  console.log("✅ Deployment verification completed");
  console.log("📝 Next steps:");
  console.log("   1. Update frontend contract addresses");
  console.log("   2. Verify contracts on Etherscan");
  console.log("   3. Test frontend integration");
  console.log("   4. Update documentation");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });

