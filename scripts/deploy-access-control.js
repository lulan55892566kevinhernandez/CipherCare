const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting AccessControl deployment...\n");

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

  console.log("\n🔨 Deploying AccessControl contract...");
  
  // Deploy AccessControl
  const AccessControl = await ethers.getContractFactory("AccessControl");
  const accessControl = await AccessControl.deploy();
  await accessControl.waitForDeployment();
  
  const accessControlAddress = await accessControl.getAddress();
  console.log("✅ AccessControl deployed to:", accessControlAddress);
  
  // Initialize with default roles
  console.log("\n🔧 Initializing AccessControl...");
  
  // Grant roles to deployer
  await accessControl.grantRole(await accessControl.GOVERNOR_ROLE(), deployer.address);
  await accessControl.grantRole(await accessControl.COUNCIL_ROLE(), deployer.address);
  await accessControl.grantRole(await accessControl.ASSESSOR_ROLE(), deployer.address);
  await accessControl.grantRole(await accessControl.AUDITOR_ROLE(), deployer.address);
  
  console.log("✅ AccessControl initialized with default roles");
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  
  const hasGovernorRole = await accessControl.hasRole(await accessControl.GOVERNOR_ROLE(), deployer.address);
  const hasCouncilRole = await accessControl.hasRole(await accessControl.COUNCIL_ROLE(), deployer.address);
  const hasAssessorRole = await accessControl.hasRole(await accessControl.ASSESSOR_ROLE(), deployer.address);
  const hasAuditorRole = await accessControl.hasRole(await accessControl.AUDITOR_ROLE(), deployer.address);
  
  console.log("Governor role:", hasGovernorRole ? "✅" : "❌");
  console.log("Council role:", hasCouncilRole ? "✅" : "❌");
  console.log("Assessor role:", hasAssessorRole ? "✅" : "❌");
  console.log("Auditor role:", hasAuditorRole ? "✅" : "❌");
  
  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      AccessControl: accessControlAddress
    }
  };
  
  console.log("\n📝 Deployment Summary:");
  console.log("Network: Sepolia Testnet");
  console.log("Deployer:", deployer.address);
  console.log("AccessControl:", accessControlAddress);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${accessControlAddress}`);
  
  console.log("\n🎉 AccessControl deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Update frontend configuration with AccessControl address");
  console.log("2. Deploy other modules when FHE dependencies are resolved");
  console.log("3. Initialize the complete system");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
