const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting PolicyManager deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Deployment Information:");
  console.log("Deployer address:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  console.log("Deployer balance:", balanceInEth, "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance. Consider adding more ETH for deployment.");
  }

  console.log("\n🔨 Deploying PolicyManager contract...");
  
  // AccessControl address (already deployed)
  const accessControlAddress = "0x428a7a4c836bEdb3BFAC9c45Aa722Af54e6959eB";
  console.log("Using AccessControl address:", accessControlAddress);
  
  // Deploy PolicyManager
  const PolicyManager = await ethers.getContractFactory("PolicyManager");
  const policyManager = await PolicyManager.deploy(accessControlAddress);
  await policyManager.waitForDeployment();
  
  const policyManagerAddress = await policyManager.getAddress();
  console.log("✅ PolicyManager deployed to:", policyManagerAddress);
  
  // Create some default policies for testing
  console.log("\n🔧 Creating default policies...");
  
  try {
    // Create a few test policies
    const tx1 = await policyManager.createPolicy(
      "Medical Insurance",
      "Comprehensive medical insurance coverage",
      5000 // $5000 max amount
    );
    await tx1.wait();
    console.log("✅ Created Medical Insurance policy");
    
    const tx2 = await policyManager.createPolicy(
      "Dental Care",
      "Dental care and treatment benefits",
      2000 // $2000 max amount
    );
    await tx2.wait();
    console.log("✅ Created Dental Care policy");
    
    const tx3 = await policyManager.createPolicy(
      "Education Support",
      "Educational expenses and training support",
      3000 // $3000 max amount
    );
    await tx3.wait();
    console.log("✅ Created Education Support policy");
    
    // Activate all policies
    await policyManager.activatePolicy(1);
    await policyManager.activatePolicy(2);
    await policyManager.activatePolicy(3);
    console.log("✅ Activated all policies");
    
  } catch (error) {
    console.log("⚠️  Could not create default policies:", error.message);
  }
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  
  try {
    const policyCount = await policyManager.getPolicyCount();
    console.log("Total policies created:", policyCount.toString());
    
    // Get policy details
    for (let i = 1; i <= 3; i++) {
      try {
        const [name, description, maxAmount, isActive] = await policyManager.getPolicyDetails(i);
        console.log(`Policy ${i}: ${name} (${isActive ? 'Active' : 'Inactive'}) - Max: $${maxAmount}`);
      } catch (error) {
        console.log(`Policy ${i}: Not found`);
      }
    }
  } catch (error) {
    console.log("Could not verify policies:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PolicyManager: policyManagerAddress
    }
  };
  
  console.log("\n📝 Deployment Summary:");
  console.log("Network: Sepolia Testnet");
  console.log("Deployer:", deployer.address);
  console.log("PolicyManager:", policyManagerAddress);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${policyManagerAddress}`);
  
  console.log("\n🎉 PolicyManager deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Update frontend configuration with PolicyManager address");
  console.log("2. Deploy other modules (BenefitVault, AssessmentEngine, Aggregator)");
  console.log("3. Test complete system functionality");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
