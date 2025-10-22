// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAccessControl} from "../interfaces/IAccessControl.sol";

/**
 * @title SimpleBenefitVault
 * @notice Simplified benefit vault for testing - stores benefit records without FHE
 */
contract SimpleBenefitVault {
    IAccessControl public accessControl;

    struct BenefitRecord {
        uint256 policyId;
        uint256 amount;
        uint256 timestamp;
        uint8 status; // 0: pending, 1: approved, 2: rejected
        string benefitType;
        string description;
    }

    // member address => benefit records
    mapping(address => BenefitRecord[]) public memberBenefits;
    
    // Total benefit count
    uint256 public totalBenefits;

    event BenefitRecorded(
        address indexed member,
        uint256 indexed policyId,
        uint256 amount,
        uint256 timestamp
    );

    event BenefitStatusUpdated(
        address indexed member,
        uint256 indexed recordIndex,
        uint8 status
    );

    constructor(address _accessControl) {
        require(_accessControl != address(0), "Invalid AccessControl address");
        accessControl = IAccessControl(_accessControl);
    }

    modifier onlyMember() {
        // Allow all addresses to submit benefits
        _;
    }

    modifier onlyAuthorized() {
        require(
            accessControl.hasRole(accessControl.GOVERNOR_ROLE(), msg.sender) ||
            accessControl.hasRole(accessControl.COUNCIL_ROLE(), msg.sender) ||
            accessControl.hasRole(accessControl.ASSESSOR_ROLE(), msg.sender),
            "Not authorized"
        );
        _;
    }

    /**
     * @notice Record a new benefit for a member
     */
    function recordBenefit(
        uint256 policyId,
        uint256 amount,
        string memory benefitType,
        string memory description
    ) external onlyMember {
        BenefitRecord memory newBenefit = BenefitRecord({
            policyId: policyId,
            amount: amount,
            timestamp: block.timestamp,
            status: 0, // pending
            benefitType: benefitType,
            description: description
        });

        memberBenefits[msg.sender].push(newBenefit);
        totalBenefits++;

        emit BenefitRecorded(msg.sender, policyId, amount, block.timestamp);
    }

    /**
     * @notice Update benefit status (for assessors)
     */
    function updateBenefitStatus(
        address member,
        uint256 recordIndex,
        uint8 status
    ) external onlyAuthorized {
        require(recordIndex < memberBenefits[member].length, "Invalid record index");
        require(status <= 2, "Invalid status");

        memberBenefits[member][recordIndex].status = status;

        emit BenefitStatusUpdated(member, recordIndex, status);
    }

    /**
     * @notice Get member's benefit count
     */
    function getMemberBenefitCount(address member) external view returns (uint256) {
        return memberBenefits[member].length;
    }

    /**
     * @notice Get a specific benefit record
     */
    function getBenefitRecord(address member, uint256 index) 
        external 
        view 
        returns (
            uint256 policyId,
            uint256 amount,
            uint256 timestamp,
            uint8 status,
            string memory benefitType,
            string memory description
        ) 
    {
        require(index < memberBenefits[member].length, "Invalid index");
        BenefitRecord storage record = memberBenefits[member][index];
        return (
            record.policyId,
            record.amount,
            record.timestamp,
            record.status,
            record.benefitType,
            record.description
        );
    }

    /**
     * @notice Get all benefits for a member
     */
    function getAllMemberBenefits(address member) 
        external 
        view 
        returns (BenefitRecord[] memory) 
    {
        return memberBenefits[member];
    }
}

