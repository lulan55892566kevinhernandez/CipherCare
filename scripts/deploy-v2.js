const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting deployment of CrypticBenefit-Network V2...");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deployer address:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    
    // Deploy main contract
    console.log("\n📦 Deploying simplified CrypticBenefitNetworkV2 contract...");
    const CrypticBenefitNetworkV2 = await ethers.getContractFactory("CrypticBenefitNetworkV2");
    const mainContract = await CrypticBenefitNetworkV2.deploy();
    await mainContract.waitForDeployment();

    const mainAddress = await mainContract.getAddress();
    console.log("✅ Main contract address:", mainAddress);

    console.log("\n🔍 Fetching initial encrypted totals...");
    const [totalPoliciesCipher, totalBenefitRecordsCipher] = await mainContract.getEncryptedTotals();
    console.log("  - Encrypted policy count:", totalPoliciesCipher);
    console.log("  - Encrypted benefit record count:", totalBenefitRecordsCipher);

    const [policyIds] = await mainContract.listPolicies();
    console.log("\n📊 Current policies in the system:", policyIds.length);

    const creatorPolicies = await mainContract.getPoliciesByCreator(deployer.address);
    console.log("  - Policies authored by deployer:", creatorPolicies.length);

    const deploymentInfo = {
        network: "sepolia",
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        mainContract: mainAddress,
        encryptedTotals: {
            policies: totalPoliciesCipher,
            benefitRecords: totalBenefitRecordsCipher
        }
    };

    console.log("\n📄 Deployment info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 Deployment completed！");
    console.log("📋 Deployment summary:");
    console.log(`  - Main contract: ${mainAddress}`);
    console.log(`  - Initial policies: ${policyIds.length}`);
    console.log(`  - Deployer-authored policies: ${creatorPolicies.length}`);

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
