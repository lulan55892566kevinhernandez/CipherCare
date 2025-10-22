const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting complete system deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  console.log("\n🔨 Deploying core modules...");
  
  // 1. Deploy AccessControl
  console.log("\n1️⃣ Deploying AccessControl...");
  const AccessControl = await ethers.getContractFactory("AccessControl");
  const accessControl = await AccessControl.deploy();
  await accessControl.waitForDeployment();
  const accessControlAddress = await accessControl.getAddress();
  console.log("✅ AccessControl deployed to:", accessControlAddress);
  
  // 2. Deploy PolicyManager
  console.log("\n2️⃣ Deploying PolicyManager...");
  const PolicyManager = await ethers.getContractFactory("PolicyManager");
  const policyManager = await PolicyManager.deploy(accessControlAddress);
  await policyManager.waitForDeployment();
  const policyManagerAddress = await policyManager.getAddress();
  console.log("✅ PolicyManager deployed to:", policyManagerAddress);
  
  // 3. Deploy BenefitVault
  console.log("\n3️⃣ Deploying BenefitVault...");
  const BenefitVault = await ethers.getContractFactory("BenefitVault");
  const benefitVault = await BenefitVault.deploy(accessControlAddress);
  await benefitVault.waitForDeployment();
  const benefitVaultAddress = await benefitVault.getAddress();
  console.log("✅ BenefitVault deployed to:", benefitVaultAddress);
  
  // 4. Deploy AssessmentEngine
  console.log("\n4️⃣ Deploying AssessmentEngine...");
  const AssessmentEngine = await ethers.getContractFactory("AssessmentEngine");
  const assessmentEngine = await AssessmentEngine.deploy(accessControlAddress);
  await assessmentEngine.waitForDeployment();
  const assessmentEngineAddress = await assessmentEngine.getAddress();
  console.log("✅ AssessmentEngine deployed to:", assessmentEngineAddress);
  
  // 5. Deploy Aggregator
  console.log("\n5️⃣ Deploying Aggregator...");
  const Aggregator = await ethers.getContractFactory("Aggregator");
  const aggregator = await Aggregator.deploy(accessControlAddress);
  await aggregator.waitForDeployment();
  const aggregatorAddress = await aggregator.getAddress();
  console.log("✅ Aggregator deployed to:", aggregatorAddress);
  
  // 6. Deploy main contract
  console.log("\n6️⃣ Deploying CrypticBenefitNetworkV2...");
  const CrypticBenefitNetworkV2 = await ethers.getContractFactory("CrypticBenefitNetworkV2");
  const mainContract = await CrypticBenefitNetworkV2.deploy();
  await mainContract.waitForDeployment();
  const mainContractAddress = await mainContract.getAddress();
  console.log("✅ CrypticBenefitNetworkV2 deployed to:", mainContractAddress);
  
  // 7. Initialize system
  console.log("\n7️⃣ Initializing system...");
  await mainContract.initializeSystem(
    accessControlAddress,
    benefitVaultAddress,
    policyManagerAddress,
    assessmentEngineAddress,
    aggregatorAddress
  );
  console.log("✅ System initialized successfully");
  
  // 8. Create initial policies
  console.log("\n8️⃣ Creating initial policies...");
  
  // Create a basic health insurance policy
  const healthPolicyId = await mainContract.createPolicy(
    "Health Insurance",
    "Basic health insurance coverage for all members",
    ethers.parseEther("1000")
  );
  console.log("✅ Health Insurance policy created with ID:", healthPolicyId.toString());
  
  // Create a dental policy
  const dentalPolicyId = await mainContract.createPolicy(
    "Dental Coverage",
    "Dental care coverage for preventive and treatment services",
    ethers.parseEther("500")
  );
  console.log("✅ Dental Coverage policy created with ID:", dentalPolicyId.toString());
  
  // Create a vision policy
  const visionPolicyId = await mainContract.createPolicy(
    "Vision Care",
    "Vision care coverage including eye exams and glasses",
    ethers.parseEther("200")
  );
  console.log("✅ Vision Care policy created with ID:", visionPolicyId.toString());
  
  // 9. Update aggregator with initial stats
  console.log("\n9️⃣ Updating aggregator statistics...");
  await aggregator.updateStats(0, 0, 0); // Initial stats
  await aggregator.updateObfuscatedReserve(ethers.parseEther("10000")); // Initial reserve
  console.log("✅ Aggregator statistics updated");
  
  // 10. Display deployment summary
  console.log("\n🎉 Complete system deployment successful!");
  console.log("\n📋 Deployment Summary:");
  console.log("Network: Sepolia Testnet");
  console.log("Deployer:", deployer.address);
  console.log("\n📦 Deployed Contracts:");
  console.log("AccessControl:", accessControlAddress);
  console.log("PolicyManager:", policyManagerAddress);
  console.log("BenefitVault:", benefitVaultAddress);
  console.log("AssessmentEngine:", assessmentEngineAddress);
  console.log("Aggregator:", aggregatorAddress);
  console.log("CrypticBenefitNetworkV2:", mainContractAddress);
  
  console.log("\n🔗 Etherscan Links:");
  console.log("AccessControl: https://sepolia.etherscan.io/address/" + accessControlAddress);
  console.log("PolicyManager: https://sepolia.etherscan.io/address/" + policyManagerAddress);
  console.log("BenefitVault: https://sepolia.etherscan.io/address/" + benefitVaultAddress);
  console.log("AssessmentEngine: https://sepolia.etherscan.io/address/" + assessmentEngineAddress);
  console.log("Aggregator: https://sepolia.etherscan.io/address/" + aggregatorAddress);
  console.log("Main Contract: https://sepolia.etherscan.io/address/" + mainContractAddress);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Update frontend configuration with all contract addresses");
  console.log("2. Test contract interactions through the DApp");
  console.log("3. Add members and test benefit submissions");
  
  // Save deployment info to file
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      AccessControl: accessControlAddress,
      PolicyManager: policyManagerAddress,
      BenefitVault: benefitVaultAddress,
      AssessmentEngine: assessmentEngineAddress,
      Aggregator: aggregatorAddress,
      CrypticBenefitNetworkV2: mainContractAddress
    },
    policies: {
      healthInsurance: healthPolicyId.toString(),
      dentalCoverage: dentalPolicyId.toString(),
      visionCare: visionPolicyId.toString()
    }
  };
  
  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });



