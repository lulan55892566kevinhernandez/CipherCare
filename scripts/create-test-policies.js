const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Creating test policies...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Account Information:");
  console.log("Deployer address:", deployer.address);
  
  // PolicyManager address
  const policyManagerAddress = "0x5091553bA7BD0c66a017B5B0d30f0087c0e54581";
  
  // Connect to PolicyManager contract
  const PolicyManager = await ethers.getContractFactory("PolicyManager");
  const policyManager = PolicyManager.attach(policyManagerAddress);
  
  console.log("Connected to PolicyManager:", policyManagerAddress);
  
  try {
    // Create test policies
    console.log("\n🔨 Creating test policies...");
    
    // Policy 1: Medical Insurance
    const tx1 = await policyManager.createPolicy(
      "Medical Insurance",
      "Comprehensive medical insurance coverage for employees",
      5000 // $5000 max amount
    );
    await tx1.wait();
    console.log("✅ Created Medical Insurance policy (ID: 1)");
    
    // Policy 2: Dental Care
    const tx2 = await policyManager.createPolicy(
      "Dental Care",
      "Dental care and treatment benefits",
      2000 // $2000 max amount
    );
    await tx2.wait();
    console.log("✅ Created Dental Care policy (ID: 2)");
    
    // Policy 3: Education Support
    const tx3 = await policyManager.createPolicy(
      "Education Support",
      "Educational expenses and training support",
      3000 // $3000 max amount
    );
    await tx3.wait();
    console.log("✅ Created Education Support policy (ID: 3)");
    
    // Activate all policies
    console.log("\n🔧 Activating policies...");
    
    await policyManager.activatePolicy(1);
    console.log("✅ Activated Medical Insurance policy");
    
    await policyManager.activatePolicy(2);
    console.log("✅ Activated Dental Care policy");
    
    await policyManager.activatePolicy(3);
    console.log("✅ Activated Education Support policy");
    
    // Verify policies
    console.log("\n🔍 Verifying policies...");
    
    const policyCount = await policyManager.getPolicyCount();
    console.log("Total policies:", policyCount.toString());
    
    for (let i = 1; i <= 3; i++) {
      try {
        const [name, description, maxAmount, isActive] = await policyManager.getPolicyDetails(i);
        console.log(`Policy ${i}: ${name} - Max: $${maxAmount} - ${isActive ? 'Active' : 'Inactive'}`);
      } catch (error) {
        console.log(`Policy ${i}: Error - ${error.message}`);
      }
    }
    
    console.log("\n🎉 Test policies created successfully!");
    console.log("\n📋 Frontend should now be able to load policy options");
    
  } catch (error) {
    console.error("❌ Error creating policies:", error.message);
    
    if (error.message.includes("UnauthorizedAccess")) {
      console.log("\n💡 Tip: Make sure the deployer has the correct roles in AccessControl");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });



