// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title CrypticBenefitNetworkV2
/// @notice Simplified FHE-enabled welfare policy manager where anyone can author policies
/// @dev Focuses on base functionality while preserving encrypted accounting.
contract CrypticBenefitNetworkV2 {
    /// -----------------------------------------------------------------------
    /// Errors
    /// -----------------------------------------------------------------------

    error PolicyNotFound();
    error InvalidPolicyMetadata();
    error PolicyInactive();
    error NotPolicyCreator();
    error InvalidBenefitIndex();

    /// -----------------------------------------------------------------------
    /// Structs
    /// -----------------------------------------------------------------------

    struct Policy {
        string name;
        string description;
        address creator;
        uint256 createdAt;
        bool isActive;
        euint64 encryptedMaxAmount;
        euint64 encryptedTotalClaims;
    }

    struct EncryptedBenefit {
        bytes32 recordId;
        address member;
        uint256 createdAt;
        euint64 encryptedAmount;
    }

    /// -----------------------------------------------------------------------
    /// Storage
    /// -----------------------------------------------------------------------

    uint256 public nextPolicyId;
    mapping(uint256 => Policy) private policies;
    mapping(uint256 => EncryptedBenefit[]) private policyBenefits;
    mapping(address => uint256[]) private policiesByCreator;

    euint64 public encryptedTotalPolicies;
    euint64 public encryptedTotalBenefitRecords;

    /// -----------------------------------------------------------------------
    /// Events
    /// -----------------------------------------------------------------------

    event PolicyCreated(uint256 indexed policyId, address indexed creator, string name);
    event PolicyMetadataUpdated(uint256 indexed policyId, string name, string description);
    event PolicyStatusUpdated(uint256 indexed policyId, bool isActive);
    event EncryptedBenefitRecorded(bytes32 indexed recordId, uint256 indexed policyId, address indexed member);

    /// -----------------------------------------------------------------------
    /// Constructor
    /// -----------------------------------------------------------------------

    constructor() {
        FHE.setCoprocessor(ZamaConfig.getSepoliaConfig());

        nextPolicyId = 1;

        encryptedTotalPolicies = FHE.asEuint64(0);
        FHE.allowThis(encryptedTotalPolicies);

        encryptedTotalBenefitRecords = FHE.asEuint64(0);
        FHE.allowThis(encryptedTotalBenefitRecords);
    }

    /// -----------------------------------------------------------------------
    /// Policy Authoring
    /// -----------------------------------------------------------------------

    function createPolicy(
        string calldata name,
        string calldata description,
        uint64 maxAmount
    ) external returns (uint256) {
        if (bytes(name).length == 0) revert InvalidPolicyMetadata();

        euint64 encryptedMaxAmount = FHE.asEuint64(maxAmount);
        FHE.allowThis(encryptedMaxAmount);

        return _createPolicy(name, description, encryptedMaxAmount);
    }

    function createPolicyEncrypted(
        string calldata name,
        string calldata description,
        externalEuint64 encryptedMaxAmount,
        bytes calldata inputProof
    ) external returns (uint256) {
        if (bytes(name).length == 0) revert InvalidPolicyMetadata();

        euint64 imported = FHE.fromExternal(encryptedMaxAmount, inputProof);
        FHE.allowThis(imported);

        return _createPolicy(name, description, imported);
    }

    function updatePolicyMetadata(
        uint256 policyId,
        string calldata name,
        string calldata description
    ) external {
        Policy storage policy = _getPolicy(policyId);
        if (policy.creator != msg.sender) revert NotPolicyCreator();
        if (bytes(name).length == 0) revert InvalidPolicyMetadata();

        policy.name = name;
        policy.description = description;

        emit PolicyMetadataUpdated(policyId, name, description);
    }

    function setPolicyStatus(uint256 policyId, bool isActive) external {
        Policy storage policy = _getPolicy(policyId);
        if (policy.creator != msg.sender) revert NotPolicyCreator();
        if (policy.isActive == isActive) {
            return;
        }

        policy.isActive = isActive;
        emit PolicyStatusUpdated(policyId, isActive);
    }

    /// -----------------------------------------------------------------------
    /// Benefit Recording
    /// -----------------------------------------------------------------------

    function recordPlainBenefit(uint256 policyId, uint64 amount) external returns (bytes32) {
        euint64 encryptedAmount = FHE.asEuint64(amount);
        FHE.allowThis(encryptedAmount);
        return _recordBenefit(policyId, encryptedAmount);
    }

    function recordEncryptedBenefit(
        uint256 policyId,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bytes32) {
        euint64 imported = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowThis(imported);
        return _recordBenefit(policyId, imported);
    }

    /// -----------------------------------------------------------------------
    /// Views
    /// -----------------------------------------------------------------------

    function getPolicyDetails(uint256 policyId)
        external
        view
        returns (
            string memory name,
            string memory description,
            bool isActive,
            address creator,
            uint256 createdAt
        )
    {
        Policy storage policy = _getPolicy(policyId);
        return (policy.name, policy.description, policy.isActive, policy.creator, policy.createdAt);
    }

    function getEncryptedPolicyData(uint256 policyId)
        external
        view
        returns (bytes memory maxAmountCipher, bytes memory totalClaimsCipher)
    {
        Policy storage policy = _getPolicy(policyId);
        return (abi.encode(policy.encryptedMaxAmount), abi.encode(policy.encryptedTotalClaims));
    }

    function getEncryptedTotals()
        external
        view
        returns (bytes memory totalPoliciesCipher, bytes memory totalBenefitRecordsCipher)
    {
        totalPoliciesCipher = abi.encode(encryptedTotalPolicies);
        totalBenefitRecordsCipher = abi.encode(encryptedTotalBenefitRecords);
    }

    function listPolicies()
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            bool[] memory statuses,
            address[] memory creators
        )
    {
        uint256 total = nextPolicyId;
        uint256 count;

        for (uint256 i = 1; i < total; i++) {
            if (policies[i].creator != address(0)) {
                count++;
            }
        }

        ids = new uint256[](count);
        names = new string[](count);
        statuses = new bool[](count);
        creators = new address[](count);

        uint256 index;
        for (uint256 i = 1; i < total; i++) {
            Policy storage policy = policies[i];
            if (policy.creator == address(0)) {
                continue;
            }
            ids[index] = i;
            names[index] = policy.name;
            statuses[index] = policy.isActive;
            creators[index] = policy.creator;
            index++;
        }
    }

    function getPoliciesByCreator(address account) external view returns (uint256[] memory) {
        uint256 length = policiesByCreator[account].length;
        uint256[] memory result = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = policiesByCreator[account][i];
        }
        return result;
    }

    function getPolicyBenefitCount(uint256 policyId) external view returns (uint256) {
        _ensurePolicyExists(policyId);
        return policyBenefits[policyId].length;
    }

    function getEncryptedBenefitRecord(uint256 policyId, uint256 index)
        external
        view
        returns (bytes32 recordId, address member, uint256 createdAt, bytes memory encryptedAmount)
    {
        _ensurePolicyExists(policyId);
        if (index >= policyBenefits[policyId].length) revert InvalidBenefitIndex();

        EncryptedBenefit storage record = policyBenefits[policyId][index];
        return (record.recordId, record.member, record.createdAt, abi.encode(record.encryptedAmount));
    }

    function hasPolicy(uint256 policyId) external view returns (bool) {
        return policies[policyId].creator != address(0);
    }

    /// -----------------------------------------------------------------------
    /// Internal helpers
    /// -----------------------------------------------------------------------

    function _createPolicy(
        string memory name,
        string memory description,
        euint64 encryptedMaxAmount
    ) internal returns (uint256) {
        uint256 policyId = nextPolicyId++;

        Policy storage policy = policies[policyId];
        policy.name = name;
        policy.description = description;
        policy.creator = msg.sender;
        policy.createdAt = block.timestamp;
        policy.isActive = true;
        policy.encryptedMaxAmount = encryptedMaxAmount;
        FHE.allowThis(encryptedMaxAmount);
        policy.encryptedTotalClaims = FHE.asEuint64(0);
        FHE.allowThis(policy.encryptedTotalClaims);

        policiesByCreator[msg.sender].push(policyId);

        encryptedTotalPolicies = FHE.add(encryptedTotalPolicies, FHE.asEuint64(1));
        FHE.allowThis(encryptedTotalPolicies);

        emit PolicyCreated(policyId, msg.sender, name);
        return policyId;
    }

    function _recordBenefit(uint256 policyId, euint64 encryptedAmount) internal returns (bytes32) {
        Policy storage policy = _getPolicy(policyId);
        if (!policy.isActive) revert PolicyInactive();

        bytes32 recordId = keccak256(
            abi.encodePacked(policyId, msg.sender, block.timestamp, block.number, policyBenefits[policyId].length)
        );

        policyBenefits[policyId].push(
            EncryptedBenefit({
                recordId: recordId,
                member: msg.sender,
                createdAt: block.timestamp,
                encryptedAmount: encryptedAmount
            })
        );

        policy.encryptedTotalClaims = FHE.add(policy.encryptedTotalClaims, encryptedAmount);
        FHE.allowThis(policy.encryptedTotalClaims);

        encryptedTotalBenefitRecords = FHE.add(encryptedTotalBenefitRecords, FHE.asEuint64(1));
        FHE.allowThis(encryptedTotalBenefitRecords);

        emit EncryptedBenefitRecorded(recordId, policyId, msg.sender);
        return recordId;
    }

    function _getPolicy(uint256 policyId) internal view returns (Policy storage policy) {
        policy = policies[policyId];
        if (policy.creator == address(0)) revert PolicyNotFound();
    }

    function _ensurePolicyExists(uint256 policyId) internal view {
        if (policies[policyId].creator == address(0)) revert PolicyNotFound();
    }
}
