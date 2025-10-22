const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = process.env.CBN_CONTRACT_ADDRESS || "";

async function main() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Missing CBN_CONTRACT_ADDRESS env var");
  }

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  const contract = await ethers.getContractAt("CrypticBenefitNetworkV2", CONTRACT_ADDRESS, signer);

  console.log("📄 Creating plaintext policy...");
  const createTx = await contract.createPolicy("Smoke Test Policy", "CLI smoke test", 1000);
  const receipt = await createTx.wait();
  const event = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch (err) {
        return null;
      }
    })
    .find((parsed) => parsed?.name === "PolicyCreated");

  const policyId = event?.args?.policyId?.toString();
  console.log("✅ Policy created with ID:", policyId);

  console.log("📥 Recording plaintext benefit...");
  const benefitTx = await contract.recordPlainBenefit(policyId, 250);
  await benefitTx.wait();
  console.log("✅ Benefit recorded for policy", policyId);

  const [ids, names] = await contract.listPolicies();
  console.log("📊 Policies on-chain:");
  ids.forEach((id, index) => {
    console.log(`  - ${id.toString()}: ${names[index]}`);
  });

  const count = await contract.getPolicyBenefitCount(policyId);
  console.log(`📦 Policy ${policyId} benefit count:`, count.toString());
}

main().catch((error) => {
  console.error("❌ Smoke test failed:", error);
  process.exitCode = 1;
});
