// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, euint8, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title BenefitVault
 * @notice Privacy-preserving benefit storage with FHE encryption
 * @dev Following Zama FHE best practices: fromExternal, allowThis, allow
 * @dev Updated for fhEVM 0.9.1 - inherits ZamaEthereumConfig for automatic coprocessor setup
 */
contract BenefitVault is ZamaEthereumConfig {

    address public admin;

    struct EncryptedBenefitRecord {
        euint64 encryptedAmount;
        euint64 encryptedPolicyId;
        euint8 encryptedStatus;
        address member;
        bytes32 benefitId;
        uint256 createdAt;
    }
    
    mapping(address => EncryptedBenefitRecord[]) public encryptedMemberBenefits;
    mapping(address => uint256) public memberBenefitCount;
    mapping(bytes32 => bool) public benefitExists;
    uint256 public totalBenefits;

    event BenefitSubmitted(bytes32 indexed benefitId, address indexed member, bytes32 indexed programKey, uint256 timestamp);
    event BenefitUpdated(bytes32 indexed benefitId, address indexed member, bytes32 indexed programKey, uint256 timestamp);
    event BenefitFrozen(bytes32 indexed benefitId, bool frozen, uint256 timestamp);
    event BenefitFlagged(bytes32 indexed benefitId, bool flagged, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }
    
    // ============ Core Functions ============
    
    function storeBenefitRecord(
        address member,
        externalEuint64 encAmount,
        bytes calldata inputProof,
        uint64 policyId
    ) external onlyAdmin {
        require(member != address(0), "Invalid member address");

        bytes32 benefitId = keccak256(abi.encodePacked(member, policyId, block.timestamp, block.number));
        require(!benefitExists[benefitId], "Benefit record already exists");

        euint64 encryptedAmount = FHE.fromExternal(encAmount, inputProof);
        euint64 encryptedPolicyId = FHE.asEuint64(uint64(policyId));
        euint8 encryptedStatus = FHE.asEuint8(uint8(0));

        FHE.allowThis(encryptedAmount);
        FHE.allow(encryptedAmount, member);
        FHE.allowThis(encryptedPolicyId);
        FHE.allowThis(encryptedStatus);

        EncryptedBenefitRecord memory newRecord = EncryptedBenefitRecord({
            encryptedAmount: encryptedAmount,
            encryptedPolicyId: encryptedPolicyId,
            encryptedStatus: encryptedStatus,
            member: member,
            benefitId: benefitId,
            createdAt: block.timestamp
        });

        encryptedMemberBenefits[member].push(newRecord);
        memberBenefitCount[member]++;
        benefitExists[benefitId] = true;
        totalBenefits++;

        emit BenefitSubmitted(benefitId, member, keccak256(abi.encodePacked(policyId)), block.timestamp);
    }
    
    function updateBenefitRecord(
        address member,
        uint256 index,
        externalEuint64 encAmount,
        bytes calldata inputProof
    ) external onlyAdmin {
        require(member != address(0), "Invalid member address");
        require(index < encryptedMemberBenefits[member].length, "Benefit record not found");

        euint64 newEncryptedAmount = FHE.fromExternal(encAmount, inputProof);
        FHE.allowThis(newEncryptedAmount);
        FHE.allow(newEncryptedAmount, member);

        encryptedMemberBenefits[member][index].encryptedAmount = newEncryptedAmount;

        emit BenefitUpdated(
            encryptedMemberBenefits[member][index].benefitId,
            member,
            keccak256(abi.encodePacked(member, index)),
            block.timestamp
        );
    }
    
    function freezeBenefitRecord(address member, uint256 index) external onlyAdmin {
        require(member != address(0), "Invalid member address");
        require(index < encryptedMemberBenefits[member].length, "Benefit record not found");

        euint8 frozenStatus = FHE.asEuint8(uint8(1));
        FHE.allowThis(frozenStatus);
        encryptedMemberBenefits[member][index].encryptedStatus = frozenStatus;

        emit BenefitFrozen(
            encryptedMemberBenefits[member][index].benefitId,
            true,
            block.timestamp
        );
    }

    function flagBenefitRecord(address member, uint256 index) external onlyAdmin {
        require(member != address(0), "Invalid member address");
        require(index < encryptedMemberBenefits[member].length, "Benefit record not found");

        euint8 flaggedStatus = FHE.asEuint8(uint8(2));
        FHE.allowThis(flaggedStatus);
        encryptedMemberBenefits[member][index].encryptedStatus = flaggedStatus;

        emit BenefitFlagged(
            encryptedMemberBenefits[member][index].benefitId,
            true,
            block.timestamp
        );
    }
    
    function addToEncryptedAmount(address member, uint256 index, uint64 amount) external onlyAdmin {
        require(member != address(0), "Invalid member address");
        require(index < encryptedMemberBenefits[member].length, "Benefit record not found");

        euint64 additionalAmount = FHE.asEuint64(uint64(amount));
        euint64 currentAmount = encryptedMemberBenefits[member][index].encryptedAmount;
        euint64 newAmount = FHE.add(currentAmount, additionalAmount);

        FHE.allowThis(newAmount);
        FHE.allow(newAmount, member);

        encryptedMemberBenefits[member][index].encryptedAmount = newAmount;
    }

    function getEncryptedAmountHandle(address member, uint256 index) external view returns (euint64) {
        require(index < encryptedMemberBenefits[member].length, "Benefit record not found");
        return encryptedMemberBenefits[member][index].encryptedAmount;
    }
    
    // ============ View Functions ============
    
    function getMemberBenefitCount(address member) external view returns (uint256) {
        return memberBenefitCount[member];
    }
    
    function getBenefitRecord(address member, uint256 index) external view returns (
        euint64 encryptedAmount,
        euint64 encryptedPolicyId,
        euint8 encryptedStatus,
        bytes32 benefitId,
        uint256 createdAt
    ) {
        require(index < encryptedMemberBenefits[member].length, "Benefit record not found");

        EncryptedBenefitRecord memory record = encryptedMemberBenefits[member][index];
        return (
            record.encryptedAmount,
            record.encryptedPolicyId,
            record.encryptedStatus,
            record.benefitId,
            record.createdAt
        );
    }

    function getMemberBenefits(address member) external view returns (bytes32[] memory benefitIds) {
        uint256 count = memberBenefitCount[member];
        benefitIds = new bytes32[](count);

        for (uint256 i = 0; i < count; i++) {
            benefitIds[i] = encryptedMemberBenefits[member][i].benefitId;
        }

        return benefitIds;
    }
    
    function getTotalBenefits() external view returns (uint256) {
        return totalBenefits;
    }
    
    function getBenefitId(address member, uint256 index) external view returns (bytes32) {
        require(index < encryptedMemberBenefits[member].length, "Benefit record not found");
        return encryptedMemberBenefits[member][index].benefitId;
    }
}