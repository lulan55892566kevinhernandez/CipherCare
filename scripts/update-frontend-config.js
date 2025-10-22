const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔄 Updating frontend contract configuration...\n");

  // Read contract addresses from environment or deployment output
  const contractAddresses = {
    CrypticBenefitNetworkV2: process.env.MAIN_CONTRACT_ADDRESS,
    PolicyManager: process.env.POLICY_MANAGER_ADDRESS,
    BenefitVault: process.env.BENEFIT_VAULT_ADDRESS,
    AssessmentEngine: process.env.ASSESSMENT_ENGINE_ADDRESS,
    Aggregator: process.env.AGGREGATOR_ADDRESS,
    AccessControl: process.env.ACCESS_CONTROL_ADDRESS
  };

  // Check if addresses are provided
  const hasAddresses = Object.values(contractAddresses).some(addr => addr && addr !== "0x0000000000000000000000000000000000000000");

  if (!hasAddresses) {
    console.log("⚠️  No contract addresses found in environment variables.");
    console.log("Please set the contract addresses in your .env file after deployment.");
    console.log("\nExample .env entries:");
    console.log("MAIN_CONTRACT_ADDRESS=0x...");
    console.log("POLICY_MANAGER_ADDRESS=0x...");
    console.log("BENEFIT_VAULT_ADDRESS=0x...");
    console.log("ASSESSMENT_ENGINE_ADDRESS=0x...");
    console.log("AGGREGATOR_ADDRESS=0x...");
    console.log("ACCESS_CONTROL_ADDRESS=0x...");
    return;
  }

  console.log("📋 Contract Addresses:");
  Object.entries(contractAddresses).forEach(([name, address]) => {
    if (address && address !== "0x0000000000000000000000000000000000000000") {
      console.log(`✅ ${name}: ${address}`);
    } else {
      console.log(`⏭️  ${name}: Not provided`);
    }
  });

  // Update frontend contract configuration
  const frontendConfigPath = path.join(__dirname, '../webapp/src/config/contracts.ts');
  
  if (!fs.existsSync(frontendConfigPath)) {
    console.log("❌ Frontend config file not found:", frontendConfigPath);
    return;
  }

  try {
    let configContent = fs.readFileSync(frontendConfigPath, 'utf8');
    
    // Update main contract address
    if (contractAddresses.CrypticBenefitNetworkV2) {
      const oldAddressRegex = /CrypticBenefitNetworkV2:\s*'[^']*'/;
      const newAddress = `CrypticBenefitNetworkV2: '${contractAddresses.CrypticBenefitNetworkV2}'`;
      
      if (oldAddressRegex.test(configContent)) {
        configContent = configContent.replace(oldAddressRegex, newAddress);
        console.log("✅ Updated main contract address");
      } else {
        console.log("⚠️  Could not find main contract address pattern to update");
      }
    }

    // Write updated config
    fs.writeFileSync(frontendConfigPath, configContent);
    console.log("✅ Frontend contract configuration updated");

    // Create environment file for frontend
    const frontendEnvPath = path.join(__dirname, '../webapp/.env');
    const frontendEnvContent = `# Contract Configuration
VITE_MAIN_CONTRACT_ADDRESS=${contractAddresses.CrypticBenefitNetworkV2 || ''}

# Network Configuration  
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# WalletConnect Configuration (Required for RainbowKit)
VITE_WALLETCONNECT_PROJECT_ID=demo-project-id
`;

    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log("✅ Frontend environment file created");

    // Update README with contract addresses
    const readmePath = path.join(__dirname, '../README-V2.md');
    if (fs.existsSync(readmePath)) {
      let readmeContent = fs.readFileSync(readmePath, 'utf8');
      
      // Update contract addresses section
      const contractSection = `
## Contract Addresses (Sepolia Testnet)

- **Main Contract**: \`${contractAddresses.CrypticBenefitNetworkV2 || 'Not deployed'}\`
- **Policy Manager**: \`${contractAddresses.PolicyManager || 'Not deployed'}\`
- **Benefit Vault**: \`${contractAddresses.BenefitVault || 'Not deployed'}\`
- **Assessment Engine**: \`${contractAddresses.AssessmentEngine || 'Not deployed'}\`
- **Aggregator**: \`${contractAddresses.Aggregator || 'Not deployed'}\`
- **Access Control**: \`${contractAddresses.AccessControl || 'Not deployed'}\`

### Explorer Links
- [Main Contract on Etherscan](https://sepolia.etherscan.io/address/${contractAddresses.CrypticBenefitNetworkV2 || '0x0000000000000000000000000000000000000000'})
`;

      // Find and replace contract addresses section
      const contractSectionRegex = /## Contract Addresses.*?(?=##|\n##|$)/s;
      if (contractSectionRegex.test(readmeContent)) {
        readmeContent = readmeContent.replace(contractSectionRegex, contractSection);
      } else {
        // Add contract addresses section after the first heading
        const firstHeadingRegex = /(# .*?\n)/;
        readmeContent = readmeContent.replace(firstHeadingRegex, `$1${contractSection}\n`);
      }

      fs.writeFileSync(readmePath, readmeContent);
      console.log("✅ README updated with contract addresses");
    }

    console.log("\n🎉 Frontend configuration update completed!");
    console.log("\n📝 Next steps:");
    console.log("   1. Restart the frontend development server");
    console.log("   2. Test the frontend integration");
    console.log("   3. Verify all contract interactions work");

  } catch (error) {
    console.error("❌ Error updating frontend configuration:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Update failed:", error);
    process.exit(1);
  });



