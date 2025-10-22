const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Setting up roles for deployer...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Account Information:");
  console.log("Deployer address:", deployer.address);
  
  // AccessControl address
  const accessControlAddress = "0x428a7a4c836bEdb3BFAC9c45Aa722Af54e6959eB";
  
  // Connect to AccessControl contract
  const AccessControl = await ethers.getContractFactory("AccessControl");
  const accessControl = AccessControl.attach(accessControlAddress);
  
  console.log("Connected to AccessControl:", accessControlAddress);
  
  try {
    // Get role hashes
    const GOVERNOR_ROLE = await accessControl.GOVERNOR_ROLE();
    const COUNCIL_ROLE = await accessControl.COUNCIL_ROLE();
    const ASSESSOR_ROLE = await accessControl.ASSESSOR_ROLE();
    const AUDITOR_ROLE = await accessControl.AUDITOR_ROLE();
    
    console.log("\n🔑 Role Hashes:");
    console.log("GOVERNOR_ROLE:", GOVERNOR_ROLE);
    console.log("COUNCIL_ROLE:", COUNCIL_ROLE);
    console.log("ASSESSOR_ROLE:", ASSESSOR_ROLE);
    console.log("AUDITOR_ROLE:", AUDITOR_ROLE);
    
    // Check current roles
    console.log("\n🔍 Checking current roles...");
    const hasGovernor = await accessControl.hasRole(GOVERNOR_ROLE, deployer.address);
    const hasCouncil = await accessControl.hasRole(COUNCIL_ROLE, deployer.address);
    const hasAssessor = await accessControl.hasRole(ASSESSOR_ROLE, deployer.address);
    const hasAuditor = await accessControl.hasRole(AUDITOR_ROLE, deployer.address);
    
    console.log("Governor role:", hasGovernor ? "✅" : "❌");
    console.log("Council role:", hasCouncil ? "✅" : "❌");
    console.log("Assessor role:", hasAssessor ? "✅" : "❌");
    console.log("Auditor role:", hasAuditor ? "✅" : "❌");
    
    // Grant roles if not already granted
    console.log("\n🔧 Granting roles...");
    
    if (!hasGovernor) {
      const tx1 = await accessControl.grantRole(GOVERNOR_ROLE, deployer.address);
      await tx1.wait();
      console.log("✅ Granted GOVERNOR_ROLE");
    } else {
      console.log("✅ GOVERNOR_ROLE already granted");
    }
    
    if (!hasCouncil) {
      const tx2 = await accessControl.grantRole(COUNCIL_ROLE, deployer.address);
      await tx2.wait();
      console.log("✅ Granted COUNCIL_ROLE");
    } else {
      console.log("✅ COUNCIL_ROLE already granted");
    }
    
    if (!hasAssessor) {
      const tx3 = await accessControl.grantRole(ASSESSOR_ROLE, deployer.address);
      await tx3.wait();
      console.log("✅ Granted ASSESSOR_ROLE");
    } else {
      console.log("✅ ASSESSOR_ROLE already granted");
    }
    
    if (!hasAuditor) {
      const tx4 = await accessControl.grantRole(AUDITOR_ROLE, deployer.address);
      await tx4.wait();
      console.log("✅ Granted AUDITOR_ROLE");
    } else {
      console.log("✅ AUDITOR_ROLE already granted");
    }
    
    // Verify roles again
    console.log("\n🔍 Verifying roles after setup...");
    const hasGovernorAfter = await accessControl.hasRole(GOVERNOR_ROLE, deployer.address);
    const hasCouncilAfter = await accessControl.hasRole(COUNCIL_ROLE, deployer.address);
    const hasAssessorAfter = await accessControl.hasRole(ASSESSOR_ROLE, deployer.address);
    const hasAuditorAfter = await accessControl.hasRole(AUDITOR_ROLE, deployer.address);
    
    console.log("Governor role:", hasGovernorAfter ? "✅" : "❌");
    console.log("Council role:", hasCouncilAfter ? "✅" : "❌");
    console.log("Assessor role:", hasAssessorAfter ? "✅" : "❌");
    console.log("Auditor role:", hasAuditorAfter ? "✅" : "❌");
    
    console.log("\n🎉 Role setup completed successfully!");
    console.log("\n📋 Now you can create policies and manage the system");
    
  } catch (error) {
    console.error("❌ Error setting up roles:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });



