// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, euint32, euint8, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IPolicyManager} from "../interfaces/IPolicyManager.sol";
import {IAccessControl} from "../interfaces/IAccessControl.sol";

/**
 * @title PolicyManager
 * @dev FHE-encrypted policy management contract - manages benefit policies with encrypted parameters
 * @notice Implements FHE encryption for privacy-preserving policy management
 * @dev Updated for fhEVM 0.9.1 - inherits ZamaEthereumConfig for automatic coprocessor setup
 */
contract PolicyManager is IPolicyManager, ZamaEthereumConfig {
    
    // ============ State Variables ============
    
    IAccessControl public accessControl;
    
    struct EncryptedPolicy {
        string name;                    // Policy name (not encrypted for display)
        string description;            // Policy description (not encrypted for display)
        bool isActive;                 // Active status (not encrypted for access control)
        euint64 encryptedMaxAmount;     // Encrypted maximum benefit amount
        euint32 encryptedCreatedAt;    // Encrypted creation timestamp
        euint8 encryptedPriority;       // Encrypted priority level
        address creator;                // Creator address (not encrypted for access control)
    }
    
    mapping(uint256 => EncryptedPolicy) public encryptedPolicies;
    uint256 public nextPolicyId = 1;
    uint256 public totalPolicies;
    
    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        require(
            accessControl.hasRole(accessControl.GOVERNOR_ROLE(), msg.sender) ||
            accessControl.hasRole(accessControl.COUNCIL_ROLE(), msg.sender),
            "Not authorized"
        );
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _accessControl) {
        accessControl = IAccessControl(_accessControl);
    }
    
    // ============ Core Functions ============
    
    function createPolicy(
        string memory name,
        string memory description,
        uint256 maxAmount
    ) external onlyAuthorized returns (uint256) {
        uint256 policyId = nextPolicyId++;
        
        // Encrypt the policy parameters using FHE (fhEVM 0.9.1)
        euint64 encryptedMaxAmount = FHE.asEuint64(uint64(maxAmount));
        FHE.allowThis(encryptedMaxAmount);
        euint32 encryptedCreatedAt = FHE.asEuint32(uint32(block.timestamp));
        FHE.allowThis(encryptedCreatedAt);
        euint8 encryptedPriority = FHE.asEuint8(uint8(1)); // Default priority level
        FHE.allowThis(encryptedPriority);
        
        encryptedPolicies[policyId] = EncryptedPolicy({
            name: name,
            description: description,
            isActive: true,
            encryptedMaxAmount: encryptedMaxAmount,
            encryptedCreatedAt: encryptedCreatedAt,
            encryptedPriority: encryptedPriority,
            creator: msg.sender
        });
        
        totalPolicies++;
        
        emit PolicyCreated(policyId, name, maxAmount, msg.sender);
        return policyId;
    }
    
    function createEncryptedPolicy(
        string memory name,
        string memory description,
        bytes calldata encryptedMaxAmount,
        bytes calldata encryptedPriority
    ) external onlyAuthorized returns (uint256) {
        uint256 policyId = nextPolicyId++;
        
        // Use provided encrypted data (fhEVM 0.9.1)
        // For actual FHE usage, encrypted data should be decoded properly
        euint64 encryptedMaxAmountValue = FHE.asEuint64(uint64(0)); // Placeholder
        FHE.allowThis(encryptedMaxAmountValue);
        euint32 encryptedCreatedAt = FHE.asEuint32(uint32(block.timestamp));
        FHE.allowThis(encryptedCreatedAt);
        euint8 encryptedPriorityValue = FHE.asEuint8(uint8(0)); // Placeholder
        FHE.allowThis(encryptedPriorityValue);
        
        encryptedPolicies[policyId] = EncryptedPolicy({
            name: name,
            description: description,
            isActive: true,
            encryptedMaxAmount: encryptedMaxAmountValue,
            encryptedCreatedAt: encryptedCreatedAt,
            encryptedPriority: encryptedPriorityValue,
            creator: msg.sender
        });
        
        totalPolicies++;
        
        emit PolicyCreated(policyId, name, 0, msg.sender); // Amount is encrypted, so we pass 0
        return policyId;
    }
    
    function updatePolicy(
        uint256 policyId,
        string memory name,
        string memory description,
        uint256 maxAmount
    ) external onlyAuthorized {
        require(policyId < nextPolicyId, "Policy does not exist");
        
        encryptedPolicies[policyId].name = name;
        encryptedPolicies[policyId].description = description;
        euint64 newMaxAmount = FHE.asEuint64(uint64(maxAmount));
        FHE.allowThis(newMaxAmount);
        encryptedPolicies[policyId].encryptedMaxAmount = newMaxAmount;

        emit PolicyUpdated(policyId, name, maxAmount);
    }
    
    function updateEncryptedPolicy(
        uint256 policyId,
        string memory name,
        string memory description,
        bytes calldata encryptedMaxAmount
    ) external onlyAuthorized {
        require(policyId < nextPolicyId, "Policy does not exist");
        
        encryptedPolicies[policyId].name = name;
        encryptedPolicies[policyId].description = description;
        euint64 newMaxAmount = FHE.asEuint64(uint64(0)); // Placeholder
        FHE.allowThis(newMaxAmount);
        encryptedPolicies[policyId].encryptedMaxAmount = newMaxAmount;

        emit PolicyUpdated(policyId, name, 0); // Amount is encrypted
    }
    
    function activatePolicy(uint256 policyId) external onlyAuthorized {
        require(policyId < nextPolicyId, "Policy does not exist");
        encryptedPolicies[policyId].isActive = true;
        emit PolicyActivated(policyId);
    }
    
    function deactivatePolicy(uint256 policyId) external onlyAuthorized {
        require(policyId < nextPolicyId, "Policy does not exist");
        encryptedPolicies[policyId].isActive = false;
        emit PolicyDeactivated(policyId);
    }
    
    // ============ FHE Operations ============
    
    function comparePolicyAmounts(uint256 policyId1, uint256 policyId2) external view returns (bool) {
        require(policyId1 < nextPolicyId && policyId2 < nextPolicyId, "Policy does not exist");
        
        // Compare encrypted amounts using FHE
        euint64 amount1 = encryptedPolicies[policyId1].encryptedMaxAmount;
        euint64 amount2 = encryptedPolicies[policyId2].encryptedMaxAmount;
        
        // This would return an encrypted boolean result
        // In a real implementation, you would use FHE comparison operations
        return true; // Placeholder
    }
    
    function addToPolicyAmount(uint256 policyId, uint256 amount) external onlyAuthorized {
        require(policyId < nextPolicyId, "Policy does not exist");

        euint64 currentAmount = encryptedPolicies[policyId].encryptedMaxAmount;
        euint64 additionalAmount = FHE.asEuint64(uint64(amount));

        // Add encrypted amounts using FHE (fhEVM 0.9.1)
        euint64 newAmount = FHE.add(currentAmount, additionalAmount);
        FHE.allowThis(newAmount);
        encryptedPolicies[policyId].encryptedMaxAmount = newAmount;
    }
    
    // ============ View Functions ============
    
    function getPolicyDetails(uint256 policyId) external view returns (
        string memory name,
        string memory description,
        bool isActive,
        uint256 maxAmount
    ) {
        require(policyId < nextPolicyId, "Policy does not exist");
        EncryptedPolicy memory policy = encryptedPolicies[policyId];
        return (policy.name, policy.description, policy.isActive, 0); // Amount is encrypted
    }
    
    function isPolicyActive(uint256 policyId) external view returns (bool) {
        if (policyId >= nextPolicyId) return false;
        return encryptedPolicies[policyId].isActive;
    }
    
    function getActivePolicies() external view returns (
        uint256[] memory policyIds,
        string[] memory names,
        string[] memory descriptions,
        bool[] memory isActive,
        uint256[] memory maxAmounts
    ) {
        uint256 activeCount = 0;
        
        // Count active policies
        for (uint256 i = 1; i < nextPolicyId; i++) {
            if (encryptedPolicies[i].isActive) {
                activeCount++;
            }
        }
        
        // Create arrays
        policyIds = new uint256[](activeCount);
        names = new string[](activeCount);
        descriptions = new string[](activeCount);
        isActive = new bool[](activeCount);
        maxAmounts = new uint256[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 1; i < nextPolicyId; i++) {
            if (encryptedPolicies[i].isActive) {
                policyIds[index] = i;
                names[index] = encryptedPolicies[i].name;
                descriptions[index] = encryptedPolicies[i].description;
                isActive[index] = encryptedPolicies[i].isActive;
                maxAmounts[index] = 0; // Amount is encrypted
                index++;
            }
        }
        
        return (policyIds, names, descriptions, isActive, maxAmounts);
    }
    
    function getTotalPolicies() external view returns (uint256) {
        return totalPolicies;
    }
    
    function getEncryptedPolicyAmount(uint256 policyId) external view returns (bytes memory) {
        require(policyId < nextPolicyId, "Policy does not exist");
        return abi.encode(encryptedPolicies[policyId].encryptedMaxAmount);
    }
    
    function getEncryptedPolicyPriority(uint256 policyId) external view returns (bytes memory) {
        require(policyId < nextPolicyId, "Policy does not exist");
        return abi.encode(encryptedPolicies[policyId].encryptedPriority);
    }
}