const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting simple deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  console.log("\n🔨 Deploying AccessControl contract...");
  
  const AccessControl = await ethers.getContractFactory("AccessControl");
  const accessControl = await AccessControl.deploy();
  await accessControl.waitForDeployment();
  
  const address = await accessControl.getAddress();
  console.log("✅ AccessControl deployed to:", address);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("Contract address:", address);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
