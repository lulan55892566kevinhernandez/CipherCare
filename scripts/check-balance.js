const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking deployer account balance...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Account Information:");
  console.log("Address:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log("Balance:", balanceInEth, "ETH");
  console.log("Balance (Wei):", balance.toString());
  
  // Check if balance is sufficient for deployment
  const minRequired = ethers.parseEther("0.01"); // 0.01 ETH minimum
  const isSufficient = balance >= minRequired;
  
  console.log("\n💰 Deployment Check:");
  console.log("Minimum required:", ethers.formatEther(minRequired), "ETH");
  console.log("Status:", isSufficient ? "✅ Sufficient" : "❌ Insufficient");
  
  if (!isSufficient) {
    console.log("\n⚠️  Warning: Insufficient balance for deployment!");
    console.log("Please add more ETH to your account.");
    console.log("Sepolia Faucet: https://sepoliafaucet.com/");
  } else {
    console.log("\n✅ Ready for deployment!");
  }
  
  // Estimate gas for deployment
  console.log("\n⛽ Gas Estimation:");
  try {
    // This is a rough estimate - actual deployment will be different
    const estimatedGas = BigInt("2000000"); // 2M gas estimate
    const gasPrice = await ethers.provider.getGasPrice();
    const estimatedCost = estimatedGas * gasPrice;
    
    console.log("Estimated gas limit:", estimatedGas.toString());
    console.log("Current gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
    console.log("Estimated deployment cost:", ethers.formatEther(estimatedCost), "ETH");
    
    if (balance >= estimatedCost) {
      console.log("✅ Sufficient balance for estimated deployment cost");
    } else {
      console.log("❌ Insufficient balance for estimated deployment cost");
    }
  } catch (error) {
    console.log("Could not estimate gas:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
