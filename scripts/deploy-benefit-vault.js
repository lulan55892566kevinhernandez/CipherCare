const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Starting SimpleBenefitVault deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance < hre.ethers.parseEther("0.01")) {
    console.warn("⚠️  Warning: Low balance, may not be sufficient for deployment\n");
  }

  // AccessControl contract address (already deployed)
  const accessControlAddress = "0x428a7a4c836bEdb3BFAC9c45Aa722Af54e6959eB";
  console.log("🔗 Using AccessControl at:", accessControlAddress);

  // Deploy SimpleBenefitVault
  console.log("\n📦 Deploying SimpleBenefitVault...");
  const SimpleBenefitVault = await hre.ethers.getContractFactory("SimpleBenefitVault");
  const benefitVault = await SimpleBenefitVault.deploy(accessControlAddress);

  await benefitVault.waitForDeployment();
  const benefitVaultAddress = await benefitVault.getAddress();

  console.log("✅ SimpleBenefitVault deployed to:", benefitVaultAddress);

  // Save deployment info
  console.log("\n📝 Deployment Summary:");
  console.log("=" .repeat(60));
  console.log("AccessControl:      ", accessControlAddress);
  console.log("SimpleBenefitVault: ", benefitVaultAddress);
  console.log("=" .repeat(60));

  console.log("\n💡 Next steps:");
  console.log("1. Grant MEMBER_ROLE to your wallet address");
  console.log("2. Update frontend config with BenefitVault address");
  console.log("3. Test benefit submission\n");

  return {
    accessControl: accessControlAddress,
    benefitVault: benefitVaultAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });

