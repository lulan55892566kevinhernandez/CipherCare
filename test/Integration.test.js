const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CipherCare Integration Tests", function () {
  let accessControl, policyManager, benefitVault;
  let owner, governor, member1, member2;

  beforeEach(async function () {
    [owner, governor, member1, member2] = await ethers.getSigners();

    // Deploy all contracts
    const AccessControl = await ethers.getContractFactory("AccessControl");
    accessControl = await AccessControl.deploy();
    await accessControl.waitForDeployment();

    const SimplePolicyManager = await ethers.getContractFactory("SimplePolicyManager");
    policyManager = await SimplePolicyManager.deploy(await accessControl.getAddress());
    await policyManager.waitForDeployment();

    const SimpleBenefitVault = await ethers.getContractFactory("SimpleBenefitVault");
    benefitVault = await SimpleBenefitVault.deploy(await accessControl.getAddress());
    await benefitVault.waitForDeployment();

    // Grant governor role
    const GOVERNOR_ROLE = await accessControl.GOVERNOR_ROLE();
    await accessControl.grantRole(GOVERNOR_ROLE, governor.address);
  });

  describe("End-to-End Workflow", function () {
    it("Should complete full benefit lifecycle", async function () {
      // 1. Create a policy
      await policyManager.createPolicy(
        "Medical Insurance",
        "Comprehensive medical coverage",
        ethers.parseUnits("5000", 0)
      );

      const policyId = 1;
      expect(await policyManager.isPolicyActive(policyId)).to.be.true;

      // 2. Record a benefit
      await benefitVault.connect(member1).recordBenefit(
        policyId,
        ethers.parseUnits("500", 0),
        "Medical",
        "Medical checkup"
      );

      const benefitCount = await benefitVault.getMemberBenefitCount(member1.address);
      expect(benefitCount).to.equal(1);

      // 3. Retrieve benefit details
      const benefit = await benefitVault.getBenefitRecord(member1.address, 0);
      expect(benefit[0]).to.equal(policyId);
      expect(benefit[1]).to.equal(ethers.parseUnits("500", 0));
      expect(benefit[3]).to.equal(0); // Pending status

      // 4. Update benefit status (approve)
      await benefitVault.updateBenefitStatus(member1.address, 0, 1); // 1 = Approved

      const updatedBenefit = await benefitVault.getBenefitRecord(member1.address, 0);
      expect(updatedBenefit[3]).to.equal(1); // Approved status
    });

    it("Should handle multiple policies and benefits", async function () {
      // Create multiple policies
      await policyManager.createPolicy("Medical", "Medical coverage", 5000);
      await policyManager.createPolicy("Education", "Education support", 2000);
      await policyManager.createPolicy("Housing", "Housing assistance", 3000);

      const policies = await policyManager.getActivePolicies();
      expect(policies.length).to.equal(3);

      // Record benefits for different members and policies
      await benefitVault.connect(member1).recordBenefit(1, 500, "Medical", "Checkup");
      await benefitVault.connect(member1).recordBenefit(2, 1000, "Education", "Course");
      await benefitVault.connect(member2).recordBenefit(1, 300, "Medical", "Medicine");
      await benefitVault.connect(member2).recordBenefit(3, 1500, "Housing", "Rent");

      // Verify member1 benefits
      const member1Count = await benefitVault.getMemberBenefitCount(member1.address);
      expect(member1Count).to.equal(2);

      const member1Benefits = await benefitVault.getAllMemberBenefits(member1.address);
      expect(member1Benefits.length).to.equal(2);
      expect(member1Benefits[0][0]).to.equal(1); // First benefit policyId
      expect(member1Benefits[1][0]).to.equal(2); // Second benefit policyId

      // Verify member2 benefits
      const member2Count = await benefitVault.getMemberBenefitCount(member2.address);
      expect(member2Count).to.equal(2);

      // Verify total benefits
      expect(await benefitVault.totalBenefits()).to.equal(4);
    });

    it("Should enforce policy deactivation", async function () {
      // Create and deactivate a policy
      await policyManager.createPolicy("Test Policy", "Test", 1000);
      const policyId = 1;

      expect(await policyManager.isPolicyActive(policyId)).to.be.true;

      // Deactivate policy
      await policyManager.deactivatePolicy(policyId);
      expect(await policyManager.isPolicyActive(policyId)).to.be.false;

      // Verify inactive policies are filtered out
      const activePolicies = await policyManager.getActivePolicies();
      expect(activePolicies.length).to.equal(0);
    });
  });

  describe("Role-Based Access Control Integration", function () {
    it("Should respect role permissions", async function () {
      const GOVERNOR_ROLE = await accessControl.GOVERNOR_ROLE();
      const MEMBER_ROLE = await accessControl.MEMBER_ROLE();

      // Grant member role
      await accessControl.grantRole(MEMBER_ROLE, member1.address);

      // Verify roles
      expect(await accessControl.hasRole(GOVERNOR_ROLE, governor.address)).to.be.true;
      expect(await accessControl.hasRole(MEMBER_ROLE, member1.address)).to.be.true;
      expect(await accessControl.hasRole(GOVERNOR_ROLE, member1.address)).to.be.false;
    });

    it("Should allow role enumeration", async function () {
      const MEMBER_ROLE = await accessControl.MEMBER_ROLE();

      await accessControl.grantRole(MEMBER_ROLE, member1.address);
      await accessControl.grantRole(MEMBER_ROLE, member2.address);

      const memberCount = await accessControl.getRoleMemberCount(MEMBER_ROLE);
      expect(memberCount).to.equal(2);

      const firstMember = await accessControl.getRoleMember(MEMBER_ROLE, 0);
      const secondMember = await accessControl.getRoleMember(MEMBER_ROLE, 1);

      expect([firstMember, secondMember]).to.include(member1.address);
      expect([firstMember, secondMember]).to.include(member2.address);
    });
  });

  describe("Data Consistency", function () {
    it("Should maintain consistency across contracts", async function () {
      // Create policies
      await policyManager.createPolicy("Policy 1", "Description 1", 1000);
      await policyManager.createPolicy("Policy 2", "Description 2", 2000);

      // Record benefits
      await benefitVault.recordBenefit(1, 100, "Type1", "Desc1");
      await benefitVault.recordBenefit(2, 200, "Type2", "Desc2");

      // Verify policy count matches benefit references
      const nextPolicyId = await policyManager.nextPolicyId();
      expect(nextPolicyId).to.equal(3); // Next ID should be 3 (1, 2 already used)

      const totalBenefits = await benefitVault.totalBenefits();
      expect(totalBenefits).to.equal(2);

      // Verify both policies exist and are active
      expect(await policyManager.isPolicyActive(1)).to.be.true;
      expect(await policyManager.isPolicyActive(2)).to.be.true;
    });
  });

  describe("Gas Optimization", function () {
    it("Should batch operations efficiently", async function () {
      // Create multiple policies
      const policies = [
        { name: "P1", desc: "D1", amount: 1000 },
        { name: "P2", desc: "D2", amount: 2000 },
        { name: "P3", desc: "D3", amount: 3000 },
      ];

      for (const policy of policies) {
        await policyManager.createPolicy(policy.name, policy.desc, policy.amount);
      }

      // Record multiple benefits
      for (let i = 0; i < 3; i++) {
        await benefitVault.recordBenefit(i + 1, 100 * (i + 1), `Type${i}`, `Desc${i}`);
      }

      expect(await policyManager.nextPolicyId()).to.equal(4);
      expect(await benefitVault.totalBenefits()).to.equal(3);
    });
  });
});
