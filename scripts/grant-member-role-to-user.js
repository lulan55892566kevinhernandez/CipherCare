const hre = require("hardhat");

async function main() {
  console.log("\n🔐 Granting MEMBER_ROLE to user wallet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deployer account:", deployer.address);

  // The user's wallet address from the failed transaction
  const userAddress = "0xfA756b4D0CC41C367D57E5BDB3b60E7bd296a28A";
  console.log("👤 User wallet address:", userAddress);

  const accessControlAddress = "0x428a7a4c836bEdb3BFAC9c45Aa722Af54e6959eB";
  
  console.log("🔗 AccessControl address:", accessControlAddress);

  const AccessControl = await hre.ethers.getContractFactory("AccessControl");
  const accessControl = AccessControl.attach(accessControlAddress);

  // Get MEMBER_ROLE hash
  const MEMBER_ROLE = await accessControl.MEMBER_ROLE();
  console.log("🔑 MEMBER_ROLE hash:", MEMBER_ROLE);

  // Check if user already has the role
  const hasRole = await accessControl.hasRole(MEMBER_ROLE, userAddress);
  
  if (hasRole) {
    console.log("✅ User already has MEMBER_ROLE");
  } else {
    console.log("📝 Granting MEMBER_ROLE to user...");
    const tx = await accessControl.grantRole(MEMBER_ROLE, userAddress);
    await tx.wait();
    console.log("✅ MEMBER_ROLE granted successfully to user");
  }

  // Also grant GOVERNOR_ROLE to user for full access
  const GOVERNOR_ROLE = await accessControl.GOVERNOR_ROLE();
  const hasGovernorRole = await accessControl.hasRole(GOVERNOR_ROLE, userAddress);
  
  if (hasGovernorRole) {
    console.log("✅ User already has GOVERNOR_ROLE");
  } else {
    console.log("📝 Granting GOVERNOR_ROLE to user...");
    const tx2 = await accessControl.grantRole(GOVERNOR_ROLE, userAddress);
    await tx2.wait();
    console.log("✅ GOVERNOR_ROLE granted successfully to user");
  }

  console.log("\n✨ Done! User can now submit benefits.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });
