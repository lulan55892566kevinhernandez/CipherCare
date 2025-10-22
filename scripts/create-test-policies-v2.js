const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Creating test policies for V2 contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📋 Deployer address:", deployer.address);

  const v2Address = "0x701BF02db8a3034E012745461b93C1C10d8738cC";

  const V2Contract = await ethers.getContractFactory("CrypticBenefitNetworkV2");
  const contract = V2Contract.attach(v2Address);

  console.log("Connected to V2 contract:", v2Address);

  try {
    console.log("\n🔨 Creating test policies...");

    // Policy 1: Healthcare Coverage
    console.log("\n1️⃣ Creating Healthcare Coverage policy...");
    const tx1 = await contract.createPolicy(
      "Healthcare Coverage",
      "Comprehensive healthcare insurance for employees and families",
      500000 // $5000 in cents
    );
    await tx1.wait();
    console.log("✅ Created Healthcare Coverage policy");

    // Policy 2: Dental Benefits
    console.log("\n2️⃣ Creating Dental Benefits policy...");
    const tx2 = await contract.createPolicy(
      "Dental Benefits",
      "Annual dental care and treatment coverage",
      200000 // $2000 in cents
    );
    await tx2.wait();
    console.log("✅ Created Dental Benefits policy");

    // Policy 3: Education Support
    console.log("\n3️⃣ Creating Education Support policy...");
    const tx3 = await contract.createPolicy(
      "Education Support",
      "Professional development and training assistance",
      300000 // $3000 in cents
    );
    await tx3.wait();
    console.log("✅ Created Education Support policy");

    // Policy 4: Housing Allowance
    console.log("\n4️⃣ Creating Housing Allowance policy...");
    const tx4 = await contract.createPolicy(
      "Housing Allowance",
      "Monthly housing and accommodation support",
      150000 // $1500 in cents
    );
    await tx4.wait();
    console.log("✅ Created Housing Allowance policy");

    // Policy 5: Childcare Support
    console.log("\n5️⃣ Creating Childcare Support policy...");
    const tx5 = await contract.createPolicy(
      "Childcare Support",
      "Childcare and daycare expense assistance",
      100000 // $1000 in cents
    );
    await tx5.wait();
    console.log("✅ Created Childcare Support policy");

    // Verify policies
    console.log("\n📊 Verifying created policies...");
    const [ids, names, statuses, creators] = await contract.listPolicies();

    console.log(`\n✅ Total policies created: ${ids.length}`);
    console.log("\nPolicy List:");
    for (let i = 0; i < ids.length; i++) {
      console.log(`  ${ids[i]}: ${names[i]} (Active: ${statuses[i]}, Creator: ${creators[i]})`);
    }

    console.log("\n🎉 Test policies created successfully!");

  } catch (error) {
    console.error("❌ Error creating policies:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
