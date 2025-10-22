const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimplePolicyManager Contract", function () {
  let policyManager, accessControl;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy AccessControl first
    const AccessControl = await ethers.getContractFactory("AccessControl");
    accessControl = await AccessControl.deploy();
    await accessControl.waitForDeployment();

    // Deploy SimplePolicyManager
    const SimplePolicyManager = await ethers.getContractFactory("SimplePolicyManager");
    policyManager = await SimplePolicyManager.deploy(await accessControl.getAddress());
    await policyManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct initial state", async function () {
      expect(await policyManager.nextPolicyId()).to.equal(1);
    });

    it("Should link to AccessControl contract", async function () {
      expect(await policyManager.accessControl()).to.equal(await accessControl.getAddress());
    });
  });

  describe("Policy Creation", function () {
    it("Should create a new policy", async function () {
      const tx = await policyManager.createPolicy(
        "Medical Insurance",
        "Comprehensive medical coverage",
        ethers.parseUnits("5000", 0) // 5000 cents = $50
      );

      await expect(tx)
        .to.emit(policyManager, "PolicyCreated")
        .withArgs(1, "Medical Insurance", ethers.parseUnits("5000", 0));

      expect(await policyManager.nextPolicyId()).to.equal(2);
    });

    it("Should store policy details correctly", async function () {
      await policyManager.createPolicy(
        "Education Allowance",
        "Educational support",
        ethers.parseUnits("2000", 0)
      );

      const policy = await policyManager.getPolicyDetails(1);
      expect(policy[0]).to.equal("Education Allowance"); // name
      expect(policy[1]).to.equal("Educational support"); // description
      expect(policy[2]).to.equal(true); // isActive
      expect(policy[3]).to.equal(ethers.parseUnits("2000", 0)); // maxAmount
    });

    it("Should reject empty policy name", async function () {
      await expect(
        policyManager.createPolicy("", "Description", 1000)
      ).to.be.revertedWith("Policy name required");
    });

    it("Should reject zero max amount", async function () {
      await expect(
        policyManager.createPolicy("Test Policy", "Description", 0)
      ).to.be.revertedWith("Max amount must be positive");
    });
  });

  describe("Policy Queries", function () {
    beforeEach(async function () {
      await policyManager.createPolicy("Policy 1", "Description 1", 1000);
      await policyManager.createPolicy("Policy 2", "Description 2", 2000);
      await policyManager.createPolicy("Policy 3", "Description 3", 3000);
    });

    it("Should return active policies", async function () {
      const policies = await policyManager.getActivePolicies();
      expect(policies.length).to.equal(3);
      expect(policies[0][0]).to.equal("Policy 1"); // First policy name
    });

    it("Should return correct policy count", async function () {
      expect(await policyManager.nextPolicyId()).to.equal(4);
    });

    it("Should check if policy is active", async function () {
      expect(await policyManager.isPolicyActive(1)).to.be.true;
      expect(await policyManager.isPolicyActive(999)).to.be.false;
    });
  });

  describe("Policy Updates", function () {
    beforeEach(async function () {
      await policyManager.createPolicy("Test Policy", "Test Description", 1000);
    });

    it("Should allow owner to deactivate policy", async function () {
      await policyManager.deactivatePolicy(1);
      expect(await policyManager.isPolicyActive(1)).to.be.false;
    });

    it("Should emit PolicyDeactivated event", async function () {
      await expect(policyManager.deactivatePolicy(1))
        .to.emit(policyManager, "PolicyDeactivated")
        .withArgs(1);
    });

    it("Should prevent deactivating non-existent policy", async function () {
      await expect(policyManager.deactivatePolicy(999))
        .to.be.revertedWith("Policy does not exist");
    });

    it("Should prevent deactivating already inactive policy", async function () {
      await policyManager.deactivatePolicy(1);
      await expect(policyManager.deactivatePolicy(1))
        .to.be.revertedWith("Policy already inactive");
    });
  });

  describe("Multiple Policies", function () {
    it("Should handle creating multiple policies", async function () {
      const policies = [
        { name: "Medical", desc: "Medical coverage", amount: 5000 },
        { name: "Education", desc: "Education support", amount: 2000 },
        { name: "Housing", desc: "Housing assistance", amount: 3000 },
      ];

      for (const policy of policies) {
        await policyManager.createPolicy(policy.name, policy.desc, policy.amount);
      }

      expect(await policyManager.nextPolicyId()).to.equal(4);
      const activePolicies = await policyManager.getActivePolicies();
      expect(activePolicies.length).to.equal(3);
    });
  });
});
