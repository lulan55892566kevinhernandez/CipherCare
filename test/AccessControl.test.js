const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessControl Contract", function () {
  let accessControl;
  let owner, governor, councilMember, assessor, auditor, member, nonMember;

  beforeEach(async function () {
    [owner, governor, councilMember, assessor, auditor, member, nonMember] = await ethers.getSigners();

    const AccessControl = await ethers.getContractFactory("AccessControl");
    accessControl = await AccessControl.deploy();
    await accessControl.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the deployer as DEFAULT_ADMIN_ROLE", async function () {
      const DEFAULT_ADMIN_ROLE = await accessControl.DEFAULT_ADMIN_ROLE();
      expect(await accessControl.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should initialize role constants correctly", async function () {
      expect(await accessControl.GOVERNOR_ROLE()).to.not.equal(ethers.ZeroHash);
      expect(await accessControl.COUNCIL_ROLE()).to.not.equal(ethers.ZeroHash);
      expect(await accessControl.ASSESSOR_ROLE()).to.not.equal(ethers.ZeroHash);
      expect(await accessControl.AUDITOR_ROLE()).to.not.equal(ethers.ZeroHash);
      expect(await accessControl.MEMBER_ROLE()).to.not.equal(ethers.ZeroHash);
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to grant GOVERNOR_ROLE", async function () {
      const GOVERNOR_ROLE = await accessControl.GOVERNOR_ROLE();
      await accessControl.grantRole(GOVERNOR_ROLE, governor.address);
      expect(await accessControl.hasRole(GOVERNOR_ROLE, governor.address)).to.be.true;
    });

    it("Should allow admin to grant COUNCIL_ROLE", async function () {
      const COUNCIL_ROLE = await accessControl.COUNCIL_ROLE();
      await accessControl.grantRole(COUNCIL_ROLE, councilMember.address);
      expect(await accessControl.hasRole(COUNCIL_ROLE, councilMember.address)).to.be.true;
    });

    it("Should allow admin to grant ASSESSOR_ROLE", async function () {
      const ASSESSOR_ROLE = await accessControl.ASSESSOR_ROLE();
      await accessControl.grantRole(ASSESSOR_ROLE, assessor.address);
      expect(await accessControl.hasRole(ASSESSOR_ROLE, assessor.address)).to.be.true;
    });

    it("Should allow admin to grant AUDITOR_ROLE", async function () {
      const AUDITOR_ROLE = await accessControl.AUDITOR_ROLE();
      await accessControl.grantRole(AUDITOR_ROLE, auditor.address);
      expect(await accessControl.hasRole(AUDITOR_ROLE, auditor.address)).to.be.true;
    });

    it("Should allow admin to grant MEMBER_ROLE", async function () {
      const MEMBER_ROLE = await accessControl.MEMBER_ROLE();
      await accessControl.grantRole(MEMBER_ROLE, member.address);
      expect(await accessControl.hasRole(MEMBER_ROLE, member.address)).to.be.true;
    });

    it("Should prevent non-admin from granting roles", async function () {
      const GOVERNOR_ROLE = await accessControl.GOVERNOR_ROLE();
      await expect(
        accessControl.connect(nonMember).grantRole(GOVERNOR_ROLE, governor.address)
      ).to.be.reverted;
    });

    it("Should allow admin to revoke roles", async function () {
      const MEMBER_ROLE = await accessControl.MEMBER_ROLE();
      await accessControl.grantRole(MEMBER_ROLE, member.address);
      expect(await accessControl.hasRole(MEMBER_ROLE, member.address)).to.be.true;

      await accessControl.revokeRole(MEMBER_ROLE, member.address);
      expect(await accessControl.hasRole(MEMBER_ROLE, member.address)).to.be.false;
    });
  });

  describe("Role Enumeration", function () {
    it("Should return correct role member count", async function () {
      const MEMBER_ROLE = await accessControl.MEMBER_ROLE();
      await accessControl.grantRole(MEMBER_ROLE, member.address);
      
      const count = await accessControl.getRoleMemberCount(MEMBER_ROLE);
      expect(count).to.equal(1);
    });

    it("Should return correct role member by index", async function () {
      const MEMBER_ROLE = await accessControl.MEMBER_ROLE();
      await accessControl.grantRole(MEMBER_ROLE, member.address);
      
      const memberAddress = await accessControl.getRoleMember(MEMBER_ROLE, 0);
      expect(memberAddress).to.equal(member.address);
    });
  });

  describe("Events", function () {
    it("Should emit RoleGranted event", async function () {
      const MEMBER_ROLE = await accessControl.MEMBER_ROLE();
      await expect(accessControl.grantRole(MEMBER_ROLE, member.address))
        .to.emit(accessControl, "RoleGranted")
        .withArgs(MEMBER_ROLE, member.address, owner.address);
    });

    it("Should emit RoleRevoked event", async function () {
      const MEMBER_ROLE = await accessControl.MEMBER_ROLE();
      await accessControl.grantRole(MEMBER_ROLE, member.address);
      
      await expect(accessControl.revokeRole(MEMBER_ROLE, member.address))
        .to.emit(accessControl, "RoleRevoked")
        .withArgs(MEMBER_ROLE, member.address, owner.address);
    });
  });
});
