const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleBenefitVault Contract", function () {
  let benefitVault, accessControl;
  let owner, member1, member2;

  beforeEach(async function () {
    [owner, member1, member2] = await ethers.getSigners();

    // Deploy AccessControl
    const AccessControl = await ethers.getContractFactory("AccessControl");
    accessControl = await AccessControl.deploy();
    await accessControl.waitForDeployment();

    // Deploy SimpleBenefitVault
    const SimpleBenefitVault = await ethers.getContractFactory("SimpleBenefitVault");
    benefitVault = await SimpleBenefitVault.deploy(await accessControl.getAddress());
    await benefitVault.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should initialize with zero total benefits", async function () {
      expect(await benefitVault.totalBenefits()).to.equal(0);
    });

    it("Should link to AccessControl contract", async function () {
      expect(await benefitVault.accessControl()).to.equal(await accessControl.getAddress());
    });
  });

  describe("Recording Benefits", function () {
    it("Should record a benefit for a member", async function () {
      const tx = await benefitVault.recordBenefit(
        1, // policyId
        ethers.parseUnits("100", 0), // amount (100 cents = $1)
        "Medical",
        "Medical checkup"
      );

      await expect(tx)
        .to.emit(benefitVault, "BenefitRecorded")
        .withArgs(owner.address, 1, ethers.parseUnits("100", 0));

      expect(await benefitVault.totalBenefits()).to.equal(1);
    });

    it("Should store benefit details correctly", async function () {
      await benefitVault.recordBenefit(
        1,
        ethers.parseUnits("500", 0),
        "Education",
        "Course enrollment"
      );

      const count = await benefitVault.getMemberBenefitCount(owner.address);
      expect(count).to.equal(1);

      const benefit = await benefitVault.getBenefitRecord(owner.address, 0);
      expect(benefit[0]).to.equal(1); // policyId
      expect(benefit[1]).to.equal(ethers.parseUnits("500", 0)); // amount
      expect(benefit[3]).to.equal(0); // status (Pending)
      expect(benefit[4]).to.equal("Education"); // benefitType
      expect(benefit[5]).to.equal("Course enrollment"); // description
    });

    it("Should track multiple benefits for same member", async function () {
      await benefitVault.recordBenefit(1, 100, "Medical", "Checkup");
      await benefitVault.recordBenefit(2, 200, "Education", "Course");
      await benefitVault.recordBenefit(1, 150, "Medical", "Medicine");

      const count = await benefitVault.getMemberBenefitCount(owner.address);
      expect(count).to.equal(3);
      expect(await benefitVault.totalBenefits()).to.equal(3);
    });

    it("Should track benefits for different members", async function () {
      await benefitVault.recordBenefit(1, 100, "Medical", "Member1");
      await benefitVault.connect(member1).recordBenefit(2, 200, "Education", "Member2");

      expect(await benefitVault.getMemberBenefitCount(owner.address)).to.equal(1);
      expect(await benefitVault.getMemberBenefitCount(member1.address)).to.equal(1);
      expect(await benefitVault.totalBenefits()).to.equal(2);
    });

    it("Should reject zero amount", async function () {
      await expect(
        benefitVault.recordBenefit(1, 0, "Medical", "Test")
      ).to.be.revertedWith("Amount must be positive");
    });

    it("Should reject empty benefit type", async function () {
      await expect(
        benefitVault.recordBenefit(1, 100, "", "Test")
      ).to.be.revertedWith("Benefit type required");
    });
  });

  describe("Retrieving Benefits", function () {
    beforeEach(async function () {
      await benefitVault.recordBenefit(1, 100, "Medical", "Benefit 1");
      await benefitVault.recordBenefit(2, 200, "Education", "Benefit 2");
      await benefitVault.recordBenefit(1, 150, "Medical", "Benefit 3");
    });

    it("Should get all benefits for a member", async function () {
      const benefits = await benefitVault.getAllMemberBenefits(owner.address);
      expect(benefits.length).to.equal(3);
      
      expect(benefits[0][0]).to.equal(1); // First benefit policyId
      expect(benefits[1][1]).to.equal(200); // Second benefit amount
      expect(benefits[2][4]).to.equal("Medical"); // Third benefit type
    });

    it("Should return empty array for member with no benefits", async function () {
      const benefits = await benefitVault.getAllMemberBenefits(member2.address);
      expect(benefits.length).to.equal(0);
    });

    it("Should get specific benefit by index", async function () {
      const benefit = await benefitVault.getBenefitRecord(owner.address, 1);
      expect(benefit[0]).to.equal(2); // policyId
      expect(benefit[1]).to.equal(200); // amount
      expect(benefit[4]).to.equal("Education"); // benefitType
    });
  });

  describe("Benefit Status Updates", function () {
    beforeEach(async function () {
      await benefitVault.recordBenefit(1, 100, "Medical", "Test");
    });

    it("Should update benefit status", async function () {
      await benefitVault.updateBenefitStatus(owner.address, 0, 1); // 1 = Approved

      const benefit = await benefitVault.getBenefitRecord(owner.address, 0);
      expect(benefit[3]).to.equal(1); // status should be Approved
    });

    it("Should emit BenefitStatusUpdated event", async function () {
      await expect(benefitVault.updateBenefitStatus(owner.address, 0, 2)) // 2 = Rejected
        .to.emit(benefitVault, "BenefitStatusUpdated")
        .withArgs(owner.address, 0, 2);
    });

    it("Should reject invalid status values", async function () {
      await expect(
        benefitVault.updateBenefitStatus(owner.address, 0, 99)
      ).to.be.revertedWith("Invalid status");
    });

    it("Should reject invalid benefit index", async function () {
      await expect(
        benefitVault.updateBenefitStatus(owner.address, 999, 1)
      ).to.be.revertedWith("Invalid benefit index");
    });
  });

  describe("Statistics", function () {
    it("Should track total benefits correctly", async function () {
      expect(await benefitVault.totalBenefits()).to.equal(0);

      await benefitVault.recordBenefit(1, 100, "Medical", "Benefit 1");
      expect(await benefitVault.totalBenefits()).to.equal(1);

      await benefitVault.connect(member1).recordBenefit(2, 200, "Education", "Benefit 2");
      expect(await benefitVault.totalBenefits()).to.equal(2);
    });
  });
});
