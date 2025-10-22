const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging PolicyManager...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Account Information:");
  console.log("Deployer address:", deployer.address);
  
  // Contract addresses
  const accessControlAddress = "0x428a7a4c836bEdb3BFAC9c45Aa722Af54e6959eB";
  const policyManagerAddress = "0x5091553bA7BD0c66a017B5B0d30f0087c0e54581";
  
  // Connect to contracts
  const AccessControl = await ethers.getContractFactory("AccessControl");
  const accessControl = AccessControl.attach(accessControlAddress);
  
  const PolicyManager = await ethers.getContractFactory("PolicyManager");
  const policyManager = PolicyManager.attach(policyManagerAddress);
  
  try {
    // Check AccessControl connection
    console.log("🔍 Checking AccessControl connection...");
    const connectedAccessControl = await policyManager.accessControl();
    console.log("PolicyManager connected to AccessControl:", connectedAccessControl);
    console.log("Expected AccessControl address:", accessControlAddress);
    console.log("Connection correct:", connectedAccessControl.toLowerCase() === accessControlAddress.toLowerCase());
    
    // Check roles in AccessControl
    console.log("\n🔍 Checking roles in AccessControl...");
    const GOVERNOR_ROLE = await accessControl.GOVERNOR_ROLE();
    const COUNCIL_ROLE = await accessControl.COUNCIL_ROLE();
    
    const hasGovernor = await accessControl.hasRole(GOVERNOR_ROLE, deployer.address);
    const hasCouncil = await accessControl.hasRole(COUNCIL_ROLE, deployer.address);
    
    console.log("Deployer has GOVERNOR_ROLE:", hasGovernor);
    console.log("Deployer has COUNCIL_ROLE:", hasCouncil);
    
    // Check if PolicyManager can verify roles
    console.log("\n🔍 Testing role verification through PolicyManager...");
    try {
    // Try to call a view function first
    const nextPolicyId = await policyManager.nextPolicyId();
    console.log("✅ PolicyManager nextPolicyId() works, next ID:", nextPolicyId.toString());
    } catch (error) {
      console.log("❌ PolicyManager nextPolicyId() failed:", error.message);
    }
    
    // Try to create a simple policy
    console.log("\n🔍 Testing policy creation...");
    try {
      const tx = await policyManager.createPolicy(
        "Test Policy",
        "Test policy for debugging",
        1000
      );
      console.log("✅ Policy creation transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Policy creation confirmed in block:", receipt.blockNumber);
    } catch (error) {
      console.log("❌ Policy creation failed:", error.message);
      
      // Try to get more details about the error
      if (error.message.includes("Not authorized")) {
        console.log("💡 Authorization issue detected");
        
        // Check if the issue is with the role verification
        try {
          const hasRoleDirect = await accessControl.hasRole(GOVERNOR_ROLE, deployer.address);
          console.log("Direct role check result:", hasRoleDirect);
        } catch (roleError) {
          console.log("Role check error:", roleError.message);
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
