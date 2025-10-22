const hre = require("hardhat");

async function main() {
  console.log("\n🔍 Checking policies in SimplePolicyManager...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Account:", deployer.address);

  const policyManagerAddress = "0xAF53708bf861AD33aE89D96E16abe457aa42D5FF";
  
  const SimplePolicyManager = await hre.ethers.getContractFactory("SimplePolicyManager");
  const policyManager = SimplePolicyManager.attach(policyManagerAddress);

  try {
    // Check nextPolicyId
    const nextId = await policyManager.nextPolicyId();
    console.log("📊 Next Policy ID:", Number(nextId));

    // Check getActivePolicies
    console.log("\n🔍 Calling getActivePolicies()...");
    const activePolicies = await policyManager.getActivePolicies();
    console.log("📋 Active policies result:", activePolicies);

    // Check individual policies
    for (let i = 1; i < Number(nextId); i++) {
      console.log(`\n📄 Policy ${i}:`);
      const details = await policyManager.getPolicyDetails(i);
      console.log("  Name:", details[0]);
      console.log("  Description:", details[1]);
      console.log("  Is Active:", details[2]);
      console.log("  Max Amount:", Number(details[3]));
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
