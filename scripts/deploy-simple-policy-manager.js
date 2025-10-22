const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Starting SimplePolicyManager deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // AccessControl contract address (already deployed)
  const accessControlAddress = "0x428a7a4c836bEdb3BFAC9c45Aa722Af54e6959eB";
  console.log("🔗 Using AccessControl at:", accessControlAddress);

  // Deploy SimplePolicyManager
  console.log("\n📦 Deploying SimplePolicyManager...");
  const SimplePolicyManager = await hre.ethers.getContractFactory("SimplePolicyManager");
  const policyManager = await SimplePolicyManager.deploy(accessControlAddress);

  await policyManager.waitForDeployment();
  const policyManagerAddress = await policyManager.getAddress();

  console.log("✅ SimplePolicyManager deployed to:", policyManagerAddress);

  // Create test policies
  console.log("\n🔨 Creating test policies...");
  
  try {
    const tx1 = await policyManager.createPolicy(
      "Medical Insurance",
      "Comprehensive medical coverage for employees",
      500000 // $5000 in cents
    );
    await tx1.wait();
    console.log("✅ Created Medical Insurance policy");

    const tx2 = await policyManager.createPolicy(
      "Education Allowance",
      "Educational support for employee development",
      200000 // $2000 in cents
    );
    await tx2.wait();
    console.log("✅ Created Education Allowance policy");

    const tx3 = await policyManager.createPolicy(
      "Housing Support",
      "Housing assistance for employees",
      300000 // $3000 in cents
    );
    await tx3.wait();
    console.log("✅ Created Housing Support policy");

    // Check policy count
    const nextId = await policyManager.nextPolicyId();
    console.log("📊 Total policies created:", Number(nextId) - 1);

  } catch (error) {
    console.error("❌ Error creating policies:", error.message);
  }

  // Save deployment info
  console.log("\n📝 Deployment Summary:");
  console.log("=" .repeat(60));
  console.log("AccessControl:        ", accessControlAddress);
  console.log("SimplePolicyManager:  ", policyManagerAddress);
  console.log("=" .repeat(60));

  console.log("\n💡 Next steps:");
  console.log("1. Update frontend config with SimplePolicyManager address");
  console.log("2. Test policy selection in frontend\n");

  return {
    accessControl: accessControlAddress,
    policyManager: policyManagerAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
