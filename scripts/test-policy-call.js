const hre = require("hardhat");

async function main() {
  console.log("\n🧪 Testing policy contract calls...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Account:", deployer.address);

  const policyManagerAddress = "0xAF53708bf861AD33aE89D96E16abe457aa42D5FF";
  
  const SimplePolicyManager = await hre.ethers.getContractFactory("SimplePolicyManager");
  const policyManager = SimplePolicyManager.attach(policyManagerAddress);

  try {
    // Test nextPolicyId
    console.log("🔍 Testing nextPolicyId()...");
    const nextId = await policyManager.nextPolicyId();
    console.log("✅ nextPolicyId result:", Number(nextId));

    // Test getPolicyDetails for policy 1
    console.log("\n🔍 Testing getPolicyDetails(1)...");
    const details = await policyManager.getPolicyDetails(1);
    console.log("✅ Policy 1 details:", {
      name: details[0],
      description: details[1],
      isActive: details[2],
      maxAmount: Number(details[3])
    });

    // Test getActivePolicies with timeout
    console.log("\n🔍 Testing getActivePolicies() with timeout...");
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
    );
    
    const activePoliciesPromise = policyManager.getActivePolicies();
    
    try {
      const result = await Promise.race([activePoliciesPromise, timeoutPromise]);
      console.log("✅ getActivePolicies result:", result);
    } catch (timeoutError) {
      console.log("⏰ getActivePolicies timed out, trying individual calls...");
      
      // Fallback: get individual policies
      const policies = [];
      for (let i = 1; i < Number(nextId); i++) {
        const policyDetails = await policyManager.getPolicyDetails(i);
        policies.push({
          id: i,
          name: policyDetails[0],
          description: policyDetails[1],
          isActive: policyDetails[2],
          maxAmount: Number(policyDetails[3])
        });
      }
      console.log("✅ Individual policies:", policies);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });
