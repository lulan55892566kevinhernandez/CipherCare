const hre = require("hardhat");

async function main() {
  console.log("\n🔐 Granting MEMBER_ROLE...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deployer account:", deployer.address);

  const accessControlAddress = "0x428a7a4c836bEdb3BFAC9c45Aa722Af54e6959eB";
  
  console.log("🔗 AccessControl address:", accessControlAddress);

  const AccessControl = await hre.ethers.getContractFactory("AccessControl");
  const accessControl = AccessControl.attach(accessControlAddress);

  // Get MEMBER_ROLE hash
  const MEMBER_ROLE = await accessControl.MEMBER_ROLE();
  console.log("🔑 MEMBER_ROLE hash:", MEMBER_ROLE);

  // Check if deployer already has the role
  const hasRole = await accessControl.hasRole(MEMBER_ROLE, deployer.address);
  
  if (hasRole) {
    console.log("✅ Deployer already has MEMBER_ROLE");
  } else {
    console.log("📝 Granting MEMBER_ROLE to deployer...");
    const tx = await accessControl.grantRole(MEMBER_ROLE, deployer.address);
    await tx.wait();
    console.log("✅ MEMBER_ROLE granted successfully");
  }

  console.log("\n✨ Done! You can now submit benefits.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });

